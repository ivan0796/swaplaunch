import React from 'react';
import { Button } from './ui/button';
import { AlertCircle, ExternalLink, Droplet, TrendingUp } from 'lucide-react';
import { VISIBILITY } from '../config/visibility';

const UserActionPrompt = ({ stage, mint, pair, onActionComplete }) => {
  // Show prompts only when user action is needed
  if (stage === 'migrated' && pair) {
    return (
      <div className="rounded-2xl border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200 mb-2">
              Action Required: Add Liquidity
            </h3>
            <p className="text-sm text-orange-800 dark:text-orange-300 mb-4">
              Your token has migrated to Raydium! To make it tradeable and visible on Dexscreener, 
              you need to add liquidity to the pool.
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                📋 Steps:
              </p>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                <li>Click "Add Liquidity on Raydium" below</li>
                <li>Connect your wallet (MetaMask, Phantom, etc.)</li>
                <li>Add your desired SOL + Token amounts</li>
                <li>Confirm the transaction in your wallet</li>
                <li>Come back here after LP is added ✓</li>
              </ol>
            </div>

            <a
              href={VISIBILITY.deepLinks.raydiumAddLiquidity(pair)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                <Droplet className="w-5 h-5 mr-2" />
                Add Liquidity on Raydium
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
            </a>

            {onActionComplete && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => onActionComplete('lp_added')}
              >
                ✓ I've Added Liquidity - Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'lp_added' && pair) {
    return (
      <div className="rounded-2xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-6">
        <div className="flex items-start gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">
              Final Step: Make First Trade
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
              To activate visibility on Dexscreener and Axiom, perform the first trade on your pool.
              This can be any small amount - even 0.01 SOL works!
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                📋 Steps:
              </p>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                <li>Click "Trade on Raydium" below</li>
                <li>Swap a small amount (0.01-0.1 SOL recommended)</li>
                <li>Confirm the transaction</li>
                <li>Wait 5-10 minutes for indexing</li>
              </ol>
            </div>

            <a
              href={VISIBILITY.deepLinks.raydiumPool(pair)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                size="lg"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Trade on Raydium
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
            </a>

            {onActionComplete && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => onActionComplete('first_trade')}
              >
                ✓ First Trade Complete - Show Links
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UserActionPrompt;
