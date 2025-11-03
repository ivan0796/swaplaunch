from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx
import asyncio
import hashlib

# Import tiered fee calculator
from fee_calculator import (
    calculate_tiered_fee,
    get_fallback_fee,
    calculate_net_amount_in,
    FEE_TIERED_ENABLED
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="SwapLaunch API", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Simple in-memory cache for quotes
quote_cache = {}
CACHE_TTL = 10  # seconds

# Chain configuration
CHAIN_CONFIG = {
    "ethereum": {
        "chain_id": 1, 
        "rpc": os.environ.get('RPC_ETH'), 
        "api_base": "https://api.0x.org"  # v2 API uses main domain for all chains
    },
    "bsc": {
        "chain_id": 56, 
        "rpc": os.environ.get('RPC_BSC'), 
        "api_base": "https://api.0x.org"  # v2 uses chainId parameter instead of subdomain
    },
    "polygon": {
        "chain_id": 137, 
        "rpc": os.environ.get('RPC_POLYGON'), 
        "api_base": "https://api.0x.org"  # v2 uses chainId parameter instead of subdomain
    },
    "solana": {
        "chain_id": 0, 
        "rpc": os.environ.get('RPC_SOLANA'), 
        "api_base": os.environ.get('JUPITER_API_URL')
    }
}

# Define Models
class SwapLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_address: str
    chain: str
    chain_id: int
    token_in: str
    token_out: str
    amount_in: str
    amount_out: str
    fee_amount: str
    fee_percentage: str
    tx_hash: Optional[str] = None
    status: str = "pending"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SwapLogCreate(BaseModel):
    wallet_address: str
    chain: str
    chain_id: int
    token_in: str
    token_out: str
    amount_in: str
    amount_out: str
    fee_amount: str
    fee_percentage: str = "0.2"
    tx_hash: Optional[str] = None
    status: str = "pending"
    referrer: Optional[str] = None  # Referral tracking

class ReferralLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    referrer_wallet: str
    trader_wallet: str
    chain: str
    token_pair: str
    swap_amount: str
    tx_hash: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReferralLogCreate(BaseModel):
    referrer_wallet: str
    trader_wallet: str
    chain: str
    token_pair: str
    swap_amount: str
    tx_hash: Optional[str] = None

class EVMQuoteRequest(BaseModel):
    sellToken: str
    buyToken: str
    sellAmount: str
    takerAddress: str
    chain: str = "ethereum"

class SolanaQuoteRequest(BaseModel):
    inputMint: str
    outputMint: str
    amount: str
    slippageBps: int = 50
    takerPublicKey: str

@api_router.get("/")
async def root():
    return {
        "message": "SwapLaunch API v2.0",
        "status": "operational",
        "supported_chains": ["ethereum", "bsc", "polygon", "solana"],
        "features": ["multi-chain", "non-custodial", "0.2% platform fee"]
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "cache_size": len(quote_cache),
        "chains_configured": list(CHAIN_CONFIG.keys())
    }

# Price cache for USD valuation
price_cache = {}
PRICE_CACHE_TTL = 60  # 1 minute

async def get_token_price_usd(token_address: str, chain: str, amount_wei: str) -> Optional[float]:
    """
    Get USD value of token amount using same price sources as swap path.
    Returns None if price unavailable.
    
    Args:
        token_address: Token contract address
        chain: Chain name (ethereum, bsc, polygon)
        amount_wei: Amount in wei/smallest unit
        
    Returns:
        USD value or None
    """
    cache_key = f"{chain}:{token_address}"
    
    # Check cache
    if cache_key in price_cache:
        cached_price, cached_time = price_cache[cache_key]
        if (datetime.now(timezone.utc).timestamp() - cached_time) < PRICE_CACHE_TTL:
            try:
                amount_decimal = float(amount_wei) / (10 ** 18)  # Assume 18 decimals
                return amount_decimal * cached_price
            except:
                return None
    
    try:
        # Use CoinGecko or similar price API
        # For now, we'll use a simple heuristic based on common tokens
        # In production, integrate with your existing price oracle
        
        # Placeholder: Try to get price from 0x price API or CoinGecko
        # This should use the SAME oracle as your swap routing
        
        # For common tokens, use approximate prices (this should be replaced with real oracle)
        common_prices = {
            "ethereum": {
                "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": 3500.0,  # ETH
                "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 1.0,      # USDC
                "0xdac17f958d2ee523a2206206994597c13d831ec7": 1.0,      # USDT
            },
            "bsc": {
                "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": 670.0,   # BNB
                "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": 1.0,     # USDC
            },
            "polygon": {
                "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": 0.37,    # MATIC
                "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": 1.0,     # USDC
            }
        }
        
        price_usd = common_prices.get(chain, {}).get(token_address.lower())
        
        if price_usd:
            price_cache[cache_key] = (price_usd, datetime.now(timezone.utc).timestamp())
            amount_decimal = float(amount_wei) / (10 ** 18)
            return amount_decimal * price_usd
            
        return None
        
    except Exception as e:
        logger.error(f"Error getting token price: {e}")
        return None


@api_router.post("/evm/quote")
async def get_evm_quote(request: EVMQuoteRequest):
    """
    Get swap quote for EVM chains (Ethereum, BSC, Polygon) via 0x API
    
    NEW IN v1-tiered:
    - Dynamic tiered fees based on trade USD value
    - No custody: fee applied by reducing input amount
    - Returns: feeTier, feePercent, feeUsd, netAmountIn, quoteVersion
    """
    chain = request.chain.lower()
    
    if chain not in ["ethereum", "bsc", "polygon"]:
        raise HTTPException(status_code=400, detail=f"Unsupported EVM chain: {chain}")
    
    chain_config = CHAIN_CONFIG[chain]
    
    # Step 1: Calculate USD value and tiered fee
    fee_info = None
    net_amount_in = request.sellAmount
    
    if FEE_TIERED_ENABLED:
        try:
            # Get USD value of input amount
            amount_usd = await get_token_price_usd(
                request.sellToken,
                chain,
                request.sellAmount
            )
            
            if amount_usd is not None:
                # Calculate tiered fee
                fee_info = calculate_tiered_fee(amount_usd)
                
                # Calculate net amount after fee deduction
                net_amount_in = calculate_net_amount_in(request.sellAmount, fee_info)
                
                logger.info(
                    f"Tiered fee applied: {amount_usd:.2f} USD → "
                    f"Tier {fee_info['fee_tier']} ({fee_info['fee_percent']}%) → "
                    f"Fee: ${fee_info['fee_usd']:.2f}"
                )
            else:
                # Fallback if USD price unavailable
                fee_info = get_fallback_fee("Token price not available")
                net_amount_in = calculate_net_amount_in(request.sellAmount, fee_info)
                logger.warning(f"Using fallback fee for {chain}:{request.sellToken}")
                
        except Exception as e:
            logger.error(f"Error calculating tiered fee: {e}")
            fee_info = get_fallback_fee(f"Fee calculation error: {str(e)}")
            net_amount_in = calculate_net_amount_in(request.sellAmount, fee_info)
    else:
        # Feature flag disabled: use legacy fixed fee
        fee_info = {
            "fee_tier": "LEGACY",
            "fee_percent": 0.20,
            "fee_usd": None,
            "amount_in_usd": None,
            "next_tier": None,
            "notes": "Legacy fixed fee (0.2%)",
            "quote_version": "v1-legacy"
        }
        net_amount_in = request.sellAmount
    
    # Step 2: Create cache key with net amount
    cache_key = f"{chain}:{request.sellToken}:{request.buyToken}:{net_amount_in}:{request.takerAddress}"
    
    # Check cache
    if cache_key in quote_cache:
        cached_data, cached_time = quote_cache[cache_key]
        if (datetime.now(timezone.utc).timestamp() - cached_time) < CACHE_TTL:
            logger.info(f"Returning cached EVM quote for {chain}")
            return cached_data
    
    # Get fee configuration
    fee_recipient = os.environ.get('FEE_RECIPIENT_EVM')
    if chain == "polygon":
        fee_recipient = os.environ.get('FEE_RECIPIENT_POLY', fee_recipient)
    
    # NOTE: We no longer use buyTokenPercentageFee in 0x API
    # Instead, we reduce the input amount by our fee
    # This ensures non-custodial behavior: user signs tx with net amount
    
    # Build 0x API request with NET amount (after fee deduction)
    params = {
        "chainId": str(chain_config["chain_id"]),
        "sellToken": request.sellToken,
        "buyToken": request.buyToken,
        "sellAmount": net_amount_in,  # Use net amount after fee
        "taker": request.takerAddress
    }
    
    headers = {
        "0x-version": "v2"
    }
    api_key = os.environ.get('ZEROX_API_KEY')
    if api_key:
        headers["0x-api-key"] = api_key
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            api_url = f"{chain_config['api_base']}/swap/allowance-holder/quote"
            
            logger.info(f"Requesting 0x v2 quote: {api_url}")
            
            response = await http_client.get(
                api_url,
                params=params,
                headers=headers
            )
            
            logger.info(f"0x API v2 response status: {response.status_code}")
            
            if response.status_code == 200:
                quote_data = response.json()
                
                # Add tiered fee information to response
                quote_data["chain"] = chain
                quote_data["chain_id"] = chain_config["chain_id"]
                quote_data["feeRecipient"] = fee_recipient
                
                # NEW: Add tiered fee fields (non-breaking)
                quote_data["feeTier"] = fee_info["fee_tier"]
                quote_data["feePercent"] = fee_info["fee_percent"]
                quote_data["feeUsd"] = fee_info["fee_usd"]
                quote_data["amountInUsd"] = fee_info["amount_in_usd"]
                quote_data["netAmountIn"] = net_amount_in
                quote_data["originalAmountIn"] = request.sellAmount
                quote_data["nextTier"] = fee_info["next_tier"]
                quote_data["notes"] = fee_info["notes"]
                quote_data["quoteVersion"] = fee_info["quote_version"]
                
                # Legacy field for backward compatibility
                quote_data["platformFee"] = f"{fee_info['fee_percent']}%"
                
                # Ensure critical fields exist
                if not quote_data.get("transaction") or not quote_data["transaction"].get("data"):
                    logger.error(f"Invalid quote response - missing transaction data: {quote_data}")
                    raise HTTPException(
                        status_code=500,
                        detail="Invalid quote response from 0x API - missing transaction data"
                    )
                
                # Log swap for analytics (pseudonymized)
                if request.takerAddress:
                    wallet_hash = hashlib.sha256(request.takerAddress.encode()).hexdigest()[:16]
                    logger.info(
                        f"EVM Quote | Wallet: {wallet_hash} | Chain: {chain} | "
                        f"Route: {request.sellToken[:6]}→{request.buyToken[:6]} | "
                        f"Amount: ${fee_info.get('amount_in_usd', 'N/A')} | "
                        f"Tier: {fee_info['fee_tier']} | Fee: {fee_info['fee_percent']}% (${fee_info.get('fee_usd', 'N/A')})"
                    )
                
                # Cache the response
                quote_cache[cache_key] = (quote_data, datetime.now(timezone.utc).timestamp())
                logger.info(f"EVM quote fetched for {chain}: {request.sellToken} -> {request.buyToken}")
                return quote_data
            else:
                error_detail = response.text
                logger.error(f"0x API v2 error on {chain}: {response.status_code} - {error_detail}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"0x API v2 error: {error_detail}"
                )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request to 0x API timed out")
    except Exception as e:
        logger.error(f"Error fetching EVM quote: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching quote: {str(e)}")

@api_router.post("/solana/quote")
async def get_solana_quote(request: SolanaQuoteRequest):
    """
    Get swap quote for Solana via Jupiter API
    
    NEW IN v1-tiered:
    - Dynamic tiered fees based on trade USD value
    - No custody: fee applied by reducing input amount before routing
    - Returns: feeTier, feePercent, feeUsd, netAmountIn, quoteVersion
    """
    
    # Step 1: Calculate USD value and tiered fee
    fee_info = None
    net_amount_in = request.amount
    
    if FEE_TIERED_ENABLED:
        try:
            # Get USD value of input amount
            # For Solana, we need to use Jupiter or similar price oracle
            # Placeholder: Approximate SOL price (should use real oracle)
            sol_price_usd = 180.0  # This should come from real price feed
            
            # Assume input is SOL or convert using price API
            # For now, use simple heuristic
            amount_decimal = float(request.amount) / (10 ** 9)  # SOL has 9 decimals
            amount_usd = amount_decimal * sol_price_usd
            
            if amount_usd is not None and amount_usd > 0:
                # Calculate tiered fee
                fee_info = calculate_tiered_fee(amount_usd)
                
                # Calculate net amount after fee deduction
                net_amount_in = calculate_net_amount_in(request.amount, fee_info)
                
                logger.info(
                    f"Tiered fee applied (Solana): {amount_usd:.2f} USD → "
                    f"Tier {fee_info['fee_tier']} ({fee_info['fee_percent']}%) → "
                    f"Fee: ${fee_info['fee_usd']:.2f}"
                )
            else:
                # Fallback if USD price unavailable
                fee_info = get_fallback_fee("SOL price not available")
                net_amount_in = calculate_net_amount_in(request.amount, fee_info)
                logger.warning(f"Using fallback fee for Solana")
                
        except Exception as e:
            logger.error(f"Error calculating tiered fee (Solana): {e}")
            fee_info = get_fallback_fee(f"Fee calculation error: {str(e)}")
            net_amount_in = calculate_net_amount_in(request.amount, fee_info)
    else:
        # Feature flag disabled: use legacy fixed fee
        fee_info = {
            "fee_tier": "LEGACY",
            "fee_percent": 0.20,
            "fee_usd": None,
            "amount_in_usd": None,
            "next_tier": None,
            "notes": "Legacy fixed fee (0.2%)",
            "quote_version": "v1-legacy"
        }
        net_amount_in = request.amount
    
    # Step 2: Create cache key with net amount
    cache_key = f"solana:{request.inputMint}:{request.outputMint}:{net_amount_in}"
    
    # Check cache
    if cache_key in quote_cache:
        cached_data, cached_time = quote_cache[cache_key]
        if (datetime.now(timezone.utc).timestamp() - cached_time) < CACHE_TTL:
            logger.info("Returning cached Solana quote")
            return cached_data
    
    jupiter_api = os.environ.get('JUPITER_API_URL')
    fee_recipient = os.environ.get('FEE_RECIPIENT_SOL')
    
    # Get quote from Jupiter with NET amount (after fee deduction)
    params = {
        "inputMint": request.inputMint,
        "outputMint": request.outputMint,
        "amount": net_amount_in,  # Use net amount after fee
        "slippageBps": request.slippageBps
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            # Get quote
            quote_response = await http_client.get(
                f"{jupiter_api}/quote",
                params=params
            )
            
            if quote_response.status_code != 200:
                raise HTTPException(
                    status_code=quote_response.status_code,
                    detail=f"Jupiter API error: {quote_response.text}"
                )
            
            quote_data = quote_response.json()
            
            output_amount = int(quote_data.get("outAmount", 0))
            
            result = {
                "chain": "solana",
                "quote": quote_data,
                
                # NEW: Add tiered fee fields (non-breaking)
                "feeTier": fee_info["fee_tier"],
                "feePercent": fee_info["fee_percent"],
                "feeUsd": fee_info["fee_usd"],
                "amountInUsd": fee_info["amount_in_usd"],
                "netAmountIn": net_amount_in,
                "originalAmountIn": request.amount,
                "nextTier": fee_info["next_tier"],
                "notes": fee_info["notes"],
                "quoteVersion": fee_info["quote_version"],
                
                # Output amounts
                "outputAmount": str(output_amount),
                
                # Legacy field for backward compatibility
                "platformFee": f"{fee_info['fee_percent']}%",
                "feeRecipient": fee_recipient,
                
                # Instructions note
                "instructions": {
                    "note": "Non-custodial: Fee deducted from input. User signs all transactions."
                }
            }
            
            # Log swap for analytics (pseudonymized)
            if request.userPublicKey:
                wallet_hash = hashlib.sha256(request.userPublicKey.encode()).hexdigest()[:16]
                logger.info(
                    f"Solana Quote | Wallet: {wallet_hash} | "
                    f"Route: {request.inputMint[:6]}→{request.outputMint[:6]} | "
                    f"Amount: ${fee_info.get('amount_in_usd', 'N/A')} | "
                    f"Tier: {fee_info['fee_tier']} | Fee: {fee_info['fee_percent']}% (${fee_info.get('fee_usd', 'N/A')})"
                )
            
            # Cache the response
            quote_cache[cache_key] = (result, datetime.now(timezone.utc).timestamp())
            logger.info(f"Solana quote fetched: {request.inputMint} -> {request.outputMint}")
            return result
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request to Jupiter API timed out")
    except Exception as e:
        logger.error(f"Error fetching Solana quote: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching quote: {str(e)}")

@api_router.post("/swaps", response_model=SwapLog)
async def log_swap(swap_data: SwapLogCreate):
    """
    Log a completed or pending swap transaction
    """
    swap_obj = SwapLog(**swap_data.model_dump())
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = swap_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.swaps.insert_one(doc)
    logger.info(f"Swap logged: {swap_obj.chain} - {swap_obj.tx_hash}")
    return swap_obj

@api_router.get("/swaps", response_model=List[SwapLog])
async def get_swaps(
    wallet_address: Optional[str] = Query(None, description="Filter by wallet address"),
    chain: Optional[str] = Query(None, description="Filter by chain")
):
    """
    Get swap history with optional filters
    """
    query = {}
    if wallet_address:
        query['wallet_address'] = wallet_address
    if chain:
        query['chain'] = chain.lower()
    
    swaps = await db.swaps.find(query, {"_id": 0}).sort("timestamp", -1).to_list(100)
    
    # Convert ISO string timestamps back to datetime objects
    for swap in swaps:
        if isinstance(swap['timestamp'], str):
            swap['timestamp'] = datetime.fromisoformat(swap['timestamp'])
    
    return swaps

@api_router.get("/test-quote")
async def test_quote_endpoint(
    chain: str = "ethereum",
    sellToken: str = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    buyToken: str = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
):
    """
    Test endpoint to debug 0x API v2 integration
    """
    chain_config = CHAIN_CONFIG.get(chain)
    if not chain_config:
        return {"error": f"Chain {chain} not found"}
    
    # Test request with v2 parameters
    params = {
        "chainId": str(chain_config["chain_id"]),
        "sellToken": sellToken,
        "buyToken": buyToken,
        "sellAmount": "1000000000000000000",  # 1 ETH
        "taker": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
    }
    
    headers = {
        "0x-version": "v2"
    }
    api_key = os.environ.get('ZEROX_API_KEY')
    if api_key:
        headers["0x-api-key"] = api_key
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            # Try v2 price endpoint
            url_v2 = f"{chain_config['api_base']}/swap/allowance-holder/price"
            response_v2 = await http_client.get(url_v2, params=params, headers=headers)
            
            result = {
                "chain": chain,
                "api_base": chain_config['api_base'],
                "has_api_key": bool(api_key),
                "v2_endpoint": {
                    "url": url_v2,
                    "status": response_v2.status_code,
                    "headers_sent": dict(headers),
                    "params_sent": params
                }
            }
            
            if response_v2.status_code == 200:
                data = response_v2.json()
                result["v2_endpoint"]["success"] = True
                result["v2_endpoint"]["buyAmount"] = data.get("buyAmount", "N/A")
                result["v2_endpoint"]["price"] = data.get("price", "N/A")
            else:
                result["v2_endpoint"]["error"] = response_v2.text[:500]
            
            return result
    except Exception as e:
        return {"error": str(e)}

@api_router.get("/chains")
async def get_supported_chains():
    """
    Get list of supported chains with configuration
    """
    chains = []
    for chain_name, config in CHAIN_CONFIG.items():
        chains.append({
            "name": chain_name,
            "chain_id": config["chain_id"],
            "rpc_configured": config["rpc"] is not None,
            "type": "solana" if chain_name == "solana" else "evm"
        })
    return {"chains": chains, "count": len(chains)}

@api_router.post("/referrals", response_model=ReferralLog)
async def log_referral(referral_data: ReferralLogCreate):
    """
    Log a referral swap for tracking
    """
    referral_obj = ReferralLog(**referral_data.model_dump())
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = referral_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.swap_referrals.insert_one(doc)
    logger.info(f"Referral logged: {referral_obj.referrer_wallet} -> {referral_obj.trader_wallet}")
    return referral_obj

@api_router.get("/legacy-referrals/{wallet_address}")
async def get_legacy_referral_stats(wallet_address: str):
    """
    Get legacy referral statistics for a wallet (deprecated - use /api/referrals/stats/{wallet} instead)
    """
    referrals = await db.swap_referrals.find(
        {"referrer_wallet": wallet_address},
        {"_id": 0}
    ).to_list(1000)
    
    total_referrals = len(referrals)
    chains_used = {}
    
    for ref in referrals:
        chain = ref.get('chain', 'unknown')
        chains_used[chain] = chains_used.get(chain, 0) + 1
    
    return {
        "wallet": wallet_address,
        "total_referrals": total_referrals,
        "chains_breakdown": chains_used,
        "referrals": referrals[:50]  # Last 50
    }

from coinmarketcap_service import cmc_service

# ==============================================
# PRICE DATA ENDPOINTS (CoinMarketCap)
# ==============================================

@api_router.get("/cmc/trending")
async def get_trending_tokens():
    """
    Get trending tokens from CoinMarketCap
    """
    try:
        data = await cmc_service.get_trending_tokens()
        return data
    except Exception as e:
        logger.error(f"Error fetching trending tokens: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/cmc/price/{symbol}")
async def get_coin_price(symbol: str):
    """
    Get coin price from CoinMarketCap by symbol
    """
    try:
        data = await cmc_service.get_coin_price(symbol)
        if data:
            return data
        else:
            raise HTTPException(status_code=404, detail="Token not found")
    except Exception as e:
        logger.error(f"Error fetching coin price: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================
# TOKEN DISCOVERY ENDPOINTS
# ==============================================

# Cache for token discovery data
discovery_cache = {}
DISCOVERY_CACHE_TTL = 60  # 60 seconds for trending/discovery data

@api_router.get("/trending/categories")
async def get_trending_categories(category: str = Query("top", regex="^(top|gainers|losers)$")):
    """
    Get trending/top tokens from CoinMarketCap
    Top = Top coins by market cap (Bitcoin, Ethereum, XRP, etc.)
    Gainers = Top gainers by 24h price change
    Losers = Top losers by 24h price change
    """
    cache_key = f"trending_{category}"
    current_time = datetime.now(timezone.utc).timestamp()
    
    # Check cache
    if cache_key in discovery_cache:
        cached_data, cached_time = discovery_cache[cache_key]
        if current_time - cached_time < (DISCOVERY_CACHE_TTL * 6):  # 6 min cache
            logger.info(f"Returning cached trending {category}")
            return cached_data
    
    try:
        # Get data from CoinMarketCap
        tokens = await cmc_service.get_top_tokens(limit=15, category=category)
        
        if not tokens:
            logger.warning(f"No data from CoinMarketCap for category: {category}")
            return {"category": category, "tokens": [], "error": "No data"}
        
        # Process tokens
        processed_tokens = []
        for token in tokens:
            processed_token = {
                "id": token.get("id", ""),
                "symbol": token.get("symbol", "").upper(),
                "name": token.get("name", ""),
                "image": token.get("image", ""),
                "current_price": token.get("current_price", 0),
                "price_change_24h": token.get("price_change_24h", 0),
                "market_cap": token.get("market_cap", 0),
                "market_cap_rank": token.get("market_cap_rank", 0),
                "volume_24h": token.get("volume_24h", 0)
            }
            processed_tokens.append(processed_token)
        
        result = {
            "category": category,
            "tokens": processed_tokens,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Cache result
        discovery_cache[cache_key] = (result, current_time)
        logger.info(f"Successfully fetched {len(processed_tokens)} tokens for {category}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in trending categories: {str(e)}")
        return {"category": category, "tokens": [], "error": str(e)}


@api_router.get("/dex/new-listings")
async def get_new_dex_listings(chain: Optional[str] = Query(None)):
    """
    Get newest DEX listings from Dexscreener
    Uses latest profile endpoint with age filter
    """
    cache_key = f"new_listings_{chain or 'all'}"
    current_time = datetime.now(timezone.utc).timestamp()
    
    # Check cache (5 min for new listings)
    if cache_key in discovery_cache:
        cached_data, cached_time = discovery_cache[cache_key]
        if current_time - cached_time < 300:
            return cached_data
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            # Use Dexscreener latest profile endpoint - shows newest tokens
            response = await http_client.get(
                "https://api.dexscreener.com/token-profiles/latest/v1",
                headers={"Accept": "application/json"}
            )
            
            if response.status_code == 429:
                logger.warning("Dexscreener rate limit for new listings")
                return {"pairs": [], "note": "Rate limited, try again later"}
            
            if response.status_code != 200:
                logger.warning(f"Dexscreener API error: {response.status_code}")
                # Fallback to search for recent listings
                try:
                    fallback_response = await http_client.get(
                        "https://api.dexscreener.com/latest/dex/search?q=",
                        headers={"Accept": "application/json"}
                    )
                    if fallback_response.status_code == 200:
                        fallback_data = fallback_response.json()
                        pairs = fallback_data.get("pairs", [])[:20]
                    else:
                        return {"pairs": [], "note": "DEX data temporarily unavailable"}
                except:
                    return {"pairs": [], "note": "DEX data temporarily unavailable"}
            else:
                # Process profile response
                profiles = response.json() if isinstance(response.json(), list) else []
                
                # Convert profiles to pair format
                pairs = []
                for profile in profiles[:30]:
                    if not isinstance(profile, dict):
                        continue
                    
                    pair_info = {
                        "chainId": profile.get("chainId", "unknown"),
                        "dexId": "dexscreener",
                        "pairAddress": profile.get("tokenAddress", ""),
                        "baseToken": {
                            "address": profile.get("tokenAddress"),
                            "name": profile.get("description", "")[:50] if profile.get("description") else profile.get("url", "")[:50],
                            "symbol": profile.get("tokenAddress", "")[:8] if profile.get("tokenAddress") else "NEW"
                        },
                        "priceUsd": None,
                        "volume24h": None,
                        "liquidity": None,
                        "priceChange24h": None,
                        "imageUrl": profile.get("icon"),
                        "url": profile.get("url")
                    }
                    pairs.append(pair_info)
            
            # Filter by chain if specified
            if chain and pairs:
                chain_map = {
                    "ethereum": "ethereum",
                    "bsc": "bsc",
                    "polygon": "polygon",
                    "solana": "solana"
                }
                chain_id = chain_map.get(chain.lower())
                if chain_id:
                    pairs = [p for p in pairs if p.get("chainId") == chain_id]
            
            result = {
                "pairs": pairs[:15],  # Top 15
                "count": len(pairs[:15])
            }
            
            discovery_cache[cache_key] = (result, current_time)
            return result
            
    except Exception as e:
        logger.error(f"Error fetching new listings: {str(e)}")
        return {"pairs": [], "note": "DEX data unavailable"}


@api_router.get("/token/resolve")
async def resolve_token(query: str = Query(..., min_length=1), chainId: Optional[str] = Query(None)):
    """
    Resolve token by name, symbol, or contract address
    Supports EVM (Dexscreener) and Solana (Jupiter Registry)
    Enhanced with logo fetching from multiple sources
    Prioritizes tokens from the specified chainId if provided
    """
    cache_key = f"resolve_{query.lower()}_{chainId if chainId else 'all'}"
    current_time = datetime.now(timezone.utc).timestamp()
    
    # Check cache
    if cache_key in discovery_cache:
        cached_data, cached_time = discovery_cache[cache_key]
        if current_time - cached_time < DISCOVERY_CACHE_TTL:
            return cached_data
    
    results = []
    prioritized_results = []  # Results from the selected chain
    
    # Chain ID to Dexscreener chain mapping
    CHAIN_ID_MAP = {
        1: "ethereum",
        56: "bsc",
        137: "polygon",
        42161: "arbitrum",
        10: "optimism",
        8453: "base",
        43114: "avalanchec",
        250: "fantom",
        25: "cronos",
        324: "zksync",
        0: "solana",
        "xrp": "xrpl",
        "tron": "tron"
    }
    
    # Native tokens for each chain - these should ALWAYS appear first
    NATIVE_TOKENS = {
        "ethereum": {
            "name": "Ethereum",
            "symbol": "ETH",
            "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "decimals": 18,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
            "isNative": True
        },
        "bsc": {
            "name": "BNB",
            "symbol": "BNB",
            "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "decimals": 18,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
            "isNative": True
        },
        "polygon": {
            "name": "Polygon",
            "symbol": "MATIC",
            "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "decimals": 18,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
            "isNative": True
        },
        "arbitrum": {
            "name": "Ethereum",
            "symbol": "ETH",
            "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "decimals": 18,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
            "isNative": True
        },
        "optimism": {
            "name": "Ethereum",
            "symbol": "ETH",
            "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "decimals": 18,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
            "isNative": True
        },
        "base": {
            "name": "Ethereum",
            "symbol": "ETH",
            "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "decimals": 18,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
            "isNative": True
        },
        "avalanchec": {
            "name": "Avalanche",
            "symbol": "AVAX",
            "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "decimals": 18,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
            "isNative": True
        },
        "fantom": {
            "name": "Fantom",
            "symbol": "FTM",
            "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "decimals": 18,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/3513.png",
            "isNative": True
        },
        "cronos": {
            "name": "Cronos",
            "symbol": "CRO",
            "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "decimals": 18,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png",
            "isNative": True
        },
        "zksync": {
            "name": "Ethereum",
            "symbol": "ETH",
            "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "decimals": 18,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
            "isNative": True
        },
        "solana": {
            "name": "Solana",
            "symbol": "SOL",
            "address": "So11111111111111111111111111111111111111112",
            "decimals": 9,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
            "isNative": True
        },
        "xrpl": {
            "name": "XRP",
            "symbol": "XRP",
            "address": "native",
            "decimals": 6,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/52.png",
            "isNative": True
        },
        "tron": {
            "name": "TRON",
            "symbol": "TRX",
            "address": "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
            "decimals": 6,
            "logoURL": "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
            "isNative": True
        }
    }
    
    # Handle both integer and string chainId inputs
    selected_chain = None
    if chainId:
        # Try to convert to int first for numeric chain IDs
        try:
            chain_id_key = int(chainId)
            selected_chain = CHAIN_ID_MAP.get(chain_id_key)
        except ValueError:
            # If conversion fails, use as string key
            selected_chain = CHAIN_ID_MAP.get(chainId)
    
    # Check if query matches a native token
    query_lower = query.lower()
    native_token_results = []
    
    # Check all native tokens
    for chain, native_token in NATIVE_TOKENS.items():
        if (query_lower == native_token["symbol"].lower() or 
            query_lower == native_token["name"].lower() or
            query_lower in native_token["symbol"].lower() or
            query_lower in native_token["name"].lower()):
            
            token_data = {
                "chain": chain,
                "name": native_token["name"],
                "symbol": native_token["symbol"],
                "address": native_token["address"],
                "decimals": native_token["decimals"],
                "logoURL": native_token["logoURL"],
                "source": "native",
                "priceUsd": None,
                "liquidity": None,
                "isNative": True
            }
            
            # If selected_chain matches, add to prioritized, otherwise to native list
            if selected_chain and chain == selected_chain:
                prioritized_results.insert(0, token_data)
            else:
                native_token_results.append(token_data)
    
    # Check if query is a Solana mint address or EVM contract address
    is_solana_mint = len(query) >= 32 and not query.startswith("0x")
    is_contract_address = query.startswith("0x") and len(query) == 42
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as http_client:
            
            # Search Dexscreener (EVM + Solana) - prioritize if it's a contract address
            try:
                dex_response = await http_client.get(
                    f"https://api.dexscreener.com/latest/dex/search?q={query}",
                    headers={"Accept": "application/json"}
                )
                
                if dex_response.status_code == 200:
                    dex_data = dex_response.json()
                    pairs = dex_data.get("pairs", [])
                    
                    # Extract unique tokens with better data and logos
                    seen = set()
                    for pair in pairs[:20]:  # Top 20 pairs for better results
                        base_token = pair.get("baseToken", {})
                        address = base_token.get("address", "")
                        
                        if not address:
                            continue
                            
                        address_lower = address.lower()
                        
                        if address_lower not in seen:
                            seen.add(address_lower)
                            
                            # Map chainId from Dexscreener format
                            chain_id = pair.get("chainId", "unknown")
                            chain_map = {
                                "ethereum": "ethereum",
                                "bsc": "bsc", 
                                "polygon": "polygon",
                                "solana": "solana",
                                "arbitrum": "arbitrum",
                                "optimism": "optimism",
                                "base": "base",
                                "avalanchec": "avalanchec",
                                "fantom": "fantom",
                                "cronos": "cronos",
                                "zksync": "zksync"
                            }
                            chain = chain_map.get(chain_id, chain_id)
                            
                            # Get logo from multiple sources
                            logo_url = None
                            
                            # 1. Try pair info imageUrl
                            if pair.get("info", {}).get("imageUrl"):
                                logo_url = pair.get("info", {}).get("imageUrl")
                            
                            # 2. Try TrustWallet for EVM tokens
                            elif chain in ["ethereum", "bsc", "polygon", "arbitrum", "optimism", "base", "avalanchec", "fantom", "cronos", "zksync"] and address.startswith("0x"):
                                tw_chain_map = {
                                    "ethereum": "ethereum",
                                    "bsc": "smartchain",
                                    "polygon": "polygon",
                                    "arbitrum": "arbitrum",
                                    "optimism": "optimism",
                                    "base": "base",
                                    "avalanchec": "avalanchec",
                                    "fantom": "fantom",
                                    "cronos": "cronos",
                                    "zksync": "zksync"
                                }
                                tw_chain = tw_chain_map.get(chain)
                                if tw_chain:
                                    logo_url = f"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/{tw_chain}/assets/{address}/logo.png"
                            
                            # 3. For Solana, try Solana token list
                            elif chain == "solana":
                                logo_url = f"https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/{address}/logo.png"
                            
                            token_data = {
                                "chain": chain,
                                "name": base_token.get("name"),
                                "symbol": base_token.get("symbol"),
                                "address": address,
                                "decimals": 18,  # Default for EVM, Solana varies
                                "logoURL": logo_url,
                                "source": "dexscreener",
                                "priceUsd": pair.get("priceUsd"),
                                "liquidity": pair.get("liquidity", {}).get("usd"),
                                "pairAddress": pair.get("pairAddress"),
                                "dexId": pair.get("dexId")
                            }
                            
                            # Prioritize tokens from selected chain
                            if selected_chain and chain == selected_chain:
                                prioritized_results.append(token_data)
                            else:
                                results.append(token_data)
            except Exception as e:
                logger.warning(f"Dexscreener search failed: {str(e)}")
            
            # For Solana, also check Jupiter Token Registry
            if is_solana_mint or (not results and len(query) >= 32) or query.lower() in ['sol', 'solana']:
                try:
                    # Fetch Jupiter token list (should be cached)
                    jupiter_response = await http_client.get("https://token.jup.ag/all")
                    
                    if jupiter_response.status_code == 200:
                        jupiter_tokens = jupiter_response.json()
                        
                        # Search in Jupiter tokens
                        for token in jupiter_tokens:
                            if (
                                token.get("address", "").lower() == query_lower or
                                token.get("symbol", "").lower() == query_lower or
                                query_lower in token.get("name", "").lower()
                            ):
                                # Avoid duplicates from Dexscreener
                                if token.get("address", "").lower() not in seen:
                                    results.append({
                                        "chain": "solana",
                                        "name": token.get("name"),
                                        "symbol": token.get("symbol"),
                                        "address": token.get("address"),
                                        "decimals": token.get("decimals", 9),
                                        "logoURL": token.get("logoURI"),
                                        "source": "jupiter",
                                        "priceUsd": None,
                                        "liquidity": None
                                    })
                                
                                if len(results) >= 15:
                                    break
                except Exception as e:
                    logger.warning(f"Jupiter search failed: {str(e)}")
            
            # Return top 15 results with native tokens first, then prioritized chain tokens, then others
            combined_results = native_token_results + prioritized_results + results
            result = {
                "query": query,
                "results": combined_results[:15],
                "count": len(combined_results[:15]),
                "prioritized_chain": selected_chain
            }
            
            discovery_cache[cache_key] = (result, current_time)
            return result
            
    except Exception as e:
        logger.error(f"Error resolving token: {str(e)}")
        return {"query": query, "results": [], "count": 0, "error": str(e)}


@api_router.get("/dex/pairs")
async def get_dex_pairs(query: str = Query(..., min_length=1)):
    """
    Get trading pairs from Dexscreener
    Returns pairs with both base and quote tokens for quick selection
    """
    cache_key = f"pairs_{query.lower()}"
    current_time = datetime.now(timezone.utc).timestamp()
    
    # Check cache
    if cache_key in discovery_cache:
        cached_data, cached_time = discovery_cache[cache_key]
        if current_time - cached_time < DISCOVERY_CACHE_TTL:
            return cached_data
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as http_client:
            dex_response = await http_client.get(
                f"https://api.dexscreener.com/latest/dex/search?q={query}",
                headers={"Accept": "application/json"}
            )
            
            if dex_response.status_code == 200:
                dex_data = dex_response.json()
                pairs = dex_data.get("pairs", [])
                
                # Format pairs with both tokens
                formatted_pairs = []
                for pair in pairs[:10]:
                    base_token = pair.get("baseToken", {})
                    quote_token = pair.get("quoteToken", {})
                    
                    chain_id = pair.get("chainId", "unknown")
                    
                    formatted_pairs.append({
                        "pairAddress": pair.get("pairAddress"),
                        "chainId": chain_id,
                        "dexId": pair.get("dexId"),
                        "url": pair.get("url"),
                        "baseToken": {
                            "address": base_token.get("address"),
                            "name": base_token.get("name"),
                            "symbol": base_token.get("symbol")
                        },
                        "quoteToken": {
                            "address": quote_token.get("address"),
                            "name": quote_token.get("name"),
                            "symbol": quote_token.get("symbol")
                        },
                        "priceUsd": pair.get("priceUsd"),
                        "liquidity": pair.get("liquidity", {}).get("usd"),
                        "volume24h": pair.get("volume", {}).get("h24"),
                        "priceChange24h": pair.get("priceChange", {}).get("h24"),
                        "logoUrl": pair.get("info", {}).get("imageUrl")
                    })
                
                result = {
                    "query": query,
                    "pairs": formatted_pairs,
                    "count": len(formatted_pairs)
                }
                
                discovery_cache[cache_key] = (result, current_time)
                return result
            else:
                return {"query": query, "pairs": [], "count": 0}
                
    except Exception as e:
        logger.error(f"Error fetching pairs: {str(e)}")
        return {"query": query, "pairs": [], "count": 0, "error": str(e)}

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Background task to clean cache
async def clean_cache():
    while True:
        await asyncio.sleep(60)  # Clean every minute
        current_time = datetime.now(timezone.utc).timestamp()
        expired_keys = [
            k for k, (_, t) in quote_cache.items()
            if current_time - t > CACHE_TTL
        ]
        for k in expired_keys:
            del quote_cache[k]
        if expired_keys:
            logger.info(f"Cleaned {len(expired_keys)} expired cache entries")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(clean_cache())
    # Initialize ad slots
    from ad_management import init_ad_slots
    await init_ad_slots()
    logger.info("Ad management initialized")

# ========== COMMUNITY RATING SYSTEM ==========

class ProjectRating(BaseModel):
    project_id: str
    wallet_address: str
    rating: int  # 1-5 stars
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@api_router.post("/projects/{project_id}/rate")
async def rate_project(project_id: str, wallet_address: str, rating: int):
    """
    Rate a launchpad project (1-5 stars)
    One wallet = One vote
    """
    try:
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        wallet_address = wallet_address.lower()
        
        # Check if user already rated this project
        existing_rating = await db.project_ratings.find_one({
            "project_id": project_id,
            "wallet_address": wallet_address
        })
        
        if existing_rating:
            # Update existing rating
            await db.project_ratings.update_one(
                {"project_id": project_id, "wallet_address": wallet_address},
                {"$set": {"rating": rating, "timestamp": datetime.now(timezone.utc)}}
            )
            message = "Rating updated"
        else:
            # Create new rating
            rating_doc = {
                "project_id": project_id,
                "wallet_address": wallet_address,
                "rating": rating,
                "timestamp": datetime.now(timezone.utc)
            }
            await db.project_ratings.insert_one(rating_doc)
            message = "Rating submitted"
        
        # Calculate new average
        pipeline = [
            {"$match": {"project_id": project_id}},
            {"$group": {
                "_id": "$project_id",
                "avg_rating": {"$avg": "$rating"},
                "total_ratings": {"$sum": 1}
            }}
        ]
        
        stats = await db.project_ratings.aggregate(pipeline).to_list(length=1)
        avg_rating = round(stats[0]["avg_rating"], 2) if stats else rating
        total_ratings = stats[0]["total_ratings"] if stats else 1
        
        return {
            "status": "success",
            "message": message,
            "project_id": project_id,
            "avg_rating": avg_rating,
            "total_ratings": total_ratings
        }
    
    except Exception as e:
        logger.error(f"Error rating project: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit rating")

@api_router.get("/projects/{project_id}/rating")
async def get_project_rating(project_id: str, wallet_address: Optional[str] = None):
    """
    Get project rating statistics and user's rating if wallet provided
    """
    try:
        # Calculate average rating
        pipeline = [
            {"$match": {"project_id": project_id}},
            {"$group": {
                "_id": "$project_id",
                "avg_rating": {"$avg": "$rating"},
                "total_ratings": {"$sum": 1}
            }}
        ]
        
        stats = await db.project_ratings.aggregate(pipeline).to_list(length=1)
        
        if not stats:
            result = {
                "project_id": project_id,
                "avg_rating": 0,
                "total_ratings": 0
            }
        else:
            result = {
                "project_id": project_id,
                "avg_rating": round(stats[0]["avg_rating"], 2),
                "total_ratings": stats[0]["total_ratings"]
            }
        
        # Get user's rating if wallet provided
        if wallet_address:
            user_rating = await db.project_ratings.find_one({
                "project_id": project_id,
                "wallet_address": wallet_address.lower()
            })
            result["user_rating"] = user_rating["rating"] if user_rating else None
        
        return result
    
    except Exception as e:
        logger.error(f"Error fetching project rating: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch rating")

# Include the routers in the main app
from ad_management import ad_router
from referral_system import referral_router
from nft_generator import nft_router
app.include_router(api_router)
app.include_router(ad_router, prefix="/api")
app.include_router(referral_router, prefix="/api")
app.include_router(nft_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

