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
    "ethereum": {"chain_id": 1, "rpc": os.environ.get('RPC_ETH'), "api_base": "https://api.0x.org"},
    "bsc": {"chain_id": 56, "rpc": os.environ.get('RPC_BSC'), "api_base": "https://bsc.api.0x.org"},
    "polygon": {"chain_id": 137, "rpc": os.environ.get('RPC_POLYGON'), "api_base": "https://polygon.api.0x.org"},
    "solana": {"chain_id": 0, "rpc": os.environ.get('RPC_SOLANA'), "api_base": os.environ.get('JUPITER_API_URL')}
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
    params = {
        "sellToken": request.sellToken,
        "buyToken": request.buyToken,
        "sellAmount": request.sellAmount,
        "takerAddress": request.takerAddress,
        "buyTokenPercentageFee": buy_token_percentage_fee,
        "feeRecipient": fee_recipient
    }
    
    headers = {}
    api_key = os.environ.get('ZEROX_API_KEY')
    if api_key:
        headers["0x-api-key"] = api_key
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            # Use /swap/permit2/quote endpoint (newer 0x API)
            api_url = f"{chain_config['api_base']}/swap/permit2/quote"
            
            logger.info(f"Requesting 0x quote: {api_url} with params: {params}")
            
            response = await http_client.get(
                api_url,
                params=params,
                headers=headers
            )
            
            logger.info(f"0x API response status: {response.status_code}")
            
            if response.status_code == 200:
                quote_data = response.json()
                quote_data["chain"] = chain
                quote_data["chain_id"] = chain_config["chain_id"]
                quote_data["feeRecipient"] = fee_recipient
                quote_data["platformFee"] = buy_token_percentage_fee
                
                # Cache the response
                quote_cache[cache_key] = (quote_data, datetime.now(timezone.utc).timestamp())
                logger.info(f"EVM quote fetched for {chain}: {request.sellToken} -> {request.buyToken}")
                return quote_data
            else:
                error_detail = response.text
                logger.error(f"0x API error on {chain}: {response.status_code} - {error_detail}")
                
                # Try fallback to v1 endpoint
                logger.info(f"Trying fallback to /swap/v1/quote")
                response_v1 = await http_client.get(
                    f"{chain_config['api_base']}/swap/v1/quote",
                    params=params,
                    headers=headers
                )
                
                if response_v1.status_code == 200:
                    quote_data = response_v1.json()
                    quote_data["chain"] = chain
                    quote_data["chain_id"] = chain_config["chain_id"]
                    quote_data["feeRecipient"] = fee_recipient
                    quote_data["platformFee"] = buy_token_percentage_fee
                    
                    quote_cache[cache_key] = (quote_data, datetime.now(timezone.utc).timestamp())
                    return quote_data
                
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"0x API error: {error_detail}"
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
            logger.info(f"Returning cached Solana quote")
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
    logger.info(f"SwapLaunch API v2.0 started - Chains: {list(CHAIN_CONFIG.keys())}")