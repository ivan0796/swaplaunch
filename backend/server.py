from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
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
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Simple in-memory cache for quotes
quote_cache = {}
CACHE_TTL = 10  # seconds

# Define Models
class SwapLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_address: str
    chain_id: int
    token_in: str
    token_out: str
    amount_in: str
    amount_out: str
    fee_amount: str
    tx_hash: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SwapLogCreate(BaseModel):
    wallet_address: str
    chain_id: int
    token_in: str
    token_out: str
    amount_in: str
    amount_out: str
    fee_amount: str
    tx_hash: Optional[str] = None

@api_router.get("/")
async def root():
    return {"message": "SwapLaunch API v1.0", "status": "operational"}

@api_router.get("/quote")
async def get_swap_quote(
    chainId: int = Query(..., description="Chain ID (1=Ethereum, 56=BSC, 137=Polygon)"),
    sellToken: str = Query(..., description="Sell token address"),
    buyToken: str = Query(..., description="Buy token address"),
    sellAmount: str = Query(..., description="Sell amount in base units"),
    takerAddress: str = Query(..., description="Taker wallet address")
):
    """
    Get swap quote from 0x API with fee integration
    """
    # Create cache key
    cache_key = f"{chainId}:{sellToken}:{buyToken}:{sellAmount}:{takerAddress}"
    
    # Check cache
    if cache_key in quote_cache:
        cached_data, cached_time = quote_cache[cache_key]
        if (datetime.now(timezone.utc).timestamp() - cached_time) < CACHE_TTL:
            logger.info(f"Returning cached quote for {cache_key}")
            return cached_data
    
    # Get fee recipient from env
    fee_recipient = os.environ.get('FEE_RECIPIENT', '0x0000000000000000000000000000000000000000')
    buy_token_percentage_fee = "0.2"  # 0.2%
    
    # Map chainId to 0x API endpoint
    api_endpoints = {
        1: "https://api.0x.org",
        56: "https://bsc.api.0x.org",
        137: "https://polygon.api.0x.org"
    }
    
    base_url = api_endpoints.get(chainId)
    if not base_url:
        raise HTTPException(status_code=400, detail=f"Unsupported chain ID: {chainId}")
    
    # Build 0x API request
    params = {
        "sellToken": sellToken,
        "buyToken": buyToken,
        "sellAmount": sellAmount,
        "takerAddress": takerAddress,
        "buyTokenPercentageFee": buy_token_percentage_fee,
        "feeRecipient": fee_recipient
    }
    
    headers = {}
    api_key = os.environ.get('ZEROX_API_KEY')
    if api_key:
        headers["0x-api-key"] = api_key
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            response = await http_client.get(
                f"{base_url}/swap/v1/quote",
                params=params,
                headers=headers
            )
            
            if response.status_code == 200:
                quote_data = response.json()
                # Cache the response
                quote_cache[cache_key] = (quote_data, datetime.now(timezone.utc).timestamp())
                logger.info(f"Quote fetched successfully for {sellToken} -> {buyToken}")
                return quote_data
            else:
                error_detail = response.text
                logger.error(f"0x API error: {response.status_code} - {error_detail}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"0x API error: {error_detail}"
                )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request to 0x API timed out")
    except Exception as e:
        logger.error(f"Error fetching quote: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching quote: {str(e)}")

@api_router.post("/swaps", response_model=SwapLog)
async def log_swap(swap_data: SwapLogCreate):
    """
    Log a completed swap transaction
    """
    swap_obj = SwapLog(**swap_data.model_dump())
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = swap_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.swaps.insert_one(doc)
    logger.info(f"Swap logged: {swap_obj.tx_hash}")
    return swap_obj

@api_router.get("/swaps", response_model=List[SwapLog])
async def get_swaps(
    wallet_address: Optional[str] = Query(None, description="Filter by wallet address")
):
    """
    Get swap history
    """
    query = {}
    if wallet_address:
        query['wallet_address'] = wallet_address
    
    swaps = await db.swaps.find(query, {"_id": 0}).sort("timestamp", -1).to_list(100)
    
    # Convert ISO string timestamps back to datetime objects
    for swap in swaps:
        if isinstance(swap['timestamp'], str):
            swap['timestamp'] = datetime.fromisoformat(swap['timestamp'])
    
    return swaps

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "cache_size": len(quote_cache)
    }

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