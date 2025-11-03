"""
A/B Testing Module for Fee Tier Rollout
========================================

Determines user cohorts (tiered vs. control) based on wallet address hashing.
Ensures stable cohort assignment across sessions.

No PII stored - only uses hashed wallet addresses for bucketing.
"""

import os
import hashlib
from typing import Literal, Dict
from datetime import datetime, timezone

# Feature Flags
FEE_TIERED_ROLLOUT_PERCENT = int(os.getenv('FEE_TIERED_ROLLOUT_PERCENT', '20'))
FEE_TIERED_BUCKET_SEED = os.getenv('FEE_TIERED_BUCKET_SEED', 'swaplaunch-2025-fee-tier-test')

# Control (baseline) fee
CONTROL_FEE_PERCENT = 0.25  # M1 tier (Balanced)

CohortType = Literal["tiered", "control"]

def get_user_cohort(wallet_address: str) -> CohortType:
    """
    Determine user cohort based on wallet address.
    
    Uses SHA256(lowercase(wallet) + salt) % 100 for stable assignment.
    
    Args:
        wallet_address: User's wallet address (EVM or Solana)
        
    Returns:
        'tiered' or 'control'
    """
    if not wallet_address:
        return "control"
    
    # Normalize wallet address
    normalized_wallet = wallet_address.lower().strip()
    
    # Create stable hash with salt
    hash_input = f"{normalized_wallet}{FEE_TIERED_BUCKET_SEED}".encode('utf-8')
    hash_digest = hashlib.sha256(hash_input).hexdigest()
    
    # Convert first 8 hex chars to int and mod 100
    bucket = int(hash_digest[:8], 16) % 100
    
    # Assign cohort based on rollout percentage
    if bucket < FEE_TIERED_ROLLOUT_PERCENT:
        return "tiered"
    else:
        return "control"

def get_cohort_fee_info(cohort: CohortType, amount_usd: float = None) -> Dict:
    """
    Get fee information based on cohort.
    
    Args:
        cohort: User's cohort ('tiered' or 'control')
        amount_usd: Trade amount in USD (for tiered cohort)
        
    Returns:
        Fee info dict compatible with calculate_tiered_fee format
    """
    if cohort == "control":
        # Control group: fixed 0.25% fee
        return {
            "cohort": "control",
            "fee_tier": "CONTROL_M1",
            "fee_percent": CONTROL_FEE_PERCENT,
            "fee_usd": round(amount_usd * CONTROL_FEE_PERCENT / 100, 2) if amount_usd else None,
            "amount_in_usd": round(amount_usd, 2) if amount_usd else None,
            "next_tier": None,
            "notes": f"Control group: Fixed {CONTROL_FEE_PERCENT}% fee",
            "quote_version": "v1-ab-control"
        }
    else:
        # Tiered group: will use calculate_tiered_fee from fee_calculator
        # This is just a placeholder, actual calculation done in server.py
        return {
            "cohort": "tiered",
            # Other fields will be filled by calculate_tiered_fee
        }

def log_cohort_event(wallet_address: str, cohort: CohortType, event_type: str, 
                     amount_usd: float = None, fee_usd: float = None, 
                     chain: str = None) -> Dict:
    """
    Create cohort event log entry.
    
    Args:
        wallet_address: User's wallet
        cohort: User's cohort
        event_type: 'quote' or 'execution'
        amount_usd: Trade amount in USD
        fee_usd: Fee amount in USD
        chain: Blockchain name
        
    Returns:
        Log entry dict (ready for MongoDB)
    """
    # Hash wallet for privacy
    wallet_hash = hashlib.sha256(wallet_address.encode()).hexdigest()[:16]
    
    return {
        "wallet_hash": wallet_hash,
        "cohort": cohort,
        "event_type": event_type,
        "amount_usd": amount_usd,
        "fee_usd": fee_usd,
        "chain": chain,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "rollout_percent": FEE_TIERED_ROLLOUT_PERCENT
    }
