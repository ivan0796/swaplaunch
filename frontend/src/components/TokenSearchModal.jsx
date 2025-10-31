import React, { useState, useEffect } from 'react';
import { searchTokens, isValidAddress } from '../services/tokenList';
import { Search, X, TrendingUp } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { getPopularTokens } from '../utils/popularTokens';

const TokenSearchModal = ({ isOpen, onClose, onSelectToken, chainId, excludeToken }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopular, setShowPopular] = useState(true);

  const popularTokens = getPopularTokens(chainId);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setShowPopular(true);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      setShowPopular(true);
      return;
    }

    setShowPopular(false);
    const timer = setTimeout(async () => {
      setLoading(true);
      const results = await searchTokens(searchQuery, chainId);
      // Filter out excluded token
      const filtered = results.filter(t => 
        t.address.toLowerCase() !== excludeToken?.toLowerCase()
      );
      setSearchResults(filtered);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, chainId, excludeToken]);

  const handleSelectToken = (token) => {
    onSelectToken(token);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select Token</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, symbol, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          {isValidAddress(searchQuery) && (
            <div className="mt-2 text-xs text-blue-600">
              ℹ️ Contract address detected
            </div>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 p-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : showPopular ? (
            <div>
              <div className="px-3 py-2 flex items-center gap-2 text-sm font-semibold text-gray-600">
                <TrendingUp className="w-4 h-4" />
                Popular Tokens
              </div>
              <div className="space-y-1">
                {popularTokens.map((token) => {
                  const address = token.address || token.mint;
                  const logoUrl = `https://assets.coingecko.com/coins/images/${token.coingeckoId === 'ethereum' ? '279' : token.coingeckoId === 'binancecoin' ? '825' : token.coingeckoId === 'matic-network' ? '4713' : token.coingeckoId === 'solana' ? '4128' : token.coingeckoId === 'tether' ? '325' : token.coingeckoId === 'usd-coin' ? '6319' : token.coingeckoId === 'wrapped-bitcoin' ? '7598' : token.coingeckoId === 'ripple' ? '44' : token.coingeckoId === 'chainlink' ? '877' : token.coingeckoId === 'dai' ? '9956' : '1'}/small/${token.coingeckoId}.png`;
                  
                  return (
                    <button
                      key={`${chainId}-${address}`}
                      onClick={() => handleSelectToken({
                        ...token,
                        address: address,
                        chainId: chainId,
                        logoURI: logoUrl
                      })}
                      className="w-full p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 text-left"
                    >
                      <img
                        src={logoUrl}
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-sm text-gray-500">{token.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tokens found
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((token) => (
                <button
                  key={`${token.chainId}-${token.address}`}
                  onClick={() => handleSelectToken(token)}
                  className="w-full p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 text-left"
                >
                  {token.logoURI && (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{token.symbol}</span>
                      <span className="text-xs text-gray-500 truncate">
                        {token.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 font-mono truncate">
                      {token.address.slice(0, 6)}...{token.address.slice(-4)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default TokenSearchModal;