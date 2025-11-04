import React from 'react';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';

const LaunchStatusBar = ({ flow, stage, mint, pair }) => {
  const steps = flow === "pump"
    ? [
        { key: "created", label: "Token Created" },
        { key: "bonding", label: "Bonding Curve" },
        { key: "migrated", label: "Migrated to Raydium" },
        { key: "lp_added", label: "Liquidity Added" },
        { key: "first_trade", label: "First Trade Done" }
      ]
    : [
        { key: "minted", label: "Token Minted" },
        { key: "pool_created", label: "Pool Created" },
        { key: "lp_added", label: "LP Added" },
        { key: "first_trade", label: "First Trade" }
      ];

  const currentIndex = steps.findIndex(s => s.key === stage);

  const getStepStatus = (index) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Launch Progress</h3>
      
      {/* Progress Steps */}
      <div className="flex flex-col gap-3">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          
          return (
            <div key={step.key} className="flex items-center gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                status === 'completed' 
                  ? 'bg-green-600 text-white' 
                  : status === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : status === 'active' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  status === 'completed' || status === 'active'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.label}
                </p>
              </div>

              {/* Status Badge */}
              {status === 'completed' && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  ✓ Done
                </span>
              )}
              {status === 'active' && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  In Progress
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Token Info */}
      {(mint || pair) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-2 text-xs text-gray-600 dark:text-gray-400">
            {mint && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Token:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {mint.slice(0, 4)}...{mint.slice(-4)}
                </code>
              </div>
            )}
            {pair && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Pair:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {pair.slice(0, 4)}...{pair.slice(-4)}
                </code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LaunchStatusBar;
