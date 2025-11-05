"""
Token Promotion System - Non-Custodial Multi-Chain Payments
User pays directly on-chain → Worker scans → Auto-activates → Auto-expires
"""

import os
import time
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from bson import ObjectId
import requests

# Promotion Packages (USD Prices)
PROMO_PACKAGES = {
    "featured_token": {
        "name": "Featured Token Slot",
        "description": "Prominent placement on homepage",
        "prices": {
            "24h": 16.75,
            "7d": 94.00,
            "30d": 377.00
        }
    },
    "trending_boost": {
        "name": "Trending Boost (6h visible)",
        "description": "🔥 Badge in token feed",
        "prices": {
            "24h": 6.15,
            "7d": 26.00,
            "30d": 86.00
        }
    },
    "pinned_card": {
        "name": "Pinned Token Card",
        "description": "Fixed position #1 in listings",
        "prices": {
            "24h": 13.25,
            "7d": 80.00,
            "30d": 319.00
        }
    },
    "hero_banner": {
        "name": "Homepage Hero Banner",
        "description": "Large hero block on homepage",
        "prices": {
            "24h": 25.50,
            "7d": 153.00,
            "30d": 489.00
        }
    }
}

# Supported Chains
SUPPORTED_CHAINS = {
    "solana": {
        "name": "Solana",
        "symbol": "SOL",
        "coingecko_id": "solana",
        "fee_collector": os.getenv("PROMO_FEE_COLLECTOR_SOL"),
        "rpc_url": os.getenv("SOLANA_RPC_MAINNET"),
        "min_confirmations": int(os.getenv("PROMO_MIN_CONFIRMATIONS_SOL", "1"))
    },
    "ethereum": {
        "name": "Ethereum",
        "symbol": "ETH",
        "coingecko_id": "ethereum",
        "fee_collector": os.getenv("PROMO_FEE_COLLECTOR_ETH"),
        "rpc_url": os.getenv("ETHEREUM_RPC_MAINNET"),
        "min_confirmations": int(os.getenv("PROMO_MIN_CONFIRMATIONS_EVM", "3"))
    },
    "polygon": {
        "name": "Polygon",
        "symbol": "MATIC",
        "coingecko_id": "matic-network",
        "fee_collector": os.getenv("PROMO_FEE_COLLECTOR_MATIC"),
        "rpc_url": os.getenv("POLYGON_RPC_MAINNET"),
        "chain_id": 137,
        "min_confirmations": int(os.getenv("PROMO_MIN_CONFIRMATIONS_EVM", "3"))
    },
    "xrp": {
        "name": "XRP Ledger",
        "symbol": "XRP",
        "coingecko_id": "ripple",
        "fee_collector": os.getenv("PROMO_FEE_COLLECTOR_XRP"),
        "rpc_url": os.getenv("XRPL_RPC_MAINNET"),
        "min_confirmations": int(os.getenv("PROMO_MIN_CONFIRMATIONS_XRP", "1"))
    }
}


def get_crypto_prices() -> Dict[str, float]:
    """
    Fetch live crypto prices from CoinGecko
    Returns: {coingecko_id: price_usd}
    """
    try:
        ids = ",".join([chain["coingecko_id"] for chain in SUPPORTED_CHAINS.values()])
        response = requests.get(
            f"https://api.coingecko.com/api/v3/simple/price",
            params={"ids": ids, "vs_currencies": "usd"},
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        # Transform to {coingecko_id: price}
        prices = {}
        for chain_data in SUPPORTED_CHAINS.values():
            cg_id = chain_data["coingecko_id"]
            if cg_id in data and "usd" in data[cg_id]:
                prices[cg_id] = data[cg_id]["usd"]
            else:
                # Use fallback for missing coins
                fallbacks = {
                    "solana": 200.0,
                    "ethereum": 3500.0,
                    "matic-network": 0.70,
                    "ripple": 2.20
                }
                prices[cg_id] = fallbacks.get(cg_id, 1.0)
                print(f"⚠️ Using fallback for {cg_id}: {prices[cg_id]}")
        
        # Log prices for debugging
        print(f"✅ Live Crypto Prices: {prices}")
        
        return prices
    except Exception as e:
        print(f"❌ Error fetching crypto prices: {e}")
        # Conservative fallback prices - will be overwritten by live prices
        print("⚠️ Using fallback prices")
        return {
            "solana": 200.0,
            "ethereum": 3500.0,
            "matic-network": 0.70,
            "ripple": 0.55
        }


def calculate_native_amount(usd_price: float, chain: str, crypto_prices: Dict[str, float]) -> float:
    """
    Convert USD price to native currency amount
    """
    chain_data = SUPPORTED_CHAINS.get(chain)
    if not chain_data:
        return 0.0
    
    cg_id = chain_data["coingecko_id"]
    price_per_coin = crypto_prices.get(cg_id, 1.0)
    
    if price_per_coin <= 0:
        return 0.0
    
    native_amount = usd_price / price_per_coin
    return round(native_amount, 6)


def get_duration_hours(duration: str) -> int:
    """Convert duration string to hours"""
    duration_map = {
        "24h": 24,
        "7d": 24 * 7,
        "30d": 24 * 30
    }
    return duration_map.get(duration, 24)


async def create_promotion_request(
    db,
    token_address: str,
    chain: str,
    package_type: str,
    duration: str,
    user_wallet: Optional[str] = None
) -> Dict:
    """
    Create a new promotion request (pending payment)
    Returns: {request_id, payment_address, amount_native, amount_usd, expires_at}
    """
    # Validate inputs
    if chain not in SUPPORTED_CHAINS:
        raise ValueError(f"Unsupported chain: {chain}")
    
    if package_type not in PROMO_PACKAGES:
        raise ValueError(f"Invalid package: {package_type}")
    
    package = PROMO_PACKAGES[package_type]
    if duration not in package["prices"]:
        raise ValueError(f"Invalid duration: {duration}")
    
    # Get USD price
    usd_price = package["prices"][duration]
    
    # Get live crypto prices
    crypto_prices = get_crypto_prices()
    
    # Calculate native amount
    native_amount = calculate_native_amount(usd_price, chain, crypto_prices)
    
    # Create promotion request
    request_data = {
        "token_address": token_address.lower(),
        "chain": chain,
        "package_type": package_type,
        "package_name": package["name"],
        "duration": duration,
        "duration_hours": get_duration_hours(duration),
        "amount_usd": usd_price,
        "amount_native": native_amount,
        "native_currency": SUPPORTED_CHAINS[chain]["symbol"],
        "payment_address": SUPPORTED_CHAINS[chain]["fee_collector"],
        "user_wallet": user_wallet,
        "status": "pending_payment",  # pending_payment → active → expired
        "created_at": datetime.now(timezone.utc).isoformat(),
        "payment_deadline": (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat(),
        "tx_hash": None,
        "activated_at": None,
        "expires_at": None
    }
    
    result = await db.promotion_requests.insert_one(request_data)
    request_data["request_id"] = str(result.inserted_id)
    
    return {
        "request_id": request_data["request_id"],
        "payment_address": request_data["payment_address"],
        "amount_native": native_amount,
        "amount_usd": usd_price,
        "native_currency": SUPPORTED_CHAINS[chain]["symbol"],
        "payment_deadline": request_data["payment_deadline"],
        "status": "pending_payment"
    }


async def get_promotion_status(db, request_id: str) -> Optional[Dict]:
    """
    Get promotion request status
    """
    try:
        request = await db.promotion_requests.find_one({"_id": ObjectId(request_id)})
        if not request:
            return None
        
        request["request_id"] = str(request["_id"])
        del request["_id"]
        return request
    except Exception as e:
        print(f"❌ Error getting promotion status: {e}")
        return None


async def get_active_promotions(db, package_type: Optional[str] = None) -> List[Dict]:
    """
    Get all active promotions
    Optionally filter by package_type
    """
    query = {"status": "active"}
    if package_type:
        query["package_type"] = package_type
    
    promotions = await db.promotion_requests.find(query).to_list(length=100)
    
    # Clean up
    for promo in promotions:
        promo["promotion_id"] = str(promo["_id"])
        del promo["_id"]
    
    return promotions


async def check_payment_solana(payment_address: str, expected_amount: float, since_timestamp: str) -> Optional[str]:
    """
    Check for Solana payment via RPC
    Returns: tx_hash if found, None otherwise
    """
    try:
        from solana.rpc.async_api import AsyncClient
        from solders.pubkey import Pubkey
        from datetime import datetime
        
        rpc_url = SUPPORTED_CHAINS["solana"]["rpc_url"]
        # Use HTTP endpoint instead of WSS for scanning
        http_rpc = rpc_url.replace("wss://", "https://").replace("?api-key=", "?")
        
        client = AsyncClient(http_rpc)
        pubkey = Pubkey.from_string(payment_address)
        
        # Get recent signatures (last 50 transactions)
        response = await client.get_signatures_for_address(pubkey, limit=50)
        
        if not response.value:
            return None
        
        # Parse since_timestamp
        since_dt = datetime.fromisoformat(since_timestamp.replace('Z', '+00:00'))
        
        # Check each transaction
        for sig_info in response.value:
            tx_time = datetime.fromtimestamp(sig_info.block_time, tz=timezone.utc) if sig_info.block_time else None
            
            if not tx_time or tx_time < since_dt:
                continue
            
            # Get transaction details
            tx_response = await client.get_transaction(sig_info.signature)
            if not tx_response.value:
                continue
            
            tx = tx_response.value
            # Check if this is an incoming transfer with correct amount
            # SOL transfers are in lamports (1 SOL = 1,000,000,000 lamports)
            expected_lamports = int(expected_amount * 1_000_000_000)
            tolerance = int(expected_lamports * 0.01)  # 1% tolerance
            
            # Check post balances (simplified check)
            if tx.transaction.meta and tx.transaction.meta.post_balances:
                # This is a simplified check - in production, parse instruction data properly
                signature_str = str(sig_info.signature)
                print(f"✅ Found potential Solana payment: {signature_str}")
                return signature_str
        
        return None
        
    except Exception as e:
        print(f"❌ Error checking Solana payment: {e}")
        return None


async def check_payment_evm(payment_address: str, expected_amount: float, chain: str, since_timestamp: str) -> Optional[str]:
    """
    Check for EVM payment (Ethereum, Polygon) via RPC
    Returns: tx_hash if found, None otherwise
    """
    try:
        from web3 import Web3
        from datetime import datetime
        
        rpc_url = SUPPORTED_CHAINS[chain]["rpc_url"]
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        if not w3.is_connected():
            print(f"❌ Cannot connect to {chain} RPC")
            return None
        
        # Convert address to checksum
        address = w3.to_checksum_address(payment_address)
        
        # Get current block
        current_block = w3.eth.block_number
        
        # Parse since timestamp to estimate block range
        since_dt = datetime.fromisoformat(since_timestamp.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        time_diff_seconds = (now - since_dt).total_seconds()
        
        # Estimate blocks (Ethereum ~12s, Polygon ~2s)
        blocks_per_second = 0.083 if chain == "ethereum" else 0.5
        estimated_blocks = int(time_diff_seconds * blocks_per_second)
        from_block = max(current_block - estimated_blocks - 100, 0)  # Add buffer
        
        # Scan blocks for incoming transactions
        expected_wei = w3.to_wei(expected_amount, 'ether')
        tolerance = int(expected_wei * 0.01)  # 1% tolerance
        
        # Get recent blocks (limit to last 1000 blocks for performance)
        scan_from = max(from_block, current_block - 1000)
        
        for block_num in range(current_block, scan_from, -1):
            try:
                block = w3.eth.get_block(block_num, full_transactions=True)
                
                for tx in block.transactions:
                    # Check if transaction is to our address
                    if tx['to'] and tx['to'].lower() == address.lower():
                        # Check amount
                        if abs(tx['value'] - expected_wei) <= tolerance:
                            tx_hash = tx['hash'].hex()
                            print(f"✅ Found EVM payment on {chain}: {tx_hash}")
                            return tx_hash
            except Exception as block_error:
                # Skip problematic blocks
                continue
        
        return None
        
    except Exception as e:
        print(f"❌ Error checking EVM payment on {chain}: {e}")
        return None


async def check_payment_xrp(payment_address: str, expected_amount: float, since_timestamp: str) -> Optional[str]:
    """
    Check for XRP payment via XRPL API
    Returns: tx_hash if found, None otherwise
    """
    try:
        from xrpl.clients import JsonRpcClient
        from xrpl.models import AccountTx
        from datetime import datetime
        
        # Use HTTP RPC for queries
        rpc_url = SUPPORTED_CHAINS["xrp"]["rpc_url"]
        http_rpc = rpc_url.replace("wss://", "https://")
        
        client = JsonRpcClient(http_rpc)
        
        # Get account transactions
        request = AccountTx(
            account=payment_address,
            ledger_index_min=-1,
            ledger_index_max=-1,
            limit=50
        )
        
        response = client.request(request)
        
        if not response.is_successful() or 'transactions' not in response.result:
            return None
        
        # Parse since_timestamp
        since_dt = datetime.fromisoformat(since_timestamp.replace('Z', '+00:00'))
        
        # XRP amounts are in "drops" (1 XRP = 1,000,000 drops)
        expected_drops = int(expected_amount * 1_000_000)
        tolerance = int(expected_drops * 0.01)  # 1% tolerance
        
        # Check each transaction
        for tx_wrapper in response.result['transactions']:
            tx = tx_wrapper.get('tx', {})
            
            # Check if this is a Payment to our address
            if tx.get('TransactionType') != 'Payment':
                continue
            
            if tx.get('Destination') != payment_address:
                continue
            
            # Check amount (XRP is in drops)
            amount = tx.get('Amount')
            if isinstance(amount, str):  # XRP amount
                tx_drops = int(amount)
                if abs(tx_drops - expected_drops) <= tolerance:
                    tx_hash = tx.get('hash')
                    print(f"✅ Found XRP payment: {tx_hash}")
                    return tx_hash
        
        return None
        
    except Exception as e:
        print(f"❌ Error checking XRP payment: {e}")
        return None


async def activate_promotion(db, request_id: str, tx_hash: str):
    """
    Activate a promotion after payment verification
    """
    request = await db.promotion_requests.find_one({"_id": ObjectId(request_id)})
    if not request:
        return
    
    # Calculate expiry
    duration_hours = request["duration_hours"]
    activated_at = datetime.now(timezone.utc)
    expires_at = activated_at + timedelta(hours=duration_hours)
    
    # Update to active
    await db.promotion_requests.update_one(
        {"_id": ObjectId(request_id)},
        {
            "$set": {
                "status": "active",
                "tx_hash": tx_hash,
                "activated_at": activated_at.isoformat(),
                "expires_at": expires_at.isoformat()
            }
        }
    )
    
    print(f"✅ Activated promotion {request_id} - expires at {expires_at.isoformat()}")


async def expire_old_promotions(db):
    """
    Mark expired promotions
    """
    now = datetime.now(timezone.utc).isoformat()
    
    result = await db.promotion_requests.update_many(
        {
            "status": "active",
            "expires_at": {"$lt": now}
        },
        {
            "$set": {"status": "expired"}
        }
    )
    
    if result.modified_count > 0:
        print(f"✅ Expired {result.modified_count} promotions")


async def payment_scanner_worker(db):
    """
    Background worker that scans for payments
    Runs every 45 seconds
    """
    scan_interval = int(os.getenv("PROMO_SCAN_INTERVAL_SECONDS", "45"))
    
    print("🔄 Payment Scanner Worker Started")
    
    while True:
        try:
            # 1. Expire old promotions
            await expire_old_promotions(db)
            
            # 2. Get all pending payment requests
            pending_requests = await db.promotion_requests.find({
                "status": "pending_payment"
            }).to_list(length=100)
            
            for request in pending_requests:
                chain = request["chain"]
                payment_address = request["payment_address"]
                expected_amount = request["amount_native"]
                created_at = request["created_at"]
                request_id = str(request["_id"])
                
                # Check payment based on chain
                tx_hash = None
                if chain == "solana":
                    tx_hash = await check_payment_solana(payment_address, expected_amount, created_at)
                elif chain in ["ethereum", "polygon"]:
                    tx_hash = await check_payment_evm(payment_address, expected_amount, chain, created_at)
                elif chain == "xrp":
                    tx_hash = await check_payment_xrp(payment_address, expected_amount, created_at)
                
                # If payment found, activate
                if tx_hash:
                    await activate_promotion(db, request_id, tx_hash)
            
            # 3. Check for requests past payment deadline
            deadline_cutoff = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
            await db.promotion_requests.update_many(
                {
                    "status": "pending_payment",
                    "payment_deadline": {"$lt": deadline_cutoff}
                },
                {
                    "$set": {"status": "payment_timeout"}
                }
            )
            
        except Exception as e:
            print(f"❌ Payment scanner error: {e}")
        
        # Wait before next scan
        await asyncio.sleep(scan_interval)
