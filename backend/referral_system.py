from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import os
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

referral_router = APIRouter(prefix="/referrals", tags=["Referrals"])

# Models
class ReferralCreate(BaseModel):
    referrer: str
    referee: str
    
class ReferralStats(BaseModel):
    referrer: str
    total_referrals: int
    total_earned: float
    unclaimed_amount: float

class ReferralReward(BaseModel):
    referrer: str
    amount: float
    tx_hash: str
    swap_amount: float
    timestamp: datetime

# Constants
REFERRAL_FEE_PERCENTAGE = 10  # 10% of platform fee goes to referrer
PLATFORM_FEE_BPS = 20  # 0.2% platform fee

# API Endpoints

@referral_router.post("/track")
async def track_referral(referrer: str, referee: str):
    """
    Track a new referral when a referee connects wallet with ?ref= param
    """
    try:
        # Check if referee already has a referrer
        existing = await db.referrals.find_one({"referee": referee})
        
        if existing:
            return {"status": "already_tracked", "referrer": existing["referrer"]}
        
        # Create new referral tracking
        referral = {
            "referrer": referrer.lower(),
            "referee": referee.lower(),
            "created_at": datetime.now(timezone.utc),
            "total_swaps": 0,
            "total_volume": 0,
            "total_earned": 0
        }
        
        await db.referrals.insert_one(referral)
        
        logger.info(f"New referral tracked: {referrer} -> {referee}")
        
        return {"status": "success", "referrer": referrer}
    
    except Exception as e:
        logger.error(f"Error tracking referral: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track referral")

@referral_router.get("/stats/{wallet}")
async def get_referral_stats(wallet: str):
    """
    Get referral statistics for a wallet
    """
    try:
        wallet = wallet.lower()
        
        # Count total referrals
        total_referrals = await db.referrals.count_documents({"referrer": wallet})
        
        # Calculate total earned and unclaimed
        rewards = await db.referral_rewards.find({"referrer": wallet}).to_list(length=1000)
        
        total_earned = sum(r.get("amount", 0) for r in rewards)
        unclaimed_amount = sum(r.get("amount", 0) for r in rewards if not r.get("claimed", False))
        
        # Get list of referees
        referrals = await db.referrals.find({"referrer": wallet}).to_list(length=100)
        
        referees = []
        for ref in referrals:
            referees.append({
                "address": ref["referee"],
                "joined_at": ref["created_at"].isoformat() if isinstance(ref.get("created_at"), datetime) else None,
                "total_swaps": ref.get("total_swaps", 0),
                "total_volume": ref.get("total_volume", 0)
            })
        
        return {
            "wallet": wallet,
            "total_referrals": total_referrals,
            "total_earned": total_earned,
            "unclaimed_amount": unclaimed_amount,
            "referees": referees
        }
    
    except Exception as e:
        logger.error(f"Error fetching referral stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")

@referral_router.post("/reward")
async def record_referral_reward(
    swap_tx_hash: str,
    referee: str,
    swap_amount_usd: float
):
    """
    Record a referral reward after a successful swap
    Called by swap completion webhook
    """
    try:
        referee = referee.lower()
        
        # Find referrer for this referee
        referral = await db.referrals.find_one({"referee": referee})
        
        if not referral:
            return {"status": "no_referrer"}
        
        referrer = referral["referrer"]
        
        # Calculate reward
        platform_fee = swap_amount_usd * (PLATFORM_FEE_BPS / 10000)
        reward_amount = platform_fee * (REFERRAL_FEE_PERCENTAGE / 100)
        
        # Record reward
        reward = {
            "referrer": referrer,
            "referee": referee,
            "amount": reward_amount,
            "swap_tx_hash": swap_tx_hash,
            "swap_amount": swap_amount_usd,
            "timestamp": datetime.now(timezone.utc),
            "claimed": False
        }
        
        await db.referral_rewards.insert_one(reward)
        
        # Update referral stats
        await db.referrals.update_one(
            {"referee": referee},
            {
                "$inc": {
                    "total_swaps": 1,
                    "total_volume": swap_amount_usd,
                    "total_earned": reward_amount
                }
            }
        )
        
        logger.info(f"Referral reward recorded: {referrer} earned ${reward_amount:.4f}")
        
        return {
            "status": "success",
            "referrer": referrer,
            "reward_amount": reward_amount
        }
    
    except Exception as e:
        logger.error(f"Error recording referral reward: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to record reward")

@referral_router.get("/leaderboard")
async def get_referral_leaderboard(limit: int = Query(10, le=100)):
    """
    Get top referrers by total earned
    """
    try:
        # Aggregate referral stats
        pipeline = [
            {
                "$group": {
                    "_id": "$referrer",
                    "total_referrals": {"$sum": 1},
                    "total_volume": {"$sum": "$total_volume"},
                    "total_earned": {"$sum": "$total_earned"}
                }
            },
            {"$sort": {"total_earned": -1}},
            {"$limit": limit}
        ]
        
        leaderboard = await db.referrals.aggregate(pipeline).to_list(length=limit)
        
        result = []
        for idx, entry in enumerate(leaderboard, 1):
            result.append({
                "rank": idx,
                "wallet": entry["_id"],
                "total_referrals": entry["total_referrals"],
                "total_volume": entry["total_volume"],
                "total_earned": entry["total_earned"]
            })
        
        return {"leaderboard": result}
    
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch leaderboard")

@referral_router.post("/claim/{wallet}")
async def claim_rewards(wallet: str):
    """
    Claim accumulated referral rewards
    In production, this would trigger an on-chain transaction
    """
    try:
        wallet = wallet.lower()
        
        # Get unclaimed rewards
        unclaimed = await db.referral_rewards.find({
            "referrer": wallet,
            "claimed": False
        }).to_list(length=1000)
        
        if not unclaimed:
            return {"status": "no_rewards", "amount": 0}
        
        total_amount = sum(r["amount"] for r in unclaimed)
        
        # Mark as claimed
        await db.referral_rewards.update_many(
            {"referrer": wallet, "claimed": False},
            {"$set": {"claimed": True, "claimed_at": datetime.now(timezone.utc)}}
        )
        
        logger.info(f"Rewards claimed: {wallet} claimed ${total_amount:.4f}")
        
        return {
            "status": "success",
            "amount": total_amount,
            "count": len(unclaimed),
            "message": f"${total_amount:.2f} USD in rewards claimed!"
        }
    
    except Exception as e:
        logger.error(f"Error claiming rewards: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to claim rewards")
