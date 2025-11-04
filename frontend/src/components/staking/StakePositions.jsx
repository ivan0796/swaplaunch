import React from 'react';
import { Inbox } from 'lucide-react';

const StakePositions = ({ mode, positions = [] }) => {
  // Empty state
  if (positions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Inbox className="w-10 h-10 text-gray-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Active Stakes Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {mode === 'sol' 
            ? 'Start staking SOL to earn rewards through validator delegation. Your funds stay in your wallet.' 
            : 'Stake SPL tokens to earn rewards. All transactions are signed by you - we never hold your assets.'}
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 max-w-lg mx-auto">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>Next step:</strong> Click "Start Staking" above to delegate your {mode === 'sol' ? 'SOL' : 'tokens'} 
            and start earning rewards. You'll sign the transaction in your wallet.
          </p>
        </div>
      </div>
    );
  }

  // Active positions (placeholder for future)
  return (
    <div className="grid gap-4">
      {positions.map((position, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          {/* Position details will go here */}
          <p className="text-gray-600 dark:text-gray-400">Position #{index + 1}</p>
        </div>
      ))}
    </div>
  );
};

export default StakePositions;
