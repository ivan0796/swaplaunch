import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, RefreshCw, ExternalLink } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const NewListings = ({ selectedChain, onTokenSelect }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNewListings();
  }, [selectedChain]);

  const fetchNewListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const chainMap = {
        1: 'ethereum',
        56: 'bsc',
        137: 'polygon',
        0: 'solana'
      };
      
      const chainParam = chainMap[selectedChain];
      const response = await axios.get(`${BACKEND_URL}/api/dex/new-listings`, {
        params: chainParam ? { chain: chainParam } : {}
      });
      
      setListings(response.data.pairs || []);
    } catch (err) {
      console.error('Error fetching new listings:', err);
      setError('DEX data unavailable');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatLiquidity = (liquidity) => {
    if (!liquidity) return 'N/A';
    if (liquidity >= 1000000) return `$${(liquidity / 1000000).toFixed(1)}M`;
    if (liquidity >= 1000) return `$${(liquidity / 1000).toFixed(1)}K`;
    return `$${liquidity.toFixed(0)}`;
  };

  const getChainBadgeColor = (chainId) => {
    switch (chainId) {
      case 'ethereum':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'bsc':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'polygon':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'solana':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getDexBadgeColor = (dexId) => {
    const colors = {
      uniswap: 'bg-pink-100 text-pink-700',
      pancakeswap: 'bg-amber-100 text-amber-700',
      raydium: 'bg-cyan-100 text-cyan-700',
      quickswap: 'bg-blue-100 text-blue-700',
    };
    return colors[dexId?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold tracking-tight">New on DEX</h3>
        </div>
        <button
          onClick={fetchNewListings}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
        {loading && !listings.length ? (
          <div className="py-8 text-center">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Loading new listings...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">{error}</p>
            <p className="text-xs text-gray-400 mt-1">Try again later</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-8 text-center">
            <Sparkles className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No new listings found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {listings.slice(0, 10).map((listing, index) => {
              const token = listing.baseToken || {};
              const isNew = listing.pairCreatedAt && 
                (Date.now() / 1000 - listing.pairCreatedAt < 86400); // < 24h
              
              return (
                <div
                  key={`${listing.chainId}-${listing.pairAddress}-${index}`}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Token Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => onTokenSelect && onTokenSelect({
                            address: token.address,
                            symbol: token.symbol,
                            name: token.name,
                            chain: listing.chainId
                          })}
                          className="font-semibold text-sm hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {token.symbol || 'Unknown'}
                        </button>
                        {isNew && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate mb-2">
                        {token.name || 'Unknown Token'}
                      </div>

                      {/* Chain & DEX */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getChainBadgeColor(listing.chainId)}`}>
                          {listing.chainId}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getDexBadgeColor(listing.dexId)}`}>
                          {listing.dexId}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right text-xs space-y-1">
                      {listing.priceUsd && (
                        <div className="font-medium">
                          ${parseFloat(listing.priceUsd).toFixed(6)}
                        </div>
                      )}
                      <div className="text-gray-500">
                        Liq: {formatLiquidity(listing.liquidity)}
                      </div>
                      {listing.volume24h && (
                        <div className="text-gray-500">
                          Vol: {formatLiquidity(listing.volume24h)}
                        </div>
                      )}
                      {listing.pairAddress && (
                        <a
                          href={`https://dexscreener.com/${listing.chainId}/${listing.pairAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 justify-end"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500">Powered by Dexscreener</p>
        </div>
      </div>
    </div>
  );
};

export default NewListings;
