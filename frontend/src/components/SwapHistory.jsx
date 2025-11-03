import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

const SwapHistory = ({ walletAddress }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletAddress) {
      loadHistory();
    }
  }, [walletAddress]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Mock data - In production: fetch from backend API
      const mockHistory = [
        {
          id: '1',
          fromToken: { symbol: 'ETH', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
          toToken: { symbol: 'USDC', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
          fromAmount: '1.5',
          toAmount: '4850.25',
          status: 'completed',
          timestamp: Date.now() - 3600000,
          txHash: '0x1234...5678',
          chain: 'Ethereum',
          fee: '0.15%'
        },
        {
          id: '2',
          fromToken: { symbol: 'BNB', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
          toToken: { symbol: 'USDT', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
          fromAmount: '10',
          toAmount: '2150.50',
          status: 'completed',
          timestamp: Date.now() - 7200000,
          txHash: '0xabcd...efgh',
          chain: 'BSC',
          fee: '0.20%'
        }
      ];
      setHistory(mockHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExplorerUrl = (chain, txHash) => {
    const explorers = {
      'Ethereum': `https://etherscan.io/tx/${txHash}`,
      'BSC': `https://bscscan.com/tx/${txHash}`,
      'Polygon': `https://polygonscan.com/tx/${txHash}`,
      'Solana': `https://solscan.io/tx/${txHash}`
    };
    return explorers[chain] || '#';
  };

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Loading history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">No swap history yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Your completed swaps will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((swap) => (
        <div key={swap.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src={swap.fromToken.logo} alt={swap.fromToken.symbol} className="w-6 h-6 rounded-full" />
              <span className="font-medium dark:text-white">{swap.fromAmount} {swap.fromToken.symbol}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <img src={swap.toToken.logo} alt={swap.toToken.symbol} className="w-6 h-6 rounded-full" />
              <span className="font-medium dark:text-white">{swap.toAmount} {swap.toToken.symbol}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {swap.status === 'completed' ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <XCircle className="w-4 h-4" />
                  Failed
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>{swap.chain}</span>
              <span>•</span>
              <span>Fee: {swap.fee}</span>
              <span>•</span>
              <span>{formatTime(swap.timestamp)}</span>
            </div>
            
            <a
              href={getExplorerUrl(swap.chain, swap.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              View
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SwapHistory;
