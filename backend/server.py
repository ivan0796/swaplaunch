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

@api_router.post("/evm/quote")
async def get_evm_quote(request: EVMQuoteRequest):
    """
    Get swap quote for EVM chains (Ethereum, BSC, Polygon) via 0x API
    Injects platform fee: buyTokenPercentageFee=0.2%, feeRecipient
    """
    chain = request.chain.lower()
    
    if chain not in ["ethereum", "bsc", "polygon"]:
        raise HTTPException(status_code=400, detail=f"Unsupported EVM chain: {chain}")
    
    chain_config = CHAIN_CONFIG[chain]
    
    # Create cache key
    cache_key = f"{chain}:{request.sellToken}:{request.buyToken}:{request.sellAmount}:{request.takerAddress}"
    
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
    
    buy_token_percentage_fee = "0.2"  # 0.2%
    
    # Build 0x API request
    # Note: 0x API v2 uses /swap/allowance-holder/price for quotes
    params = {
        "chainId": str(chain_config["chain_id"]),
        "sellToken": request.sellToken,
        "buyToken": request.buyToken,
        "sellAmount": request.sellAmount,
        "taker": request.takerAddress,
        "feeRecipient": fee_recipient,
        "buyTokenPercentageFee": buy_token_percentage_fee
    }
    
    headers = {
        "0x-version": "v2"  # Required for v2 API
    }
    api_key = os.environ.get('ZEROX_API_KEY')
    if api_key:
        headers["0x-api-key"] = api_key
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            # Use v2 API endpoint - /quote für vollständige Transaction-Data
            # /price gibt nur Preis zurück, /quote gibt transaction data
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
                quote_data["chain"] = chain
                quote_data["chain_id"] = chain_config["chain_id"]
                quote_data["feeRecipient"] = fee_recipient
                quote_data["platformFee"] = buy_token_percentage_fee
                
                # Ensure critical fields exist
                if not quote_data.get("transaction") or not quote_data["transaction"].get("data"):
                    logger.error(f"Invalid quote response - missing transaction data: {quote_data}")
                    raise HTTPException(
                        status_code=500,
                        detail="Invalid quote response from 0x API - missing transaction data"
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
    Returns quote + instructions for swap
    Frontend must add 0.2% fee transfer to FEE_RECIPIENT_SOL
    """
    # Create cache key
    cache_key = f"solana:{request.inputMint}:{request.outputMint}:{request.amount}"
    
    # Check cache
    if cache_key in quote_cache:
        cached_data, cached_time = quote_cache[cache_key]
        if (datetime.now(timezone.utc).timestamp() - cached_time) < CACHE_TTL:
            logger.info("Returning cached Solana quote")
            return cached_data
    
    jupiter_api = os.environ.get('JUPITER_API_URL')
    fee_recipient = os.environ.get('FEE_RECIPIENT_SOL')
    
    # Get quote from Jupiter
    params = {
        "inputMint": request.inputMint,
        "outputMint": request.outputMint,
        "amount": request.amount,
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
            
            # Calculate platform fee (0.2% of output)
            output_amount = int(quote_data.get("outAmount", 0))
            platform_fee_amount = int(output_amount * 0.002)  # 0.2%
            net_output_amount = output_amount - platform_fee_amount
            
            result = {
                "chain": "solana",
                "quote": quote_data,
                "platformFee": {
                    "percentage": "0.2",
                    "amount": str(platform_fee_amount),
                    "recipient": fee_recipient
                },
                "netOutputAmount": str(net_output_amount),
                "outputAmount": str(output_amount),
                "instructions": {
                    "note": "Frontend must create fee transfer instruction",
                    "feeRecipient": fee_recipient,
                    "feeAmount": str(platform_fee_amount),
                    "warning": "Ensure fee recipient ATA exists for output token"
                }
            }
            
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

@api_router.get("/referrals/{wallet_address}")
async def get_referral_stats(wallet_address: str):
    """
    Get referral statistics for a wallet
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

@api_router.get("/coingecko/trending")
async def get_trending_tokens():
    """
    Proxy to CoinGecko trending tokens API
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as http_client:
            response = await http_client.get(
                "https://api.coingecko.com/api/v3/search/trending"
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="CoinGecko API error")
    except Exception as e:
        logger.error(f"Error fetching trending tokens: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/coingecko/price/{coin_id}")
async def get_coin_price(coin_id: str):
    """
    Proxy to CoinGecko coin price API with sparkline
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as http_client:
            response = await http_client.get(
                f"https://api.coingecko.com/api/v3/coins/{coin_id}",
                params={
                    "localization": "false",
                    "tickers": "false",
                    "market_data": "true",
                    "community_data": "false",
                    "developer_data": "false",
                    "sparkline": "true"
                }
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "id": data.get("id"),
                    "symbol": data.get("symbol"),
                    "name": data.get("name"),
                    "current_price": data.get("market_data", {}).get("current_price", {}).get("usd"),
                    "price_change_24h": data.get("market_data", {}).get("price_change_percentage_24h"),
                    "sparkline_7d": data.get("market_data", {}).get("sparkline_7d", {}).get("price", [])
                }
            else:
                raise HTTPException(status_code=response.status_code, detail="CoinGecko API error")
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
    Get trending tokens in categories: top (volume), gainers, losers
    Uses CoinGecko /coins/markets endpoint with fallback
    """
    cache_key = f"trending_{category}"
    current_time = datetime.now(timezone.utc).timestamp()
    
    # Check cache - use longer cache for rate-limited APIs
    if cache_key in discovery_cache:
        cached_data, cached_time = discovery_cache[cache_key]
        if current_time - cached_time < (DISCOVERY_CACHE_TTL * 6):  # 30 min cache
            logger.info(f"Returning cached trending {category}")
            return cached_data
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            # Determine order parameter based on category
            if category == "top":
                order_param = "volume_desc"
            elif category == "gainers":
                order_param = "market_cap_desc"  # Will sort by % later
            else:  # losers
                order_param = "market_cap_desc"
            
            params = {
                "vs_currency": "usd",
                "order": order_param,
                "per_page": 50,
                "page": 1,
                "sparkline": False,
                "price_change_percentage": "24h"
            }
            
            response = await http_client.get(
                "https://api.coingecko.com/api/v3/coins/markets",
                params=params
            )
            
            # Handle rate limiting gracefully
            if response.status_code == 429:
                logger.warning(f"CoinGecko rate limit for trending {category}, returning empty result")
                return {"category": category, "tokens": [], "error": "Rate limited"}
            
            if response.status_code != 200:
                logger.error(f"CoinGecko API error: {response.status_code}")
                return {"category": category, "tokens": [], "error": "API unavailable"}
            
            data = response.json()
            
            # Process based on category
            if category == "gainers":
                # Sort by highest price change percentage
                data = sorted(data, key=lambda x: x.get('price_change_percentage_24h', 0) or 0, reverse=True)[:20]
            elif category == "losers":
                # Sort by lowest price change percentage
                data = sorted(data, key=lambda x: x.get('price_change_percentage_24h', 0) or 0)[:20]
            else:  # top by volume
                data = data[:20]
            
            result = {
                "category": category,
                "tokens": [
                    {
                        "id": token.get("id"),
                        "symbol": token.get("symbol", "").upper(),
                        "name": token.get("name"),
                        "image": token.get("image"),
                        "current_price": token.get("current_price"),
                        "price_change_24h": token.get("price_change_percentage_24h"),
                        "market_cap": token.get("market_cap"),
                        "total_volume": token.get("total_volume")
                    }
                    for token in data
                ]
            }
            
            # Cache the result for longer due to rate limits
            discovery_cache[cache_key] = (result, current_time)
            return result
            
    except httpx.TimeoutException:
        logger.warning(f"CoinGecko API timeout for trending {category}")
        return {"category": category, "tokens": [], "error": "API timeout"}
    except Exception as e:
        logger.error(f"Error fetching trending {category}: {str(e)}")
        return {"category": category, "tokens": [], "error": str(e)}


@api_router.get("/dex/new-listings")
async def get_new_dex_listings(chain: Optional[str] = Query(None)):
    """
    Get new DEX listings from Dexscreener
    Uses latest pairs from trending with age filter
    """
    cache_key = f"new_listings_{chain or 'all'}"
    current_time = datetime.now(timezone.utc).timestamp()
    
    # Check cache (2 min for new listings)
    if cache_key in discovery_cache:
        cached_data, cached_time = discovery_cache[cache_key]
        if current_time - cached_time < 120:
            return cached_data
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            # Use boosted/trending endpoint which includes newer tokens
            response = await http_client.get(
                "https://api.dexscreener.com/latest/dex/tokens/trending",
                headers={"Accept": "application/json"}
            )
            
            if response.status_code == 429:
                logger.warning("Dexscreener rate limit for new listings")
                return {"pairs": [], "note": "Rate limited, try again later"}
            
            if response.status_code != 200:
                logger.warning(f"Dexscreener API error: {response.status_code}")
                return {"pairs": [], "note": "DEX data temporarily unavailable"}
            
            data = response.json()
            
            # Dexscreener trending returns array of trending token info
            if not data or not isinstance(data, list):
                return {"pairs": [], "note": "No new listings available"}
            
            pairs = []
            for item in data:
                # Extract pair data from trending response
                token_data = item if isinstance(item, dict) else {}
                
                # Build simplified pair info
                base_token = {
                    "address": token_data.get("tokenAddress") or token_data.get("address"),
                    "name": token_data.get("name"),
                    "symbol": token_data.get("symbol")
                }
                
                pair_info = {
                    "chainId": token_data.get("chainId", "unknown"),
                    "dexId": token_data.get("dexId", "unknown"),
                    "pairAddress": token_data.get("pairAddress", ""),
                    "baseToken": base_token,
                    "priceUsd": token_data.get("priceUsd"),
                    "volume24h": token_data.get("volume", {}).get("h24") if isinstance(token_data.get("volume"), dict) else None,
                    "liquidity": token_data.get("liquidity", {}).get("usd") if isinstance(token_data.get("liquidity"), dict) else None,
                    "priceChange24h": token_data.get("priceChange", {}).get("h24") if isinstance(token_data.get("priceChange"), dict) else None
                }
                
                # Filter by chain if specified
                if chain:
                    chain_map = {
                        "ethereum": "ethereum",
                        "bsc": "bsc",
                        "polygon": "polygon",
                        "solana": "solana"
                    }
                    chain_id = chain_map.get(chain.lower())
                    if chain_id and pair_info["chainId"] == chain_id:
                        pairs.append(pair_info)
                else:
                    pairs.append(pair_info)
            
            result = {
                "pairs": pairs[:20],  # Top 20
                "count": len(pairs[:20])
            }
            
            discovery_cache[cache_key] = (result, current_time)
            return result
            
    except Exception as e:
        logger.error(f"Error fetching new listings: {str(e)}")
        return {"pairs": [], "note": "DEX data unavailable"}
            return result
            
    except httpx.TimeoutException:
        return {"pairs": [], "note": "DEX data timeout"}
    except Exception as e:
        logger.error(f"Error fetching new DEX listings: {str(e)}")
        return {"pairs": [], "note": "DEX data unavailable"}


@api_router.get("/token/resolve")
async def resolve_token(query: str = Query(..., min_length=1)):
    """
    Resolve token by name, symbol, or contract address
    Supports EVM (Dexscreener) and Solana (Jupiter Registry)
    """
    cache_key = f"resolve_{query.lower()}"
    current_time = datetime.now(timezone.utc).timestamp()
    
    # Check cache
    if cache_key in discovery_cache:
        cached_data, cached_time = discovery_cache[cache_key]
        if current_time - cached_time < DISCOVERY_CACHE_TTL:
            return cached_data
    
    results = []
    
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
                    
                    # Extract unique tokens with better data
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
                                "solana": "solana"
                            }
                            chain = chain_map.get(chain_id, chain_id)
                            
                            results.append({
                                "chain": chain,
                                "name": base_token.get("name"),
                                "symbol": base_token.get("symbol"),
                                "address": address,
                                "decimals": 18,  # Default for EVM, Solana varies
                                "logoURL": pair.get("info", {}).get("imageUrl"),  # Get logo from pair info
                                "source": "dexscreener",
                                "priceUsd": pair.get("priceUsd"),
                                "liquidity": pair.get("liquidity", {}).get("usd"),
                                "pairAddress": pair.get("pairAddress"),
                                "dexId": pair.get("dexId")
                            })
            except Exception as e:
                logger.warning(f"Dexscreener search failed: {str(e)}")
            
            # For Solana, also check Jupiter Token Registry
            if is_solana_mint or (not results and len(query) >= 32):
                try:
                    # Fetch Jupiter token list (should be cached)
                    jupiter_response = await http_client.get("https://token.jup.ag/all")
                    
                    if jupiter_response.status_code == 200:
                        jupiter_tokens = jupiter_response.json()
                        
                        # Search in Jupiter tokens
                        query_lower = query.lower()
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
            
            # Return top 15 results
            result = {
                "query": query,
                "results": results[:15],
                "count": len(results[:15])
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

# Include the router in the main app
app.include_router(api_router)

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

