import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, Sparkles, Flame } from 'lucide-react';
import { Button } from './ui/button';
import analytics from '../lib/analytics';
import { usePromotions } from '../hooks/usePromotions';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TrendingTokensV2 = ({ onTokenSelect }) => {
  const [category, setCategory] = useState('top');
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get promoted tokens
  const { promotions: trendingPromotions } = usePromotions('trending_boost');
  const { promotions: featuredPromotions } = usePromotions('featured_token');
  
  const isPromoted = (tokenAddress) => {
    return trendingPromotions.some(p => p.token_address.toLowerCase() === tokenAddress?.toLowerCase()) ||
           featuredPromotions.some(p => p.token_address.toLowerCase() === tokenAddress?.toLowerCase());
  };

  useEffect(() => {
    fetchTrending();
  }, [category]);

  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/trending/categories`, {
        params: { category }
      });
      setTokens(response.data.tokens || []);
    } catch (err) {
      console.error('Error fetching trending:', err);
      setError('Failed to load trending tokens');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'gainers':
        return <TrendingUp className="w-4 h-4" />;
      case 'losers':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'gainers':
        return 'text-green-600 dark:text-green-400';
      case 'losers':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">🔥 Trending</span>
        </div>
        <button
          onClick={fetchTrending}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Boost CTA */}
      <Link 
        to="/advertise?product=trending"
        onClick={() => analytics.ctaClick('boost_my_launch', 'trending_section')}
      >
        <Button 
          variant="outline"
          size="sm"
          className="w-full bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700 hover:border-yellow-300 dark:hover:border-yellow-600"
        >
          <Sparkles className="w-4 h-4 mr-2 text-yellow-600" />
          <span className="text-yellow-900 dark:text-yellow-200 font-semibold">Boost My Launch</span>
        </Button>
      </Link>

      {/* Tabs */}
      <div className="flex gap-2">
        {['top', 'gainers', 'losers'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              {getCategoryIcon(cat)}
              <span className="capitalize">{cat}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Token List */}
      <div className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
        {loading && !tokens.length ? (
          <div className="py-8 text-center">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">No tokens found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tokens.slice(0, 6).map((token, index) => {
              const priceChange = token.price_change_24h || 0;
              const isPositive = priceChange >= 0;
              
              return (
                <div 
                  key={token.id} 
                  className={`relative ${
                    token.promoted 
                      ? 'ring-2 ring-yellow-400 dark:ring-yellow-500 rounded-xl' 
                      : ''
                  }`}
                >
                  {/* Promoted Badge */}
                  {token.promoted && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        Promoted
                      </span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      if (token.promoted) {
                        analytics.trendingBoostClick(token.name || token.symbol);
                      }
                      onTokenSelect && onTokenSelect(token);
                    }}
                    className="w-full p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank & Logo */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 w-5">
                          #{index + 1}
                        </span>
                        {token.image && (
                          <img
                            src={token.image}
                            alt={token.symbol}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>

                      {/* Token Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">
                            {token.symbol}
                          </span>
                          <a
                            href={`https://www.coingecko.com/en/coins/${token.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="View on CoinGecko"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                          </a>
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {token.name}
                        </div>
                      </div>

                      {/* Price & Change */}
                      <div className="text-right">
                      <div className="text-sm font-semibold">
                        ${token.current_price?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6
                        })}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {priceChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </button>
              </div>
              );
            })}
          </div>
        )}

        {/* Powered by */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500">Powered by CoinGecko</p>
        </div>
      </div>
    </div>
  );
};

export default TrendingTokensV2;
