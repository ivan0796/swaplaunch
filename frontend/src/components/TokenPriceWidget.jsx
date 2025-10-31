import React, { useState, useEffect } from 'react';
import { getTokenPrice, formatPriceChange, getPriceChangeColor } from '../services/coingecko';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TokenPriceWidget = ({ coinId }) => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coinId) {
      fetchPrice();
    }
  }, [coinId]);

  const fetchPrice = async () => {
    setLoading(true);
    const data = await getTokenPrice(coinId);
    setPriceData(data);
    setLoading(false);
  };

  if (!coinId || loading) {
    return null;
  }

  if (!priceData) {
    return null;
  }

  const priceChange = priceData.price_change_24h || 0;
  const isPositive = priceChange >= 0;

  return (
    <div data-testid="token-price-widget" className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-gray-600 uppercase font-medium">
            {priceData.symbol}
          </div>
          <div className="text-2xl font-bold">
            ${priceData.current_price?.toFixed(priceData.current_price > 1 ? 2 : 6)}
          </div>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 ${getPriceChangeColor(priceChange)}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">
              {formatPriceChange(priceChange)}%
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">24h Change</div>
        </div>
      </div>

      {/* Mini Sparkline */}
      {priceData.sparkline_7d && priceData.sparkline_7d.length > 0 && (
        <div className="h-12 relative">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 168 48"
            preserveAspectRatio="none"
            className="w-full"
          >
            <polyline
              fill="none"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              points={priceData.sparkline_7d
                .slice(0, 168)
                .map((price, i) => {
                  const minPrice = Math.min(...priceData.sparkline_7d);
                  const maxPrice = Math.max(...priceData.sparkline_7d);
                  const range = maxPrice - minPrice || 1;
                  const y = 48 - ((price - minPrice) / range) * 48;
                  return `${i},${y}`;
                })
                .join(' ')}
            />
          </svg>
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center mt-2">
        7-day price chart
      </div>
    </div>
  );
};

export default TokenPriceWidget;