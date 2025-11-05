# 🎯 Referral System - Complete Implementation Guide

## Overview
Complete non-custodial referral system with automatic 10% fee split for EVM chains (Ethereum, BSC, Polygon, Base, Arbitrum, Optimism).

---

## 📦 What's Implemented

### ✅ Phase 1: EVM Chains (COMPLETE)

#### **Smart Contract (FeeTakingRouterV2.sol)**
- ✅ Referral mapping (user → referrer) stored on-chain
- ✅ Automatic 90/10 fee split (90% platform, 10% referrer)
- ✅ One-time referral registration per user
- ✅ Native token support (ETH/BNB/MATIC swaps)
- ✅ Events for tracking (ReferralRegistered, ReferralRewardPaid)
- ✅ Emergency recovery functions
- ✅ Router whitelisting for security

#### **Backend APIs (`server.py`)**
- ✅ `GET /api/referral/code/{wallet}` - Get or create referral code
- ✅ `POST /api/referral/redeem` - Redeem code
- ✅ `GET /api/referral/eligible/{wallet}` - Check free swap eligibility
- ✅ `POST /api/referral/validate` - Validate code
- ✅ `GET /api/referral/stats/{wallet}` - Get stats (off-chain + on-chain)
- ✅ `GET /api/referral/on-chain/{wallet}` - Check on-chain registration
- ✅ `POST /api/referral/prepare-tx` - Prepare registration transaction

#### **Contract Integration (`contract_integration.py`)**
- ✅ Web3 integration for all EVM chains
- ✅ Read on-chain referral data
- ✅ Prepare transactions for frontend signing
- ✅ Multi-chain support (ETH, BSC, Polygon, Base, Arbitrum, Optimism)

#### **Frontend Components**
- ✅ `ReferralCodeDisplay.jsx` - Show code in wallet dropdown
- ✅ `ReferralCodeInput.jsx` - Apply code on swap page
- ✅ `ReferralsPage.jsx` - Dashboard with stats
- ✅ Integration in `SwapFormV3.jsx`

---

## 🚀 How It Works

### User Flow

**1. Referrer Gets Code**
```
User A connects wallet → Backend generates unique code (e.g., "SWAP3X7Q")
User A shares code with friends
```

**2. Referee Applies Code**
```
User B visits swap page with code
Enters code → Backend validates
Backend maps: User B → User A (in MongoDB)
```

**3. First Swap (On-Chain Registration)**
```
User B makes first swap
Frontend calls: registerReferral(referrerAddress) on smart contract
Transaction signed by User B
On-chain mapping created: User B → User A
```

**4. Subsequent Swaps (Automatic Rewards)**
```
User B makes swap
Smart contract checks: Does User B have referrer?
YES → Split fee: 90% platform, 10% to referrer (User A)
Rewards sent directly to User A's wallet
```

### Technical Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     REFERRAL SYSTEM FLOW                     │
└─────────────────────────────────────────────────────────────┘

1. CODE GENERATION (Off-Chain)
   ┌──────────┐
   │ User A   │ connects wallet
   └────┬─────┘
        │
        ▼
   ┌──────────┐    GET /api/referral/code/0xUserA
   │ Backend  │ ──────────────────────────────────►
   └────┬─────┘    Generates: "SWAP3X7Q"
        │
        ▼
   ┌──────────┐
   │ MongoDB  │ stores: code ↔ wallet mapping
   └──────────┘

2. CODE REDEMPTION (Off-Chain)
   ┌──────────┐
   │ User B   │ enters code "SWAP3X7Q"
   └────┬─────┘
        │
        ▼
   ┌──────────┐    POST /api/referral/redeem
   │ Backend  │ ──────────────────────────────────►
   └────┬─────┘    Validates code, saves mapping
        │
        ▼
   ┌──────────┐
   │ MongoDB  │ stores: User B → User A
   └──────────┘

3. FIRST SWAP (On-Chain Registration)
   ┌──────────┐
   │ User B   │ makes first swap
   └────┬─────┘
        │
        ▼
   ┌──────────┐    Fetch referrer wallet
   │ Frontend │ ──────────────────────────────────►
   │          │    POST /api/referral/prepare-tx
   └────┬─────┘    Get transaction data
        │
        ▼
   ┌──────────┐    Sign & send transaction
   │ MetaMask │ ──────────────────────────────────►
   └────┬─────┘    registerReferral(0xUserA)
        │
        ▼
   ┌────────────────┐
   │ Smart Contract │ stores on-chain: User B → User A
   └────────────────┘

4. AUTOMATIC REWARDS (Every Swap)
   ┌──────────┐
   │ User B   │ swaps 100 USDT → ETH
   └────┬─────┘
        │
        ▼
   ┌────────────────┐
   │ Smart Contract │ checks: referrers[User B] = User A?
   │                │ YES → Split 0.2% fee:
   │                │   - 0.18% → Platform (90%)
   │                │   - 0.02% → User A (10%)
   └────────────────┘
        │
        ▼
   User A receives rewards directly in wallet! 🎉
```

---

## 🔧 Setup Instructions

### 1. Deploy Smart Contract

Follow the deployment guide: `/app/contracts/DEPLOYMENT_GUIDE.md`

**Quick Steps:**
```bash
# 1. Test on Sepolia testnet first
npx hardhat run scripts/deploy-router-v2.js --network sepolia

# 2. Deploy to mainnet
npx hardhat run scripts/deploy-router-v2.js --network ethereum
npx hardhat run scripts/deploy-router-v2.js --network bsc
npx hardhat run scripts/deploy-router-v2.js --network polygon
```

### 2. Configure Backend

Add contract addresses to `/app/backend/.env`:
```bash
# Contract Addresses (get from deployment)
CONTRACT_ROUTER_V2_ETH=0x...
CONTRACT_ROUTER_V2_BSC=0x...
CONTRACT_ROUTER_V2_POLYGON=0x...
CONTRACT_ROUTER_V2_BASE=0x...
CONTRACT_ROUTER_V2_ARBITRUM=0x...
CONTRACT_ROUTER_V2_OPTIMISM=0x...

# Fee Recipient (your treasury/multisig)
FEE_RECIPIENT_ADDRESS=0x...

# RPC Endpoints (for contract reads)
RPC_ETH=https://eth.llamarpc.com
RPC_BSC=https://bsc-dataseed.binance.org
RPC_POLYGON=https://polygon-rpc.com
```

### 3. Whitelist DEX Routers

Whitelist DEX routers that users can swap through:
```javascript
// Example: Whitelist Uniswap V2 on Ethereum
const router = await ethers.getContractAt("FeeTakingRouterV2", CONTRACT_ADDRESS);
await router.setRouterAllowed(UNISWAP_V2_ROUTER, true);

// Common routers:
// Ethereum: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D (Uniswap V2)
// BSC: 0x10ED43C718714eb63d5aA57B78B54704E256024E (PancakeSwap)
// Polygon: 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff (QuickSwap)
```

### 4. Restart Backend
```bash
sudo supervisorctl restart backend
```

---

## 🧪 Testing

### Backend API Testing
```bash
# 1. Generate referral code
curl http://localhost:8001/api/referral/code/0xYourWallet

# 2. Validate code
curl -X POST http://localhost:8001/api/referral/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"SWAP3X7Q"}'

# 3. Redeem code
curl -X POST http://localhost:8001/api/referral/redeem \
  -H "Content-Type: application/json" \
  -d '{"wallet":"0xUserB","code":"SWAP3X7Q"}'

# 4. Check on-chain registration
curl "http://localhost:8001/api/referral/on-chain/0xUserB?chain_id=1"

# 5. Get stats
curl http://localhost:8001/api/referral/stats/0xUserA
```

### Frontend Testing
1. Connect wallet on `/swap` page
2. Check referral code appears in wallet dropdown
3. Enter referral code on swap form
4. Make first swap (registers on-chain)
5. Check referrer rewards on `/referrals` page

### Smart Contract Testing (Hardhat)
```javascript
describe("FeeTakingRouterV2", function () {
  it("Should register referral", async function () {
    await router.connect(user).registerReferral(referrer.address);
    const [ref, hasRef] = await router.getReferralInfo(user.address);
    expect(hasRef).to.be.true;
    expect(ref).to.equal(referrer.address);
  });

  it("Should split fees correctly", async function () {
    // Register referral
    await router.connect(user).registerReferral(referrer.address);
    
    // Execute swap
    await router.connect(user).swapViaRouter(/* params */);
    
    // Check referrer received 10% of fee
    const [count, rewards] = await router.getReferrerStats(referrer.address);
    expect(count).to.equal(1);
    expect(rewards).to.be.gt(0);
  });
});
```

---

## 📊 Monitoring & Analytics

### On-Chain Events
Monitor these events for analytics:
```solidity
event ReferralRegistered(address indexed user, address indexed referrer, uint256 timestamp);
event ReferralRewardPaid(address indexed referrer, address indexed user, address token, uint256 amount);
event SwapExecuted(address indexed user, ...);
```

### Backend Endpoints
```javascript
// Get aggregated stats
GET /api/referral/stats/{wallet}

// Response includes:
{
  "code": "SWAP3X7Q",
  "total_referrals": 5,
  "rewards": 0,
  "referred_users": [...],
  "on_chain": {
    "total_referrals": 5,
    "by_chain": [
      {"chain": "ethereum", "referral_count": 3, "total_rewards": 0.05},
      {"chain": "bsc", "referral_count": 2, "total_rewards": 0.1}
    ]
  }
}
```

---

## 🔒 Security

### Contract Security
- ✅ ReentrancyGuard on all swap functions
- ✅ Owner functions protected by Ownable
- ✅ Router whitelist prevents malicious contracts
- ✅ Max fee limit (1%) enforced
- ✅ Emergency recovery for stuck tokens

### Best Practices
1. **Multisig Ownership**: Transfer contract ownership to Gnosis Safe
2. **Router Audits**: Only whitelist audited DEX routers
3. **Regular Monitoring**: Watch contract events for anomalies
4. **Rate Limiting**: Backend APIs have rate limits
5. **Input Validation**: All user inputs validated

---

## 🌐 Multi-Chain Status

| Chain | Status | Contract | Notes |
|-------|--------|----------|-------|
| Ethereum | ✅ Ready | Deploy needed | Highest gas, use for large swaps |
| BSC | ✅ Ready | Deploy needed | Low gas, good for testing |
| Polygon | ✅ Ready | Deploy needed | Low gas, fast confirmations |
| Base | ✅ Ready | Deploy needed | Low gas, growing ecosystem |
| Arbitrum | ✅ Ready | Deploy needed | L2, low gas |
| Optimism | ✅ Ready | Deploy needed | L2, low gas |
| **Solana** | 🔜 Phase 2 | Rust Program needed | Different architecture |
| **Tron** | 🔜 Phase 2 | TronContract.sol | Similar to EVM |
| **XRP** | 🔜 Phase 3 | Hooks/Backend | Limited smart contract support |

---

## 🎨 Frontend Components

### ReferralCodeDisplay
Location: Wallet dropdown
- Shows user's referral code
- Copy code button
- Share link button
- Shows referral count

### ReferralCodeInput
Location: Swap form (below token selector)
- Input field for entering code
- Apply button
- Validation feedback
- Free swap indicator

### ReferralsPage
Location: `/referrals`
- Overview cards (referrals, earnings)
- Referral link with copy
- Referred users list
- Leaderboard
- On-chain rewards display

---

## 💰 Economics

### Fee Structure
- **Platform Fee**: 0.2% (20 basis points)
- **Referral Split**: 10% of platform fee
- **Effective Rates**:
  - Platform gets: 0.18% (90% of 0.2%)
  - Referrer gets: 0.02% (10% of 0.2%)

### Example
```
Swap: 10,000 USDT → ETH
Platform Fee (0.2%): 20 USDT
├─ Platform (90%): 18 USDT
└─ Referrer (10%): 2 USDT

Referrer earns $2 per $10,000 swap
100 referrals @ $10k each = $200 earnings
```

---

## 📚 Additional Resources

- **Smart Contract Code**: `/app/contracts/FeeTakingRouterV2.sol`
- **Deployment Guide**: `/app/contracts/DEPLOYMENT_GUIDE.md`
- **Backend Integration**: `/app/backend/contract_integration.py`
- **API Docs**: Check `server.py` for all endpoints

---

## 🆘 Support

### Common Issues

**"Router not whitelisted"**
- Solution: Whitelist DEX router via `setRouterAllowed()`

**"Referral already registered"**
- Solution: User can only register once. Check with `getReferralInfo()`

**"Cannot refer yourself"**
- Solution: User and referrer must be different addresses

**Contract not deployed**
- Solution: Deploy contract and update `.env` with address

---

## 🚀 Next Steps

### Phase 2: Solana (Coming Next)
- Rust program development
- Anchor framework integration
- Jupiter aggregator compatibility

### Phase 3: Tron
- TronContract.sol deployment
- SunSwap integration

### Phase 4: XRP Ledger
- XRP Hooks research
- Backend hybrid solution

---

## 📝 License
MIT License - See LICENSE file

---

## 👨‍💻 Development Status

**Phase 1 (EVM Chains): COMPLETE ✅**
- Smart contract: ✅
- Backend APIs: ✅
- Frontend: ✅
- Documentation: ✅
- Ready for deployment: ✅

**Phase 2-4 (Solana, Tron, XRP): PENDING ⏳**
- Starting development next
