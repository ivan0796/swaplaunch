"""
Referral System V2 - Secure referral codes with first swap discount
"""
import secrets
import string
from datetime import datetime, timezone
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['swaplaunch']
referrals_collection = db['referrals']
users_collection = db['users']

def generate_referral_code(length=8):
    """Generate a secure, unique referral code"""
    # Use uppercase letters and numbers, excluding similar looking characters (0, O, I, 1, l)
    charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return ''.join(secrets.choice(charset) for _ in range(length))

async def get_or_create_referral_code(wallet_address: str) -> dict:
    """
    Get existing referral code for wallet or create a new one
    Returns: {'code': str, 'uses': int, 'rewards': float}
    """
    wallet_lower = wallet_address.lower()
    
    # Check if user already has a code
    existing = await referrals_collection.find_one({'wallet': wallet_lower})
    
    if existing:
        return {
            'code': existing['code'],
            'uses': existing.get('uses', 0),
            'rewards': existing.get('rewards', 0),
            'created_at': existing.get('created_at')
        }
    
    # Generate new unique code
    code = None
    max_attempts = 10
    
    for _ in range(max_attempts):
        candidate = generate_referral_code()
        # Check if code already exists
        if not await referrals_collection.find_one({'code': candidate}):
            code = candidate
            break
    
    if not code:
        raise Exception('Failed to generate unique referral code')
    
    # Create referral entry
    referral_data = {
        'wallet': wallet_lower,
        'code': code,
        'uses': 0,
        'rewards': 0,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'referred_users': []
    }
    
    await referrals_collection.insert_one(referral_data)
    
    return {
        'code': code,
        'uses': 0,
        'rewards': 0,
        'created_at': referral_data['created_at']
    }

async def validate_referral_code(code: str) -> Optional[dict]:
    """
    Validate if a referral code exists
    Returns referrer info or None
    """
    code_upper = code.upper()
    referral = await referrals_collection.find_one({'code': code_upper})
    
    if not referral:
        return None
    
    return {
        'code': referral['code'],
        'wallet': referral['wallet'],
        'uses': referral.get('uses', 0)
    }

async def redeem_referral_code(wallet_address: str, referral_code: str) -> dict:
    """
    Redeem a referral code for first swap discount
    Returns: {'success': bool, 'message': str, 'discount': bool}
    """
    wallet_lower = wallet_address.lower()
    code_upper = referral_code.upper()
    
    # Check if user already redeemed a code
    user = await users_collection.find_one({'wallet': wallet_lower})
    
    if user and user.get('redeemed_referral'):
        return {
            'success': False,
            'message': 'You have already redeemed a referral code',
            'discount': False
        }
    
    # Validate referral code exists
    referral = await referrals_collection.find_one({'code': code_upper})
    
    if not referral:
        return {
            'success': False,
            'message': 'Invalid referral code',
            'discount': False
        }
    
    # Check if user is trying to use their own code
    if referral['wallet'] == wallet_lower:
        return {
            'success': False,
            'message': 'Cannot use your own referral code',
            'discount': False
        }
    
    # Mark user as redeemed
    await users_collection.update_one(
        {'wallet': wallet_lower},
        {
            '$set': {
                'wallet': wallet_lower,
                'redeemed_referral': True,
                'referral_code_used': code_upper,
                'referrer_wallet': referral['wallet'],
                'redeemed_at': datetime.now(timezone.utc).isoformat(),
                'free_swap_used': False
            }
        },
        upsert=True
    )
    
    # Update referrer stats
    await referrals_collection.update_one(
        {'code': code_upper},
        {
            '$inc': {'uses': 1},
            '$push': {
                'referred_users': {
                    'wallet': wallet_lower,
                    'redeemed_at': datetime.now(timezone.utc).isoformat()
                }
            }
        }
    )
    
    return {
        'success': True,
        'message': 'Referral code applied! Your first swap is free',
        'discount': True
    }

async def check_free_swap_eligibility(wallet_address: str) -> dict:
    """
    Check if wallet is eligible for free first swap
    Returns: {'eligible': bool, 'code_used': str or None}
    """
    wallet_lower = wallet_address.lower()
    
    user = await users_collection.find_one({'wallet': wallet_lower})
    
    if not user:
        return {'eligible': False, 'code_used': None}
    
    # Eligible if redeemed code but haven't used free swap yet
    if user.get('redeemed_referral') and not user.get('free_swap_used'):
        return {
            'eligible': True,
            'code_used': user.get('referral_code_used')
        }
    
    return {'eligible': False, 'code_used': user.get('referral_code_used')}

async def mark_free_swap_used(wallet_address: str) -> bool:
    """
    Mark that user has used their free swap
    Returns: True if successful
    """
    wallet_lower = wallet_address.lower()
    
    result = await users_collection.update_one(
        {'wallet': wallet_lower, 'free_swap_used': False},
        {
            '$set': {
                'free_swap_used': True,
                'free_swap_used_at': datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return result.modified_count > 0

async def get_referral_stats(wallet_address: str) -> dict:
    """
    Get referral statistics for a wallet
    """
    wallet_lower = wallet_address.lower()
    
    referral = await referrals_collection.find_one({'wallet': wallet_lower})
    
    if not referral:
        return {
            'code': None,
            'total_referrals': 0,
            'rewards': 0,
            'referred_users': []
        }
    
    return {
        'code': referral['code'],
        'total_referrals': referral.get('uses', 0),
        'rewards': referral.get('rewards', 0),
        'referred_users': referral.get('referred_users', [])
    }
