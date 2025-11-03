"""
Unit Tests for Tiered Fee Calculator
=====================================

Tests all tier boundaries and edge cases.
"""

import pytest
from decimal import Decimal
from fee_calculator import (
    calculate_tiered_fee,
    apply_fee_to_amount,
    get_fallback_fee,
    calculate_net_amount_in,
    MAX_FEE_PERCENT
)


class TestTieredFeeCalculation:
    """Test tiered fee calculation with boundary values."""
    
    def test_tier1_below_1k(self):
        """Test Tier 1: < $1,000 → 0.35%"""
        result = calculate_tiered_fee(500.0)
        assert result["fee_tier"] == "T1_0_1k"
        assert result["fee_percent"] == 0.35
        assert result["fee_usd"] == 1.75  # 500 * 0.35%
        assert result["amount_in_usd"] == 500.0
        
    def test_tier1_boundary_999_99(self):
        """Test Tier 1 upper boundary: $999.99"""
        result = calculate_tiered_fee(999.99)
        assert result["fee_tier"] == "T1_0_1k"
        assert result["fee_percent"] == 0.35
        assert result["fee_usd"] == 3.50  # 999.99 * 0.35% = 3.499965 → 3.50
        
    def test_tier2_exact_1k(self):
        """Test Tier 2 lower boundary: exactly $1,000"""
        result = calculate_tiered_fee(1000.0)
        assert result["fee_tier"] == "T2_1k_5k"
        assert result["fee_percent"] == 0.30
        assert result["fee_usd"] == 3.00
        
    def test_tier2_mid_range(self):
        """Test Tier 2: $1,000–$4,999 → 0.30%"""
        result = calculate_tiered_fee(2500.0)
        assert result["fee_tier"] == "T2_1k_5k"
        assert result["fee_percent"] == 0.30
        assert result["fee_usd"] == 7.50
        
    def test_tier2_boundary_4999_99(self):
        """Test Tier 2 upper boundary: $4,999.99"""
        result = calculate_tiered_fee(4999.99)
        assert result["fee_tier"] == "T2_1k_5k"
        assert result["fee_percent"] == 0.30
        
    def test_tier3_exact_5k(self):
        """Test Tier 3 lower boundary: exactly $5,000"""
        result = calculate_tiered_fee(5000.0)
        assert result["fee_tier"] == "T3_5k_10k"
        assert result["fee_percent"] == 0.25
        assert result["fee_usd"] == 12.50
        
    def test_tier3_boundary_9999_99(self):
        """Test Tier 3 upper boundary: $9,999.99"""
        result = calculate_tiered_fee(9999.99)
        assert result["fee_tier"] == "T3_5k_10k"
        assert result["fee_percent"] == 0.25
        
    def test_tier4_exact_10k(self):
        """Test Tier 4 lower boundary: exactly $10,000"""
        result = calculate_tiered_fee(10000.0)
        assert result["fee_tier"] == "T4_10k_50k"
        assert result["fee_percent"] == 0.20
        assert result["fee_usd"] == 20.00
        
    def test_tier4_mid_range(self):
        """Test Tier 4: $10,000–$49,999 → 0.20%"""
        result = calculate_tiered_fee(25000.0)
        assert result["fee_tier"] == "T4_10k_50k"
        assert result["fee_percent"] == 0.20
        assert result["fee_usd"] == 50.00
        
    def test_tier4_boundary_49999_99(self):
        """Test Tier 4 upper boundary: $49,999.99"""
        result = calculate_tiered_fee(49999.99)
        assert result["fee_tier"] == "T4_10k_50k"
        assert result["fee_percent"] == 0.20
        
    def test_tier5_exact_50k(self):
        """Test Tier 5 lower boundary: exactly $50,000"""
        result = calculate_tiered_fee(50000.0)
        assert result["fee_tier"] == "T5_50k_100k"
        assert result["fee_percent"] == 0.15
        assert result["fee_usd"] == 75.00
        
    def test_tier5_boundary_99999_99(self):
        """Test Tier 5 upper boundary: $99,999.99"""
        result = calculate_tiered_fee(99999.99)
        assert result["fee_tier"] == "T5_50k_100k"
        assert result["fee_percent"] == 0.15
        
    def test_tier6_exact_100k(self):
        """Test Tier 6 lower boundary: exactly $100,000"""
        result = calculate_tiered_fee(100000.0)
        assert result["fee_tier"] == "T6_100k_plus"
        assert result["fee_percent"] == 0.10
        assert result["fee_usd"] == 100.00
        
    def test_tier6_large_amount(self):
        """Test Tier 6: >= $100,000 → 0.10%"""
        result = calculate_tiered_fee(500000.0)
        assert result["fee_tier"] == "T6_100k_plus"
        assert result["fee_percent"] == 0.10
        assert result["fee_usd"] == 500.00
        
    def test_zero_amount(self):
        """Test edge case: $0"""
        result = calculate_tiered_fee(0.0)
        assert result["fee_tier"] == "T1_0_1k"
        assert result["fee_percent"] == 0.35
        assert result["fee_usd"] == 0.00
        
    def test_negative_amount_raises_error(self):
        """Test that negative amounts raise ValueError"""
        with pytest.raises(ValueError):
            calculate_tiered_fee(-100.0)
            
    def test_very_small_amount(self):
        """Test very small amount: $0.01"""
        result = calculate_tiered_fee(0.01)
        assert result["fee_tier"] == "T1_0_1k"
        assert result["fee_percent"] == 0.35
        assert result["fee_usd"] == 0.00  # Rounds to 0.00
        
    def test_rounding_precision(self):
        """Test Banker's rounding (ROUND_HALF_EVEN)"""
        # Test case where rounding matters
        result = calculate_tiered_fee(714.2857)
        assert result["fee_percent"] == 0.35
        # 714.2857 * 0.0035 = 2.4999999... → should round to 2.50
        assert result["fee_usd"] == 2.50


class TestNextTierCalculation:
    """Test next tier threshold calculations."""
    
    def test_next_tier_from_tier1(self):
        """Test next tier info from Tier 1"""
        result = calculate_tiered_fee(800.0)
        assert result["next_tier"] is not None
        assert result["next_tier"]["tier_id"] == "T2_1k_5k"
        assert result["next_tier"]["fee_percent"] == 0.30
        assert result["next_tier"]["amount_needed_usd"] == 200.0
        assert result["next_tier"]["threshold_usd"] == 1000.0
        
    def test_next_tier_from_tier4(self):
        """Test next tier info from Tier 4"""
        result = calculate_tiered_fee(30000.0)
        assert result["next_tier"] is not None
        assert result["next_tier"]["tier_id"] == "T5_50k_100k"
        assert result["next_tier"]["amount_needed_usd"] == 20000.0
        
    def test_no_next_tier_from_tier6(self):
        """Test that Tier 6 has no next tier"""
        result = calculate_tiered_fee(100000.0)
        assert result["next_tier"] is None


class TestFeeApplication:
    """Test applying fee to amounts."""
    
    def test_apply_fee_basic(self):
        """Test basic fee application"""
        net, fee = apply_fee_to_amount("1000000000000000000", 0.30)  # 1 ETH, 0.30%
        assert fee == "3000000000000000"  # 0.003 ETH
        assert net == "997000000000000000"  # 0.997 ETH
        
    def test_apply_fee_rounds_down(self):
        """Test that fee rounds down (user benefit)"""
        net, fee = apply_fee_to_amount("1000", 0.35)
        # 1000 * 0.0035 = 3.5 → rounds down to 3
        assert fee == "3"
        assert net == "997"
        
    def test_calculate_net_amount_in(self):
        """Test net amount calculation"""
        fee_info = calculate_tiered_fee(1000.0)
        net = calculate_net_amount_in("1000000", fee_info)
        # 1000000 * 0.997 = 997000
        assert net == "997000"


class TestFallbackBehavior:
    """Test fallback when USD price unavailable."""
    
    def test_fallback_fee(self):
        """Test fallback fee structure"""
        result = get_fallback_fee("Price oracle timeout")
        assert result["fee_tier"] == "FALLBACK"
        assert result["fee_percent"] == 0.30
        assert result["fee_usd"] is None
        assert result["amount_in_usd"] is None
        assert "Price oracle timeout" in result["notes"]
        assert result["quote_version"] == "v1-tiered-fallback"


class TestQuoteVersioning:
    """Test quote versioning."""
    
    def test_quote_version_field(self):
        """Test that quote_version is included"""
        result = calculate_tiered_fee(5000.0)
        assert "quote_version" in result
        assert result["quote_version"] == "v1-tiered"


class TestSafetyCaps:
    """Test safety caps and limits."""
    
    def test_max_fee_cap_not_exceeded(self):
        """Test that fee never exceeds MAX_FEE_PERCENT"""
        # All tiers should be under 1%
        for amount in [100, 1000, 10000, 100000, 1000000]:
            result = calculate_tiered_fee(amount)
            assert result["fee_percent"] <= MAX_FEE_PERCENT


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
