import React from 'react';
import { Info, TrendingDown } from 'lucide-react';

const FeeBreakdownBar = ({ quote, platformFeeBps = 20 }) => {
  if (!quote) return null;

  // Calculate fees
  const buyAmount = quote.buyAmount || '0';
  const sellAmount = quote.sellAmount || '0';
  const gasPrice = quote.gas || '0';
  
  // Platform fee calculation (0.2% = 20 bps)
  const platformFeePercent = (platformFeeBps / 10000) * 100;
  const platformFeeAmount = (parseFloat(sellAmount) * platformFeeBps / 10000).toFixed(6);
  
  // Price impact
  const priceImpact = quote.priceImpact || '0.1';
  const priceImpactColor = parseFloat(priceImpact) > 3 ? 'text-red-600' : parseFloat(priceImpact) > 1 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Info className="w-4 h-4" />
        <span>Fee Breakdown</span>
      </div>
      
      <div className="space-y-2 text-sm">
        {/* DEX Fee */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">DEX Fee</span>
          <span className="font-medium">~0.3%</span>
        </div>
        
        {/* Platform Fee */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Platform Fee</span>
          <span className="font-medium">{platformFeePercent}%</span>
        </div>
        
        {/* Price Impact */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Price Impact
          </span>
          <span className={`font-medium ${priceImpactColor}`}>{priceImpact}%</span>
        </div>
        
        {/* Gas Cost */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-gray-600">Estimated Gas</span>
          <span className="font-medium">{gasPrice} Gwei</span>
        </div>
      </div>
      
      {/* Warning for high price impact */}
      {parseFloat(priceImpact) > 3 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2 text-xs text-red-800">
          <Info className="w-4 h-4" />
          <span>High price impact! Consider reducing swap amount.</span>
        </div>
      )}
    </div>
  );
};

export default FeeBreakdownBar;