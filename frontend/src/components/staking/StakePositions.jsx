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

  // Active positions
  return (
    <div className="grid gap-4">
      {positions.map((position) => (
        <div key={position.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold dark:text-white">{position.validator}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  position.status === 'active' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {position.status === 'active' ? '✓ Active' : 'Pending'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {position.validatorVote.slice(0, 12)}...{position.validatorVote.slice(-8)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">APY</p>
              <p className="text-xl font-bold text-green-600">{position.apy}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Staked Amount</p>
              <p className="text-lg font-bold dark:text-white">{position.amount} SOL</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Earned Rewards</p>
              <p className="text-lg font-bold text-green-600">
                {position.rewards.toFixed(4)} SOL
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Activated</p>
              <p className="text-sm font-semibold dark:text-white">
                {new Date(position.activatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
              Add More
            </button>
            <button className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors">
              Withdraw
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StakePositions;
