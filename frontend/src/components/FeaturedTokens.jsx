import React, { useState, useEffect } from 'react';
import { usePromotions } from '../hooks/usePromotions';
import { Star, TrendingUp, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { TokenLogo } from '../utils/tokenLogoResolver';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const FeaturedTokens = () => {
  const { promotions, loading } = usePromotions('featured_token');
  const [tokenInfo, setTokenInfo] = useState({});

  // Fetch token info from backend for each promotion
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!promotions || promotions.length === 0) return;

      const infoMap = {};
      for (const promo of promotions.slice(0, 3)) {
        try {
          // Use the token resolve endpoint to get token info
          const response = await axios.get(`${API}/api/token/resolve`, {
            params: {
              query: promo.token_address,
              limit: 1
            }
          });

          if (response.data.results && response.data.results.length > 0) {
            const token = response.data.results[0];
            infoMap[promo.token_address] = {
              name: token.name || 'Unknown Token',
              symbol: token.symbol || 'N/A',
              logoURI: token.logoURI || null
            };
          } else {
            // Fallback to shortened address
            infoMap[promo.token_address] = {
              name: `${promo.token_address.slice(0, 6)}...${promo.token_address.slice(-4)}`,
              symbol: 'TOKEN',
              logoURI: null
            };
          }
        } catch (error) {
          console.error('Error fetching token info:', error);
          infoMap[promo.token_address] = {
            name: `${promo.token_address.slice(0, 6)}...${promo.token_address.slice(-4)}`,
            symbol: 'TOKEN',
            logoURI: null
          };
        }
      }
      setTokenInfo(infoMap);
    };

    fetchTokenInfo();
  }, [promotions]);

  if (loading) {
    return null;
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
          <h2 className="text-2xl font-bold dark:text-white">Featured Tokens</h2>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Promoted
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.slice(0, 3).map((promo) => {
          const info = tokenInfo[promo.token_address] || {
            name: 'Loading...',
            symbol: '...',
            logoURI: null
          };

          return (
            <div
              key={promo.promotion_id}
              className="relative bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-400 dark:border-yellow-600 shadow-lg hover:shadow-xl transition-all group"
            >
              {/* Featured Badge */}
              <div className="absolute -top-3 -right-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  FEATURED
                </div>
              </div>

              {/* Token Info */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  {/* Token Logo and Name */}
                  <div className="flex items-center gap-2">
                    <TokenLogo
                      address={promo.token_address}
                      chainId={promo.chain === 'solana' ? 0 : 1}
                      symbol={info.symbol}
                      name={info.name}
                      logoURI={info.logoURI}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-base font-bold dark:text-white truncate">
                        {info.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {info.symbol}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{promo.chain}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Promoted until {new Date(promo.expires_at).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                  onClick={() => {
                    // Navigate to token details or swap
                    console.log('Trade token:', promo.token_address);
                  }}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trade
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-yellow-400 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  onClick={() => {
                    // Open explorer or details
                    console.log('View token:', promo.token_address);
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-orange-400/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedTokens;
