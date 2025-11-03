import React from 'react';
import { TrendingUp, Check } from 'lucide-react';

const BestRouteComparison = ({ quotes }) => {
  if (!quotes || quotes.length === 0) return null;

  // Sort quotes by best rate
  const sortedQuotes = [...quotes].sort((a, b) => 
    parseFloat(b.buyAmount) - parseFloat(a.buyAmount)
  );

  const bestQuote = sortedQuotes[0];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <span className="font-semibold text-sm">Best Route Comparison</span>
      </div>

      <div className="space-y-2">
        {sortedQuotes.slice(0, 3).map((quote, idx) => {
          const isBest = idx === 0;
          const savings = isBest ? 0 : (
            (parseFloat(bestQuote.buyAmount) - parseFloat(quote.buyAmount)) / 
            parseFloat(bestQuote.buyAmount) * 100
          ).toFixed(2);

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                isBest
                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {isBest && <Check className="w-5 h-5 text-green-600" />}
                <div>
                  <div className="font-medium text-sm">
                    {quote.source || `Route ${idx + 1}`}
                  </div>
                  {isBest && (
                    <div className="text-xs text-green-600 font-semibold">Best Rate</div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-sm">
                  {parseFloat(quote.buyAmount).toFixed(6)}
                </div>
                {!isBest && savings > 0 && (
                  <div className="text-xs text-red-500">-{savings}%</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        ✓ Non-custodial - You sign all transactions
      </div>
    </div>
  );
};

export default BestRouteComparison;
