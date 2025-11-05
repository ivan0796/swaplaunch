import React from 'react';
import { CheckCircle, Shield } from 'lucide-react';

const BestRouteBadge = ({ provider = '0x', nonCustodial = true }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
      <div className="flex-1">
        <p className="text-xs font-semibold text-green-900 dark:text-green-100">
          Best Route via {provider}
        </p>
        {nonCustodial && (
          <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Non-custodial · You control your funds
          </p>
        )}
      </div>
    </div>
  );
};

export default BestRouteBadge;
