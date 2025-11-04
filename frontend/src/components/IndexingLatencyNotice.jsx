import React from 'react';
import { Clock, Info } from 'lucide-react';

const IndexingLatencyNotice = () => {
  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4">
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-200">
          <p className="font-semibold mb-1">⏱️ Indexing Latency Notice</p>
          <p className="text-xs">
            After your first trade, <strong>Dexscreener</strong> and <strong>Axiom Pulse</strong> may 
            take <strong>5-10 minutes</strong> to index your token. This is normal. Refresh the pages 
            after a few minutes if data isn't immediately visible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IndexingLatencyNotice;
