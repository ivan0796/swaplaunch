from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ad_router = APIRouter(prefix="/ads", tags=["Advertising"])

# Models
class AdSlotConfig(BaseModel):
    slot_id: int
    name: str
    price_eth: float
    price_usd: float
    payment_token: str = "ETH"  # ETH or token address
    duration_days: int = 30
    position: str  # "banner", "sidebar", "featured"
    max_active: int = 1  # How many ads can be active in this slot
    active: bool = True

class AdPurchaseRequest(BaseModel):
    slot_id: int
    content_cid: str  # IPFS CID or URL
    title: str
    description: Optional[str] = None
    link_url: Optional[str] = None
    image_url: Optional[str] = None

class AdPurchase(BaseModel):
    purchase_id: str
    slot_id: int
    advertiser: str
    content_cid: str
    title: str
    description: Optional[str] = None
    link_url: Optional[str] = None
    image_url: Optional[str] = None
    tx_hash: str
    paid_at: datetime
    expires_at: datetime
    status: str  # "pending", "live", "expired"
    confirmations: int = 0

class AdPaymentEvent(BaseModel):
    purchase_id: str
    slot_id: int
    advertiser: str
    amount: str
    tx_hash: str
    block_number: int

# API Endpoints

@ad_router.get("/slots")
async def get_ad_slots():
    """
    Get all available ad slots and their configuration
    """
    try:
        slots = await db.ad_slots.find({"active": True}).to_list(length=100)
        
        # Convert ObjectId to string for JSON serialization
        for slot in slots:
            if '_id' in slot:
                slot['_id'] = str(slot['_id'])
        
        return {"slots": slots}
    except Exception as e:
        logger.error(f"Error fetching ad slots: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch ad slots")

@ad_router.get("/slots/{slot_id}")
async def get_ad_slot(slot_id: int):
    """
    Get specific ad slot configuration
    """
    try:
        slot = await db.ad_slots.find_one({"slot_id": slot_id})
        
        if not slot:
            raise HTTPException(status_code=404, detail="Ad slot not found")
        
        if '_id' in slot:
            slot['_id'] = str(slot['_id'])
        
        return slot
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching ad slot: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch ad slot")

@ad_router.get("/active")
async def get_active_ads():
    """
    Get all currently active (live) advertisements
    Frontend reads this to display ads
    """
    try:
        now = datetime.now(timezone.utc)
        
        # Find all live ads that haven't expired
        active_ads = await db.ad_purchases.find({
            "status": "live",
            "expires_at": {"$gt": now}
        }).to_list(length=100)
        
        # Convert dates and ObjectId
        for ad in active_ads:
            if '_id' in ad:
                ad['_id'] = str(ad['_id'])
            if isinstance(ad.get('paid_at'), datetime):
                ad['paid_at'] = ad['paid_at'].isoformat()
            if isinstance(ad.get('expires_at'), datetime):
                ad['expires_at'] = ad['expires_at'].isoformat()
        
        return {"ads": active_ads, "count": len(active_ads)}
    except Exception as e:
        logger.error(f"Error fetching active ads: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch active ads")

@ad_router.post("/purchase/initiate")
async def initiate_ad_purchase(request: AdPurchaseRequest):
    """
    Initiate ad purchase - creates pending purchase record
    Returns contract details for payment
    """
    try:
        # Validate slot exists
        slot = await db.ad_slots.find_one({"slot_id": request.slot_id, "active": True})
        
        if not slot:
            raise HTTPException(status_code=404, detail="Ad slot not available")
        
        # Check if slot has space (max_active limit)
        active_count = await db.ad_purchases.count_documents({
            "slot_id": request.slot_id,
            "status": "live",
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        })
        
        if active_count >= slot.get('max_active', 1):
            raise HTTPException(status_code=400, detail="Ad slot is full")
        
        # Create pending purchase
        purchase_id = str(uuid.uuid4())
        purchase = {
            "purchase_id": purchase_id,
            "slot_id": request.slot_id,
            "content_cid": request.content_cid,
            "title": request.title,
            "description": request.description,
            "link_url": request.link_url,
            "image_url": request.image_url,
            "status": "pending",
            "created_at": datetime.now(timezone.utc),
            "confirmations": 0
        }
        
        await db.ad_purchases.insert_one(purchase)
        
        # Return payment details
        contract_address = os.environ.get('AD_CONTRACT_ADDRESS', '0x0000000000000000000000000000000000000000')
        
        return {
            "purchase_id": purchase_id,
            "slot_id": request.slot_id,
            "price_eth": slot['price_eth'],
            "price_usd": slot['price_usd'],
            "duration_days": slot['duration_days'],
            "contract_address": contract_address,
            "payment_token": slot.get('payment_token', 'ETH'),
            "message": "Pending payment. Please complete transaction to activate."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initiating purchase: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initiate purchase")

@ad_router.post("/webhook/payment")
async def handle_payment_webhook(event: AdPaymentEvent):
    """
    Webhook for event listener to report successful payments
    Called by backend event listener after 2-3 confirmations
    """
    try:
        # Find pending purchase
        purchase = await db.ad_purchases.find_one({
            "purchase_id": event.purchase_id,
            "status": "pending"
        })
        
        if not purchase:
            logger.warning(f"Purchase {event.purchase_id} not found or not pending")
            return {"status": "ignored", "message": "Purchase not found"}
        
        # Get slot config for duration
        slot = await db.ad_slots.find_one({"slot_id": event.slot_id})
        
        if not slot:
            raise HTTPException(status_code=404, detail="Slot not found")
        
        # Update purchase to live
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=slot['duration_days'])
        
        await db.ad_purchases.update_one(
            {"purchase_id": event.purchase_id},
            {"$set": {
                "advertiser": event.advertiser,
                "tx_hash": event.tx_hash,
                "paid_at": now,
                "expires_at": expires_at,
                "status": "live",
                "confirmations": event.block_number
            }}
        )
        
        logger.info(f"Ad purchase {event.purchase_id} activated - expires at {expires_at}")
        
        return {
            "status": "success",
            "purchase_id": event.purchase_id,
            "expires_at": expires_at.isoformat()
        }
    except Exception as e:
        logger.error(f"Error handling payment webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process payment")

@ad_router.post("/admin/expire-old")
async def expire_old_ads():
    """
    Admin endpoint to expire ads that have passed their expiration date
    Run this via cron job every hour
    """
    try:
        now = datetime.now(timezone.utc)
        
        result = await db.ad_purchases.update_many(
            {
                "status": "live",
                "expires_at": {"$lt": now}
            },
            {"$set": {"status": "expired"}}
        )
        
        logger.info(f"Expired {result.modified_count} ads")
        
        return {
            "status": "success",
            "expired_count": result.modified_count
        }
    except Exception as e:
        logger.error(f"Error expiring ads: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to expire ads")

# Initialize default ad slots
async def init_ad_slots():
    """
    Initialize default ad slot configurations
    """
    default_slots = [
        {
            "slot_id": 1,
            "name": "Hero Banner",
            "price_eth": 0.05,
            "price_usd": 150,
            "payment_token": "ETH",
            "duration_days": 30,
            "position": "banner",
            "max_active": 1,
            "active": True,
            "description": "Premium banner at top of swap page"
        },
        {
            "slot_id": 2,
            "name": "Sidebar Featured",
            "price_eth": 0.03,
            "price_usd": 99,
            "payment_token": "ETH",
            "duration_days": 30,
            "position": "sidebar",
            "max_active": 2,
            "active": True,
            "description": "Featured spot in trending section"
        },
        {
            "slot_id": 3,
            "name": "Project Listing Featured",
            "price_eth": 0.08,
            "price_usd": 199,
            "payment_token": "ETH",
            "duration_days": 30,
            "position": "featured",
            "max_active": 3,
            "active": True,
            "description": "Premium featured listing in Projects page"
        }
    ]
    
    for slot in default_slots:
        existing = await db.ad_slots.find_one({"slot_id": slot['slot_id']})
        if not existing:
            await db.ad_slots.insert_one(slot)
            logger.info(f"Initialized ad slot: {slot['name']}")