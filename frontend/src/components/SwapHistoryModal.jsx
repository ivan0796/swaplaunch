import React, { useState, useEffect } from 'react';
import { getSwapHistory, formatHistoryDate, clearSwapHistory } from '../utils/localHistory';
import { getExplorerUrl, getExplorerName } from '../utils/explorer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { History, ExternalLink, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

const SwapHistoryModal = () => {
  const [history, setHistory] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open]);

  const loadHistory = () => {
    const swaps = getSwapHistory();
    setHistory(swaps);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all swap history?')) {
      clearSwapHistory();
      setHistory([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="history-button" variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Swap History</span>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No swap history yet</p>
            <p className="text-sm mt-2">Your swaps will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {history.map((swap) => {
                const explorerUrl = getExplorerUrl(swap.chainId || swap.chain, swap.txHash);
                const explorerName = getExplorerName(swap.chainId || swap.chain);
                
                return (
                  <div
                    key={swap.id}
                    data-testid="history-item"
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium">
                          {swap.tokenInSymbol || 'Token'} → {swap.tokenOutSymbol || 'Token'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {parseFloat(swap.amountIn).toFixed(6)} → {parseFloat(swap.amountOut).toFixed(6)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {formatHistoryDate(swap.timestamp)}
                        </div>
                        <div className="text-xs font-medium text-blue-600 mt-1 capitalize">
                          {swap.chain}
                        </div>
                      </div>
                    </div>
                    
                    {swap.txHash && explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 mt-2"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View on {explorerName}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <div className="text-xs text-gray-500 text-center mt-4">
          History stored locally in your browser
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwapHistoryModal;