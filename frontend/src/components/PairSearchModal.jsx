import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Loader2, TrendingUp, ExternalLink, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PairSearchModal = ({ isOpen, onClose, onSelectPair, chainId }) => {
  const [query, setQuery] = useState('');
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setPairs([]);
      return;
    }

    const timer = setTimeout(() => {
      searchPairs();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const searchPairs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/dex/pairs`, {
        params: { query }
      });

      let pairResults = response.data.pairs || [];
      
      // Filter by current chain if specified
      if (chainId !== undefined) {
        const chainMap = { 1: 'ethereum', 56: 'bsc', 137: 'polygon', 0: 'solana' };
        const currentChain = chainMap[chainId];
        
        // Prioritize current chain
        pairResults.sort((a, b) => {
          const aIsCurrentChain = a.chainId === currentChain;
          const bIsCurrentChain = b.chainId === currentChain;
          
          if (aIsCurrentChain && !bIsCurrentChain) return -1;
          if (!aIsCurrentChain && bIsCurrentChain) return 1;
          
          // Sort by liquidity
          const aLiq = a.liquidity || 0;
          const bLiq = b.liquidity || 0;
          return bLiq - aLiq;
        });
      }

      setPairs(pairResults);
    } catch (err) {
      console.error('Error searching pairs:', err);
      setError('Failed to search pairs');
      setPairs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPair = (pair) => {
    onSelectPair(pair);
    setQuery('');
    setPairs([]);
    onClose();
  };

  const getChainBadge = (chain) => {
    const colors = {
      ethereum: 'bg-blue-100 text-blue-700',
      bsc: 'bg-yellow-100 text-yellow-700',
      polygon: 'bg-purple-100 text-purple-700',
      solana: 'bg-indigo-100 text-indigo-700',
    };
    const names = {
      ethereum: 'ETH',
      bsc: 'BSC',
      polygon: 'MATIC',
      solana: 'SOL',
    };
    return { color: colors[chain?.toLowerCase()] || 'bg-gray-100 text-gray-700', name: names[chain?.toLowerCase()] || chain };
  };

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Select Trading Pair
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search token pairs (e.g., ETH, PEPE, contract address)"
            className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto space-y-2 mt-4">
          {error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          ) : pairs.length === 0 && query.length >= 2 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>No trading pairs found</p>
              <p className="text-xs mt-1">Try searching by token name or contract address</p>
            </div>
          ) : pairs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Search for trading pairs</p>
              <p className="text-xs mt-1">Enter a token name, symbol, or contract address</p>
            </div>
          ) : (
            pairs.map((pair, index) => {
              const chainInfo = getChainBadge(pair.chainId);
              const priceChange = parseFloat(pair.priceChange24h || 0);
              const priceChangeColor = priceChange >= 0 ? 'text-green-600' : 'text-red-600';
              
              return (
                <button
                  key={`${pair.pairAddress}-${index}`}
                  onClick={() => handleSelectPair(pair)}
                  className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Pair Info */}
                      <div className="flex items-center gap-2 mb-2">
                        {pair.logoUrl && (
                          <img
                            src={pair.logoUrl}
                            alt={pair.baseToken.symbol}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div>
                          <div className="font-semibold text-base">
                            {pair.baseToken.symbol}/{pair.quoteToken.symbol}
                          </div>
                          <div className="text-xs text-gray-500">
                            {pair.baseToken.name}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${chainInfo.color}`}>
                          {chainInfo.name}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <div className="text-gray-500">Price</div>
                          <div className="font-medium">
                            ${parseFloat(pair.priceUsd || 0).toFixed(6)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Liquidity</div>
                          <div className="font-medium">{formatNumber(pair.liquidity)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">24h Change</div>
                          <div className={`font-medium ${priceChangeColor}`}>
                            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      {/* DEX Info */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                          {pair.dexId}
                        </span>
                        {pair.url && (
                          <a
                            href={pair.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                          >
                            View on DEX
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>💡 Pairs sorted by liquidity</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PairSearchModal;
