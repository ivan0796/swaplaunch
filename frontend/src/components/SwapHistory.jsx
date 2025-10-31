import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SwapHistory = ({ walletAddress }) => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSwapHistory();
  }, [walletAddress]);

  const fetchSwapHistory = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API}/swaps`, {
        params: { wallet_address: walletAddress }
      });
      setSwaps(response.data);
    } catch (error) {
      console.error('Failed to fetch swap history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId) => {
    const chains = { 1: 'ETH', 56: 'BSC', 137: 'Polygon' };
    return chains[chainId] || `Chain ${chainId}`;
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
          Recent Swaps
        </h3>
        <div className="text-center py-8 text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div data-testid="swap-history" className="glass-card rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk' }}>
          Recent Swaps
        </h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      {swaps.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No swap history yet
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {swaps.map((swap) => (
              <div
                key={swap.id}
                data-testid="swap-history-item"
                className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs text-gray-500">
                    {formatDate(swap.timestamp)}
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {getChainName(swap.chain_id)}
                  </span>
                </div>
                <div className="text-sm font-medium mb-1">
                  {parseFloat(swap.amount_in).toFixed(4)} → {parseFloat(swap.amount_out).toFixed(4)}
                </div>
                {swap.tx_hash && (
                  <div className="text-xs text-gray-500 font-mono">
                    TX: {truncateAddress(swap.tx_hash)}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  Fee: {parseFloat(swap.fee_amount).toFixed(6)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default SwapHistory;