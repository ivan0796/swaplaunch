import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Search, Loader2, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TokenSearchAutocomplete = ({ onSelect, placeholder = "Search token name, symbol or address", excludeAddress, chainId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function
  const searchTokens = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = { query };
      if (chainId !== undefined) {
        params.chainId = chainId;
      }
      
      const response = await axios.get(`${BACKEND_URL}/api/token/resolve`, {
        params
      });

      let tokenResults = response.data.results || [];
      
      // Filter out excluded address
      if (excludeAddress) {
        tokenResults = tokenResults.filter(
          t => t.address?.toLowerCase() !== excludeAddress?.toLowerCase()
        );
      }

      // Backend now handles prioritization, but we can still sort by liquidity as secondary
      tokenResults.sort((a, b) => {
        const aLiq = a.liquidity || 0;
        const bLiq = b.liquidity || 0;
        return bLiq - aLiq;
      });

      setResults(tokenResults);
      setShowResults(true);
    } catch (err) {
      console.error('Error searching tokens:', err);
      setError('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search - faster for better UX
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => {
      searchTokens();
    }, 250); // Reduced from 400ms to 250ms for faster response

    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [query, chainId, excludeAddress]);

  const handleSelect = (token) => {
    onSelect(token);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const getChainBadge = (chain) => {
    const colors = {
      ethereum: 'bg-blue-100 text-blue-700',
      bsc: 'bg-yellow-100 text-yellow-700',
      polygon: 'bg-purple-100 text-purple-700',
      solana: 'bg-indigo-100 text-indigo-700',
      arbitrum: 'bg-blue-100 text-blue-800',
      optimism: 'bg-red-100 text-red-700',
      base: 'bg-blue-100 text-blue-600',
      avalanchec: 'bg-red-100 text-red-800',
      fantom: 'bg-cyan-100 text-cyan-700',
      cronos: 'bg-purple-100 text-purple-800',
      zksync: 'bg-purple-100 text-purple-700',
      xrpl: 'bg-cyan-100 text-cyan-800',
      tron: 'bg-orange-100 text-orange-700'
    };
    return colors[chain?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const isContractAddress = (str) => {
    return str.startsWith('0x') || str.length >= 32;
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}
        {isContractAddress(query) && query.length > 10 && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-blue-600 font-medium">📋 Address</span>
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 max-h-80 overflow-y-auto">
          {error ? (
            <div className="p-4 text-center">
              <AlertCircle className="w-6 h-6 mx-auto text-red-500 mb-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No tokens found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try searching by name, symbol or contract address
              </p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((token, index) => (
                <button
                  key={`${token.chain}-${token.address}-${index}`}
                  onClick={() => handleSelect(token)}
                  className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Logo */}
                    {token.logoURL ? (
                      <img
                        src={token.logoURL}
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {token.symbol?.charAt(0) || '?'}
                      </div>
                    )}

                    {/* Token Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm">{token.symbol}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getChainBadge(token.chain)}`}>
                          {token.chain}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">{token.name}</div>
                      <div className="text-xs text-gray-400 font-mono truncate">
                        {token.address?.slice(0, 6)}...{token.address?.slice(-4)}
                      </div>
                    </div>

                    {/* Price & Stats */}
                    <div className="text-right text-xs">
                      {token.priceUsd && (
                        <div className="font-medium">${parseFloat(token.priceUsd).toFixed(6)}</div>
                      )}
                      {token.liquidity && (
                        <div className="text-gray-500">
                          Liq: ${token.liquidity >= 1000000 
                            ? `${(token.liquidity / 1000000).toFixed(1)}M` 
                            : `${(token.liquidity / 1000).toFixed(0)}K`}
                        </div>
                      )}
                      <div className="text-gray-400">{token.source}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenSearchAutocomplete;
