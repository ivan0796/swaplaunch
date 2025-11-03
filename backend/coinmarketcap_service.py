"""
CoinMarketCap API Service
Replaces CoinGecko with CoinMarketCap Pro API
"""
import os
import httpx
import logging
from typing import Optional, Dict, List
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

CMC_API_KEY = os.environ.get('CMC_API_KEY')
CMC_BASE_URL = "https://pro-api.coinmarketcap.com/v1"

class CoinMarketCapService:
    """Service for interacting with CoinMarketCap API"""
    
    def __init__(self):
        self.api_key = CMC_API_KEY
        self.base_url = CMC_BASE_URL
        self.headers = {
            'X-CMC_PRO_API_KEY': self.api_key,
            'Accept': 'application/json'
        }
    
    async def get_trending_tokens(self) -> Dict:
        """
        Get trending tokens (using CMC's latest listings)
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/cryptocurrency/trending/latest",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"CMC API error: {response.status_code}")
                    return {"data": []}
        except Exception as e:
            logger.error(f"Error fetching trending from CMC: {str(e)}")
            return {"data": []}
    
    async def get_coin_price(self, symbol: str) -> Optional[Dict]:
        """
        Get coin price data by symbol
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/cryptocurrency/quotes/latest",
                    headers=self.headers,
                    params={'symbol': symbol.upper()}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if 'data' in data and symbol.upper() in data['data']:
                        coin_data = data['data'][symbol.upper()]
                        quote = coin_data['quote']['USD']
                        
                        return {
                            "id": coin_data.get('id'),
                            "symbol": coin_data.get('symbol'),
                            "name": coin_data.get('name'),
                            "current_price": quote.get('price'),
                            "price_change_24h": quote.get('percent_change_24h'),
                            "market_cap": quote.get('market_cap'),
                            "volume_24h": quote.get('volume_24h')
                        }
                return None
        except Exception as e:
            logger.error(f"Error fetching coin price from CMC: {str(e)}")
            return None
    
    async def get_top_tokens(self, limit: int = 15, category: str = "top") -> List[Dict]:
        """
        Get top tokens by market cap, gainers, or losers
        category: 'top', 'gainers', 'losers'
        """
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                params = {
                    'limit': limit,
                    'convert': 'USD'
                }
                
                if category == "gainers":
                    params['sort'] = 'percent_change_24h'
                    params['sort_dir'] = 'desc'
                elif category == "losers":
                    params['sort'] = 'percent_change_24h'
                    params['sort_dir'] = 'asc'
                else:  # top by market cap
                    params['sort'] = 'market_cap'
                    params['sort_dir'] = 'desc'
                
                response = await client.get(
                    f"{self.base_url}/cryptocurrency/listings/latest",
                    headers=self.headers,
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    tokens = []
                    
                    for coin in data.get('data', []):
                        quote = coin['quote']['USD']
                        tokens.append({
                            "id": str(coin.get('id')),
                            "symbol": coin.get('symbol', '').upper(),
                            "name": coin.get('name', ''),
                            "image": f"https://s2.coinmarketcap.com/static/img/coins/64x64/{coin.get('id')}.png",
                            "current_price": quote.get('price'),
                            "price_change_24h": quote.get('percent_change_24h'),
                            "market_cap": quote.get('market_cap'),
                            "market_cap_rank": coin.get('cmc_rank'),
                            "volume_24h": quote.get('volume_24h')
                        })
                    
                    return tokens
                else:
                    logger.error(f"CMC API error: {response.status_code}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching top tokens from CMC: {str(e)}")
            return []
    
    async def get_token_metadata(self, symbol: str) -> Optional[Dict]:
        """
        Get detailed token metadata
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/cryptocurrency/info",
                    headers=self.headers,
                    params={'symbol': symbol.upper()}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if 'data' in data and symbol.upper() in data['data']:
                        coin_data = data['data'][symbol.upper()]
                        return {
                            "id": coin_data.get('id'),
                            "name": coin_data.get('name'),
                            "symbol": coin_data.get('symbol'),
                            "description": coin_data.get('description'),
                            "logo": coin_data.get('logo'),
                            "urls": coin_data.get('urls', {}),
                            "platform": coin_data.get('platform')
                        }
                return None
        except Exception as e:
            logger.error(f"Error fetching token metadata from CMC: {str(e)}")
            return None

# Global instance
cmc_service = CoinMarketCapService()
