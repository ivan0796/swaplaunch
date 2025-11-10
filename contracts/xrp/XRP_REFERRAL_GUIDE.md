# XRP Ledger Referral System - Implementation Guide

## Overview
XRP Ledger referral system with automatic fee splitting using a hybrid approach combining **native smart contracts** (2025+) and **backend tracking** for immediate deployment.

---

## XRP Ledger Capabilities (2025)

### Available Options:

#### **Option 1: Native Smart Contracts (AlphaNet/2026 Mainnet)** ✅ Fully Non-Custodial
- EVM-compatible smart contracts on Layer-1
- Similar to Ethereum/Solidity
- Currently on **AlphaNet testnet**
- Mainnet expected Q1-Q2 2026

#### **Option 2: Hooks (Available Now)** ⚠️ Limited Functionality
- Lightweight Wasm modules
- Trigger on ledger events
- Limited to payment interception
- No complex state management

#### **Option 3: Backend Hybrid** ✅ Recommended for Now
- Track referrals in backend
- Auto-split fees via Payment Channels
- Works immediately on mainnet
- Upgrade to smart contracts when available

---

## Recommended Approach: Backend Hybrid

Since native smart contracts are not yet on mainnet, we use a hybrid approach:

### Architecture

```
┌─────────────────────────────────────────────────┐
│           XRP REFERRAL SYSTEM (HYBRID)          │
└─────────────────────────────────────────────────┘

1. REFERRAL TRACKING (Off-Chain)
   ┌──────────┐
   │ MongoDB  │ Stores: user → referrer mapping
   └──────────┘

2. FEE COLLECTION (On-Chain)
   ┌──────────┐
   │ Platform │ Receives swap fees automatically
   │  Wallet  │ (via DEX integration)
   └──────────┘

3. REWARD DISTRIBUTION (Automated)
   ┌──────────┐
   │ Backend  │ Calculates 10% rewards
   │  Script  │ Sends XRP via Payment API
   └──────────┘

4. UPGRADE PATH (2026+)
   ┌──────────┐
   │ Native   │ Move to smart contracts
   │ Contract │ when mainnet ready
   └──────────┘
```

---

## Implementation

### 1. Backend Setup

#### Install XRP Library
```bash
cd /app/backend
pip install xrpl-py
```

#### Create `/app/backend/xrp_integration.py`
```python
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import Payment
from xrpl.transaction import submit_and_wait
from xrpl.utils import xrp_to_drops, drops_to_xrp
import os
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# XRP Configuration
XRP_MAINNET = "https://s1.ripple.com:51234"
XRP_TESTNET = "https://s.altnet.rippletest.net:51234"

# Load from environment
NETWORK = os.environ.get('XRP_NETWORK', 'mainnet')
PLATFORM_WALLET_SEED = os.environ.get('XRP_PLATFORM_WALLET_SEED')
CLIENT_URL = XRP_MAINNET if NETWORK == 'mainnet' else XRP_TESTNET

client = JsonRpcClient(CLIENT_URL)


def get_platform_wallet() -> Wallet:
    """Get platform wallet from seed"""
    if not PLATFORM_WALLET_SEED:
        raise ValueError("XRP_PLATFORM_WALLET_SEED not configured")
    
    return Wallet.from_seed(PLATFORM_WALLET_SEED)


async def send_referral_reward(
    referrer_address: str,
    amount_xrp: float,
    memo: str = "Referral Reward"
) -> Dict:
    """
    Send XRP reward to referrer
    
    Args:
        referrer_address: Referrer's XRP address
        amount_xrp: Amount in XRP (e.g., 0.5)
        memo: Transaction memo
    
    Returns:
        Transaction result
    """
    try:
        platform_wallet = get_platform_wallet()
        
        # Convert XRP to drops (1 XRP = 1,000,000 drops)
        amount_drops = xrp_to_drops(amount_xrp)
        
        # Create payment transaction
        payment = Payment(
            account=platform_wallet.classic_address,
            destination=referrer_address,
            amount=amount_drops,
            memos=[{
                "Memo": {
                    "MemoData": memo.encode().hex(),
                    "MemoType": "text/plain".encode().hex()
                }
            }]
        )
        
        # Submit and wait for validation
        response = submit_and_wait(payment, client, platform_wallet)
        
        if response.result.get("meta", {}).get("TransactionResult") == "tesSUCCESS":
            return {
                "success": True,
                "tx_hash": response.result["hash"],
                "amount_xrp": amount_xrp,
                "referrer": referrer_address
            }
        else:
            logger.error(f"XRP payment failed: {response.result}")
            return {
                "success": False,
                "error": response.result.get("meta", {}).get("TransactionResult")
            }
            
    except Exception as e:
        logger.error(f"Error sending XRP reward: {e}")
        return {
            "success": False,
            "error": str(e)
        }


async def get_wallet_balance(address: str) -> Optional[float]:
    """Get XRP balance for address"""
    try:
        account_info = client.request({
            "command": "account_info",
            "account": address,
            "ledger_index": "current"
        })
        
        if account_info.result.get("account_data"):
            balance_drops = account_info.result["account_data"]["Balance"]
            return drops_to_xrp(balance_drops)
        
        return None
        
    except Exception as e:
        logger.error(f"Error getting XRP balance: {e}")
        return None


async def validate_xrp_address(address: str) -> bool:
    """Validate XRP address format"""
    try:
        # XRP addresses start with 'r' and are 25-35 chars
        if not address.startswith('r') or len(address) < 25:
            return False
        
        # Try to get account info
        account_info = client.request({
            "command": "account_info",
            "account": address,
            "ledger_index": "current"
        })
        
        return account_info.result.get("account_data") is not None
        
    except:
        return False


# Automatic reward distribution (called after each swap)
async def distribute_referral_reward_xrp(
    user_address: str,
    swap_fee_xrp: float,
    referrers_collection
):
    """
    Check if user has referrer and distribute 10% reward
    
    Args:
        user_address: User who made the swap
        swap_fee_xrp: Total platform fee collected (in XRP)
        referrers_collection: MongoDB collection
    """
    try:
        # Check if user has referrer
        user_data = await referrers_collection.find_one({
            "wallet": user_address.lower()
        })
        
        if not user_data or not user_data.get("referrer"):
            logger.info(f"No referrer for {user_address}")
            return None
        
        referrer = user_data["referrer"]
        
        # Calculate 10% reward
        reward_xrp = swap_fee_xrp * 0.10
        
        # Minimum reward threshold (avoid micro-transactions)
        MIN_REWARD_XRP = 0.1  # 0.1 XRP minimum
        
        if reward_xrp < MIN_REWARD_XRP:
            logger.info(f"Reward too small: {reward_xrp} XRP. Accumulating...")
            
            # Accumulate for later payout
            await referrers_collection.update_one(
                {"wallet": referrer.lower()},
                {
                    "$inc": {"pending_rewards_xrp": reward_xrp},
                    "$push": {
                        "reward_history": {
                            "user": user_address,
                            "amount": reward_xrp,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "status": "pending"
                        }
                    }
                },
                upsert=True
            )
            
            return {"status": "accumulated", "amount": reward_xrp}
        
        # Send reward immediately
        result = await send_referral_reward(
            referrer_address=referrer,
            amount_xrp=reward_xrp,
            memo=f"Referral reward from {user_address[:10]}..."
        )
        
        if result["success"]:
            # Update database
            await referrers_collection.update_one(
                {"wallet": referrer.lower()},
                {
                    "$inc": {
                        "total_rewards_xrp": reward_xrp,
                        "total_referrals": 1
                    },
                    "$push": {
                        "reward_history": {
                            "user": user_address,
                            "amount": reward_xrp,
                            "tx_hash": result["tx_hash"],
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "status": "paid"
                        }
                    }
                },
                upsert=True
            )
            
            logger.info(f"✅ Sent {reward_xrp} XRP to {referrer} (TX: {result['tx_hash']})")
        
        return result
        
    except Exception as e:
        logger.error(f"Error distributing XRP reward: {e}")
        return {"success": False, "error": str(e)}
```

---

### 2. Add API Endpoints

In `/app/backend/server.py`:

```python
from xrp_integration import (
    send_referral_reward,
    get_wallet_balance,
    validate_xrp_address,
    distribute_referral_reward_xrp
)

@api_router.get("/referral/xrp/balance/{address}")
async def get_xrp_balance(address: str):
    """Get XRP balance for address"""
    balance = await get_wallet_balance(address)
    if balance is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"address": address, "balance_xrp": balance}

@api_router.post("/referral/xrp/validate")
async def validate_xrp_addr(request: Dict[str, str]):
    """Validate XRP address"""
    address = request.get("address")
    if not address:
        raise HTTPException(status_code=400, detail="Address required")
    
    is_valid = await validate_xrp_address(address)
    return {"address": address, "valid": is_valid}

@api_router.get("/referral/xrp/stats/{address}")
async def get_xrp_referral_stats(address: str):
    """Get referrer stats for XRP"""
    referrer_data = await db.referrals.find_one({"wallet": address.lower()})
    
    if not referrer_data:
        return {
            "total_rewards_xrp": 0,
            "pending_rewards_xrp": 0,
            "total_referrals": 0,
            "reward_history": []
        }
    
    return {
        "total_rewards_xrp": referrer_data.get("total_rewards_xrp", 0),
        "pending_rewards_xrp": referrer_data.get("pending_rewards_xrp", 0),
        "total_referrals": referrer_data.get("total_referrals", 0),
        "reward_history": referrer_data.get("reward_history", [])
    }

# Batch payout for accumulated rewards
@api_router.post("/referral/xrp/batch-payout")
async def batch_payout_xrp(min_amount: float = 1.0):
    """
    Pay out all accumulated rewards above threshold
    Called periodically (e.g., daily cron job)
    """
    referrers = await db.referrals.find({
        "pending_rewards_xrp": {"$gte": min_amount}
    }).to_list(length=None)
    
    results = []
    
    for referrer in referrers:
        amount = referrer["pending_rewards_xrp"]
        address = referrer["wallet"]
        
        result = await send_referral_reward(
            referrer_address=address,
            amount_xrp=amount,
            memo="Accumulated referral rewards"
        )
        
        if result["success"]:
            # Update database
            await db.referrals.update_one(
                {"wallet": address},
                {
                    "$inc": {
                        "total_rewards_xrp": amount,
                        "pending_rewards_xrp": -amount
                    },
                    "$push": {
                        "reward_history": {
                            "amount": amount,
                            "tx_hash": result["tx_hash"],
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "status": "paid",
                            "type": "batch_payout"
                        }
                    }
                }
            )
        
        results.append({
            "address": address,
            "amount": amount,
            "result": result
        })
    
    return {
        "total_payouts": len(results),
        "successful": sum(1 for r in results if r["result"]["success"]),
        "failed": sum(1 for r in results if not r["result"]["success"]),
        "details": results
    }
```

---

### 3. Environment Configuration

Add to `/app/backend/.env`:
```bash
# XRP Ledger Configuration
XRP_NETWORK=mainnet  # or 'testnet'
XRP_PLATFORM_WALLET_SEED=your_secret_seed_here

# Reward Thresholds
XRP_MIN_REWARD=0.1  # Minimum instant payout
XRP_BATCH_THRESHOLD=1.0  # Minimum for batch payout
```

---

### 4. Create Platform Wallet

**For Testnet:**
```python
from xrpl.wallet import generate_faucet_wallet
from xrpl.clients import JsonRpcClient

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
wallet = generate_faucet_wallet(client)

print("Address:", wallet.classic_address)
print("Seed:", wallet.seed)  # Save this securely!
```

**For Mainnet:**
1. Use XRPL wallet (e.g., Xaman)
2. Create new wallet
3. Save seed phrase securely
4. Fund with XRP
5. Add seed to `.env`

---

### 5. Frontend Integration

#### Check XRP Balance
```typescript
async function getXRPBalance(address: string) {
  const response = await fetch(
    `${API}/api/referral/xrp/balance/${address}`
  );
  const data = await response.json();
  return data.balance_xrp;
}
```

#### Validate Address
```typescript
async function validateXRPAddress(address: string) {
  const response = await fetch(
    `${API}/api/referral/xrp/validate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    }
  );
  const data = await response.json();
  return data.valid;
}
```

#### Get Stats
```typescript
async function getXRPReferralStats(address: string) {
  const response = await fetch(
    `${API}/api/referral/xrp/stats/${address}`
  );
  return await response.json();
}
```

---

## Automatic Reward Distribution

### Integration with Swap Flow

When a user completes a swap on XRP:

```python
# In your swap completion handler
@api_router.post("/xrp/swap/complete")
async def complete_xrp_swap(swap_data: Dict):
    user_address = swap_data["user_address"]
    platform_fee_xrp = swap_data["platform_fee"]
    
    # Distribute referral reward automatically
    reward_result = await distribute_referral_reward_xrp(
        user_address=user_address,
        swap_fee_xrp=platform_fee_xrp,
        referrers_collection=db.referrals
    )
    
    return {
        "swap_complete": True,
        "referral_reward": reward_result
    }
```

---

## Scheduled Tasks

### Daily Batch Payout (Cron Job)

Create `/app/backend/cron_jobs.py`:

```python
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('cron', hour=0, minute=0)  # Daily at midnight
async def daily_xrp_batch_payout():
    """Pay out accumulated XRP rewards daily"""
    logger.info("Starting daily XRP batch payout...")
    
    result = await batch_payout_xrp(min_amount=1.0)
    
    logger.info(f"Batch payout complete: {result['successful']} successful, {result['failed']} failed")

scheduler.start()
```

---

## Security Considerations

### 1. Wallet Security
- Store seed in environment variable (never in code)
- Use encrypted .env file
- Consider hardware wallet integration for production

### 2. Transaction Limits
- Set daily/monthly payout limits
- Implement rate limiting
- Monitor unusual activity

### 3. Address Validation
- Always validate XRP addresses before sending
- Check account exists and is activated
- Verify minimum balance (20 XRP reserve)

---

## Cost Analysis

### XRP Transaction Costs
- **Base Fee**: 0.00001 XRP per transaction (~$0.000027 at $2.70/XRP)
- **Extremely cheap** compared to EVM chains
- Can process thousands of transactions for $1

### Reward Strategy
- **Instant**: Pay immediately for rewards > 0.1 XRP
- **Batch**: Accumulate smaller rewards, pay daily
- **Optimal**: Minimizes transactions while keeping users happy

---

## Monitoring Dashboard

### Track Key Metrics
```sql
-- MongoDB Queries
db.referrals.aggregate([
  { $group: {
      _id: null,
      total_rewards_paid: { $sum: "$total_rewards_xrp" },
      total_pending: { $sum: "$pending_rewards_xrp" },
      total_referrers: { $sum: 1 }
  }}
])
```

### Example Output
```json
{
  "total_rewards_paid": 1234.56,
  "total_pending": 89.12,
  "total_referrers": 450,
  "average_reward": 2.74
}
```

---

## Future: Native Smart Contracts (2026+)

When XRP native smart contracts launch on mainnet:

### Migration Path
1. Deploy smart contract (similar to EVM version)
2. Migrate referral mappings on-chain
3. Update frontend to interact with contract
4. Deprecate backend payout system
5. Fully non-custodial! 🎉

### Contract Template (EVM-compatible)
```solidity
// Will be compatible with FeeTakingRouterV2.sol
// Just deploy on XRP mainnet when ready
```

---

## Testing

### Testnet Testing
1. Use testnet faucet for XRP
2. Test referral registration
3. Simulate swaps and payouts
4. Verify transactions on testnet explorer

### Testnet Explorer
https://testnet.xrpl.org

---

## Resources

- **XRP Ledger Docs**: https://xrpl.org
- **xrpl-py Library**: https://xrpl-py.readthedocs.io
- **Smart Contracts (AlphaNet)**: https://xrpl.org/docs/evm-sidechain
- **Hooks**: https://xrpl-hooks.readme.io

---

## Summary

**Current Solution (Hybrid)**:
- ✅ Works immediately on mainnet
- ✅ Automatic reward distribution
- ✅ Very low transaction costs
- ⚠️ Requires platform wallet (semi-custodial)

**Future Solution (Smart Contracts)**:
- ⏳ Wait for mainnet launch (2026)
- ✅ Fully non-custodial
- ✅ No backend wallet needed
- ✅ Similar to EVM implementation

---

## License
MIT License
