import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Zap, Shield } from 'lucide-react';

/**
 * RouteBreakdown Component
 * 
 * Displays a detailed breakdown of swap route and fees.
 * Shows: Route path, Gas fees, DEX fees, Platform fee (tiered), Total costs
 * 
 * Props:
 * - quote: Quote object from API with tiered fee fields
 * - sellToken: Sell token object
 * - buyToken: Buy token object
 * - chainId: Current chain ID
 */
const RouteBreakdown = ({ quote, sellToken, buyToken, chainId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!quote || !sellToken || !buyToken) {
    return null;
  }

  // Extract route information
  const routeName = quote.sources?.[0]?.name || '0x Protocol';
  const routeSources = quote.sources?.slice(0, 3).map(s => s.name).join(' → ') || 'Best Route';
  
  // ETA estimation (in seconds, convert to readable format)
  const eta = quote.estimatedGas ? Math.ceil(parseInt(quote.estimatedGas) / 21000) * 13 : 30; // ~13s per block
  const etaText = eta < 60 ? `~${eta}s` : `~${Math.ceil(eta / 60)}m`;
  
  // Gas estimation (from quote or estimate)
  const gasEstimate = quote.gas ? parseInt(quote.gas) : null;
  const gasPrice = quote.gasPrice ? parseInt(quote.gasPrice) : null;
  const gasCostWei = gasEstimate && gasPrice ? gasEstimate * gasPrice : null;
  const gasCostEth = gasCostWei ? (gasCostWei / 1e18).toFixed(6) : 'Estimating...';
  
  // Get chain name
  const chainNames = {
    1: 'Ethereum',
    56: 'BNB Chain',
    137: 'Polygon',
    42161: 'Arbitrum',
    10: 'Optimism',
    8453: 'Base',
    43114: 'Avalanche',
    0: 'Solana'
  };
  const chainName = chainNames[chainId] || 'EVM Chain';

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
            Why this route?
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 italic">
            (We show route, gas, protocol fees and our platform fee. You sign in your own wallet — we never hold funds.)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          {/* Route Path */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                ROUTE PATH
              </span>
            </div>
            <div className="ml-6 text-sm">
              <div className="font-medium text-gray-800 dark:text-gray-200">{routeName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {routeSources}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {sellToken.symbol} → {buyToken.symbol} on {chainName}
              </div>
              <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1">
                ETA: {etaText}
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              FEE BREAKDOWN
            </div>
            <div className="space-y-2 text-sm">
              {/* Network Gas Fee */}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Network Gas Fee</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  ~{gasCostEth} ETH
                </span>
              </div>

              {/* DEX/Bridge Route Fee */}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">DEX Route Fee</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Included in rate
                </span>
              </div>

              {/* Platform Fee (Tiered) */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                      <p className="font-semibold mb-1">Why Platform Fee?</p>
                      <p>We aggregate the best routes, maintain infrastructure, and ensure non-custodial service. Your funds never leave your wallet.</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  {quote.feeTier && (
                    <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-semibold">
                      Tier {quote.feeTier} · {quote.feePercent}%
                    </span>
                  )}
                </div>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {quote.feeUsd ? `$${quote.feeUsd.toFixed(2)}` : `${quote.feePercent || 0.2}%`}
                </span>
              </div>

              {/* Tiered Fee Note */}
              {quote.feeTier && quote.amountInUsd && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-2 border-l-2 border-purple-300 dark:border-purple-700">
                  Your trade of ${quote.amountInUsd.toFixed(2)} qualifies for{' '}
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {quote.feeTier.replace(/_/g, ' ')}
                  </span>
                  {quote.nextTier && (
                    <span>
                      . Trade ${quote.nextTier.amount_needed_usd.toFixed(0)} more for {quote.nextTier.fee_percent}% fee.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Security Note */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  You control your wallet.
                </span>
                {' '}Your private keys never leave your device. All transactions are signed by you.
              </div>
            </div>
          </div>

          {/* Quote Version Info */}
          {quote.quoteVersion && (
            <div className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2 border-t border-gray-100 dark:border-gray-800">
              Quote Version: {quote.quoteVersion}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteBreakdown;
