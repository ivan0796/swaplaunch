import React, { useState, useEffect } from 'react';
import { getTrendingTokens } from '../services/coinmarketcap';
import { TrendingUp, ExternalLink } from 'lucide-react';
import { formatPriceChange, getPriceChangeColor } from '../services/coinmarketcap';

const TrendingTokens = ({ onTokenSelect }) => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setLoading(true);
    const data = await getTrendingTokens();
    setTrending(data.slice(0, 6)); // Top 6
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trending Tokens
        </h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="trending-tokens" className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          Trending Tokens
        </h3>
        <button
          onClick={fetchTrending}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {trending.map((item, index) => {
          const coin = item.item;
          const priceChange = coin.data?.price_change_percentage_24h?.usd || 0;
          
          return (
            <div
              key={coin.id}
              data-testid={`trending-token-${index}`}
              className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
              onClick={() => onTokenSelect && onTokenSelect(coin)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-sm font-bold text-gray-400 w-6">
                  #{index + 1}
                </div>
                {coin.thumb && (
                  <img
                    src={coin.thumb}
                    alt={coin.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">{coin.name}</div>
                  <div className="text-xs text-gray-500 uppercase">
                    {coin.symbol}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium">
                  ${coin.data?.price?.toFixed(coin.data?.price > 1 ? 2 : 6) || 'N/A'}
                </div>
                <div className={`text-xs font-medium ${getPriceChangeColor(priceChange)}`}>
                  {formatPriceChange(priceChange)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Powered by CoinGecko
      </div>
    </div>
  );
};

export default TrendingTokens;