"""
Non-Custodial Tiered Fee Calculator
=====================================

Calculates platform fees based on current trade amount in USD.
No user history, no custody, no storage of funds/keys.

Fee Tiers (based on USD trade amount):
- < $1,000:          0.35%
- $1,000-$4,999:     0.30%
- $5,000-$9,999:     0.25%
- $10,000-$49,999:   0.20%
- $50,000-$99,999:   0.15%
- >= $100,000:       0.10%

Max Fee Cap: 1.0% (safety)
"""

from typing import Dict, Tuple
from decimal import Decimal, ROUND_HALF_EVEN
import os
import json

# Feature Flag
FEE_TIERED_ENABLED = os.getenv('FEE_TIERED_ENABLED', 'true').lower() == 'true'

# Default Tier Configuration
DEFAULT_TIERS = [
    {"min": 0, "max": 1000, "fee": 0.35, "id": "T1_0_1k"},
    {"min": 1000, "max": 5000, "fee": 0.30, "id": "T2_1k_5k"},
    {"min": 5000, "max": 10000, "fee": 0.25, "id": "T3_5k_10k"},
    {"min": 10000, "max": 50000, "fee": 0.20, "id": "T4_10k_50k"},
    {"min": 50000, "max": 100000, "fee": 0.15, "id": "T5_50k_100k"},
    {"min": 100000, "max": float('inf'), "fee": 0.10, "id": "T6_100k_plus"}
]

# Load tiers from ENV if available
def load_tiers():
    tiers_json = os.getenv('FEE_TIERS_CONFIG')
    if tiers_json:
        try:
            return json.loads(tiers_json)
        except json.JSONDecodeError:
            print("WARNING: Invalid FEE_TIERS_CONFIG, using defaults")
    return DEFAULT_TIERS

FEE_TIERS = load_tiers()

# Safety Caps
MAX_FEE_PERCENT = 1.0  # 1% hard cap
DEFAULT_FALLBACK_FEE = 0.30  # If USD price unavailable


def calculate_tiered_fee(amount_usd: float) -> Dict:
    """
    Calculate tiered fee based on USD trade amount.
    
    Args:
        amount_usd: Trade amount in USD (current swap only)
        
    Returns:
        Dict with:
        - fee_tier: string (tier ID)
        - fee_percent: float (exact percent)
        - fee_usd: float (rounded to 2 decimals)
        - amount_in_usd: float (input amount)
        - next_tier: dict or None (info about next lower tier)
        - notes: string (explanation)
        
    Raises:
        ValueError: if amount_usd is negative
    """
    if amount_usd < 0:
        raise ValueError("amount_usd cannot be negative")
    
    # Find matching tier
    matched_tier = None
    for tier in FEE_TIERS:
        if tier["min"] <= amount_usd < tier["max"]:
            matched_tier = tier
            break
    
    # Fallback if no tier matched (shouldn't happen with proper config)
    if not matched_tier:
        matched_tier = FEE_TIERS[-1]  # Use highest tier
    
    fee_percent = matched_tier["fee"]
    
    # Apply safety cap
    if fee_percent > MAX_FEE_PERCENT:
        fee_percent = MAX_FEE_PERCENT
        notes = f"Fee capped at {MAX_FEE_PERCENT}% (safety limit)"
    else:
        notes = f"Tiered platform fee applied: {fee_percent}%"
    
    # Calculate fee in USD with Banker's rounding (ROUND_HALF_EVEN)
    fee_decimal = Decimal(str(amount_usd)) * Decimal(str(fee_percent)) / Decimal('100')
    fee_usd = float(fee_decimal.quantize(Decimal('0.01'), rounding=ROUND_HALF_EVEN))
    
    # Find next tier (lower fee)
    next_tier = None
    current_tier_index = FEE_TIERS.index(matched_tier)
    if current_tier_index < len(FEE_TIERS) - 1:
        next_tier_data = FEE_TIERS[current_tier_index + 1]
        amount_to_next = next_tier_data["min"] - amount_usd
        if amount_to_next > 0:
            next_tier = {
                "tier_id": next_tier_data["id"],
                "fee_percent": next_tier_data["fee"],
                "amount_needed_usd": round(amount_to_next, 2),
                "threshold_usd": next_tier_data["min"]
            }
    
    return {
        "fee_tier": matched_tier["id"],
        "fee_percent": fee_percent,
        "fee_usd": fee_usd,
        "amount_in_usd": round(amount_usd, 2),
        "next_tier": next_tier,
        "notes": notes,
        "quote_version": "v1-tiered"
    }


def apply_fee_to_amount(amount_in: str, fee_percent: float) -> Tuple[str, str]:
    """
    Apply fee to input amount (reduce input by fee).
    
    Args:
        amount_in: Input amount as string (wei/lamports/smallest unit)
        fee_percent: Fee percentage to apply
        
    Returns:
        Tuple of (net_amount_in, fee_amount) as strings
    """
    amount_decimal = Decimal(amount_in)
    fee_decimal = amount_decimal * Decimal(str(fee_percent)) / Decimal('100')
    
    # Round down fee (user gets benefit of rounding)
    fee_amount = int(fee_decimal)
    net_amount = int(amount_decimal - fee_amount)
    
    return str(net_amount), str(fee_amount)


def get_fallback_fee(reason: str = "USD price unavailable") -> Dict:
    """
    Get fallback fee when USD valuation fails.
    
    Args:
        reason: Reason for fallback
        
    Returns:
        Fallback fee structure
    """
    return {
        "fee_tier": "FALLBACK",
        "fee_percent": DEFAULT_FALLBACK_FEE,
        "fee_usd": None,
        "amount_in_usd": None,
        "next_tier": None,
        "notes": f"⚠️ {reason}. Using fallback fee: {DEFAULT_FALLBACK_FEE}%",
        "quote_version": "v1-tiered-fallback"
    }


def calculate_net_amount_in(amount_in: str, fee_info: Dict) -> str:
    """
    Calculate net amount after fee deduction.
    
    Args:
        amount_in: Input amount as string
        fee_info: Fee info from calculate_tiered_fee
        
    Returns:
        Net amount as string
    """
    net_amount, _ = apply_fee_to_amount(amount_in, fee_info["fee_percent"])
    return net_amount
