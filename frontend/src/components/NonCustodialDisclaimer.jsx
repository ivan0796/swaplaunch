import React from 'react';
import { Shield, Lock } from 'lucide-react';

const NonCustodialDisclaimer = () => {
  return (
    <div className="rounded-xl border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-green-900 dark:text-green-200 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            100% Non-Custodial
          </h3>
          <div className="text-xs text-green-800 dark:text-green-300 space-y-1">
            <p>
              ✅ <strong>You control your wallet</strong> - We never ask for private keys
            </p>
            <p>
              ✅ <strong>You sign all transactions</strong> - Nothing happens without your approval
            </p>
            <p>
              ✅ <strong>We hold zero funds</strong> - Your tokens stay in your wallet
            </p>
            <p className="mt-2 pt-2 border-t border-green-300 dark:border-green-700">
              We only track token status and provide guidance. All on-chain actions are performed by you in your own wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonCustodialDisclaimer;
