"""
Integration Tests for Tiered Fee APIs
======================================

Tests EVM and Solana Quote APIs with tiered fees.
"""

import pytest
import httpx
import os

BACKEND_URL = os.getenv("REACT_APP_BACKEND_URL", "http://localhost:8001")


class TestEVMQuoteAPI:
    """Test EVM Quote API with tiered fees."""
    
    @pytest.mark.asyncio
    async def test_evm_quote_includes_tiered_fee_fields(self):
        """Test that EVM quote includes all new tiered fee fields"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BACKEND_URL}/api/evm/quote",
                json={
                    "chain": "polygon",
                    "sellToken": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",  # MATIC
                    "buyToken": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",  # USDC
                    "sellAmount": "1000000000000000000",  # 1 MATIC
                    "takerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
                },
                timeout=30.0
            )
            
            assert response.status_code == 200
            data = response.json()
            
            # Check new fields exist
            assert "feeTier" in data
            assert "feePercent" in data
            assert "feeUsd" in data
            assert "amountInUsd" in data
            assert "netAmountIn" in data
            assert "originalAmountIn" in data
            assert "nextTier" in data or data.get("nextTier") is None
            assert "notes" in data
            assert "quoteVersion" in data
            
            # Check backward compatibility
            assert "platformFee" in data
            assert "chain" in data
            assert "chain_id" in data
            
            print(f"✅ EVM Quote Response includes all tiered fee fields")
            print(f"   Tier: {data['feeTier']}, Fee: {data['feePercent']}%")
            if data.get('feeUsd'):
                print(f"   Fee USD: ${data['feeUsd']}, Amount USD: ${data['amountInUsd']}")
    
    @pytest.mark.asyncio
    async def test_evm_quote_same_usd_value_same_tier(self):
        """Test that trades with same USD value get same tier"""
        # This test would require mocking price oracle or using known stable pairs
        # Placeholder for now
        pass


class TestSolanaQuoteAPI:
    """Test Solana Quote API with tiered fees."""
    
    @pytest.mark.asyncio
    async def test_solana_quote_includes_tiered_fee_fields(self):
        """Test that Solana quote includes all new tiered fee fields"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BACKEND_URL}/api/solana/quote",
                json={
                    "inputMint": "So11111111111111111111111111111111111111112",  # SOL
                    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
                    "amount": "1000000000",  # 1 SOL
                    "slippageBps": 50,
                    "userPublicKey": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
                },
                timeout=30.0
            )
            
            assert response.status_code == 200
            data = response.json()
            
            # Check new fields exist
            assert "feeTier" in data
            assert "feePercent" in data
            assert "feeUsd" in data
            assert "amountInUsd" in data
            assert "netAmountIn" in data
            assert "originalAmountIn" in data
            assert "nextTier" in data or data.get("nextTier") is None
            assert "notes" in data
            assert "quoteVersion" in data
            
            # Check backward compatibility
            assert "platformFee" in data
            assert "chain" in data
            
            print(f"✅ Solana Quote Response includes all tiered fee fields")
            print(f"   Tier: {data['feeTier']}, Fee: {data['feePercent']}%")
            if data.get('feeUsd'):
                print(f"   Fee USD: ${data['feeUsd']}, Amount USD: ${data['amountInUsd']}")


class TestTierConsistency:
    """Test tier consistency across chains."""
    
    @pytest.mark.asyncio
    async def test_fallback_behavior_without_usd_price(self):
        """Test that API gracefully handles missing USD prices"""
        # This would test with a token that has no price data
        # Should return FALLBACK tier with 0.30% fee
        pass


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
