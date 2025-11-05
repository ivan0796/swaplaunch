import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePromotions } from '../hooks/usePromotions';
import { Star, TrendingUp, Eye, Share2, Copy, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { TokenLogo } from '../utils/tokenLogoResolver';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const FeaturedTokens = () => {
  const navigate = useNavigate();
  const { promotions, loading } = usePromotions('featured_token');
  const [tokenInfo, setTokenInfo] = useState({});

  // Chain name mapping
  const getChainDisplay = (chain) => {
    const chainMap = {
      'solana': 'Solana (SOL)',
      'ethereum': 'Ethereum (ETH)',
      'eth': 'Ethereum (ETH)',
      'polygon': 'Polygon (POL)',
      'matic': 'Polygon (POL)',
      'bsc': 'BNB Chain (BSC)',
      'binance': 'BNB Chain (BSC)'
    };
    return chainMap[chain.toLowerCase()] || chain;
  };

  // Get chain ID for routing
  const getChainId = (chain) => {
    const chainIdMap = {
      'ethereum': 1,
      'eth': 1,
      'bsc': 56,
      'binance': 56,
      'polygon': 137,
      'matic': 137,
      'solana': 'solana'
    };
    return chainIdMap[chain.toLowerCase()] || 1;
  };

  // Fetch token info from backend for each promotion
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!promotions || promotions.length === 0) return;

      const infoMap = {};
      for (const promo of promotions.slice(0, 3)) {
        try {
          const response = await axios.get(`${API}/api/token/resolve`, {
            params: {
              query: promo.token_address,
              limit: 1
            }
          });

          if (response.data.results && response.data.results.length > 0) {
            const token = response.data.results[0];
            infoMap[promo.token_address] = {
              name: token.name || token.symbol || 'Unknown Token',
              symbol: token.symbol || 'N/A',
              logoURI: token.logoURI || null
            };
          } else {
            infoMap[promo.token_address] = {
              name: promo.token_address.slice(0, 8).toUpperCase(),
              symbol: 'TOKEN',
              logoURI: null
            };
          }
        } catch (error) {
          console.error('Error fetching token info:', error);
          infoMap[promo.token_address] = {
            name: promo.token_address.slice(0, 8).toUpperCase(),
            symbol: 'TOKEN',
            logoURI: null
          };
        }
      }
      setTokenInfo(infoMap);
    };

    fetchTokenInfo();
  }, [promotions]);

  const handleCopyContract = (address) => {
    navigator.clipboard.writeText(address);
    toast.success('Contract address copied!');
  };

  const handleTrade = (promo, info) => {
    const chainId = getChainId(promo.chain);
    // Set native token as "from" based on chain
    const nativeTokens = {
      'ethereum': 'ETH',
      'eth': 'ETH',
      'solana': 'SOL',
      'bsc': 'BNB',
      'binance': 'BNB',
      'polygon': 'MATIC',
      'matic': 'MATIC',
      'xrp': 'XRP'
    };
    const fromToken = nativeTokens[promo.chain.toLowerCase()] || 'ETH';
    
    navigate(`/trade/swap?chain=${chainId}&buyToken=${promo.token_address}&sellToken=${fromToken}`);
  };

  const handleView = (promo) => {
    const chain = promo.chain.toLowerCase();
    navigate(`/token/${chain}/${promo.token_address}`);
  };

  const handleShare = (promo, info) => {
    const url = `${window.location.origin}/token/${promo.chain.toLowerCase()}/${promo.token_address}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(url);
    toast.success('Token link copied to clipboard!');
    
    // Optional: Twitter share
    const twitterUrl = `https://twitter.com/intent/tweet?text=Check out ${info.name} on SwapLaunch!&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  if (loading) {
    return null;
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
          <h2 className="text-2xl font-bold dark:text-white">Featured Tokens</h2>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Promoted
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.slice(0, 3).map((promo) => {
          const info = tokenInfo[promo.token_address] || {
            name: 'Loading...',
            symbol: '...',
            logoURI: null
          };

          return (
            <div
              key={promo.promotion_id}
              className="relative bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-5 border-2 border-yellow-400 dark:border-yellow-600 shadow-lg hover:shadow-xl transition-all group"
            >
              {/* Featured Badge */}
              <div className="absolute -top-3 -right-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  FEATURED
                </div>
              </div>

              {/* Token Logo - Centered */}
              <div className="flex justify-center mb-3">
                <TokenLogo
                  address={promo.token_address}
                  chainId={getChainId(promo.chain)}
                  symbol={info.symbol}
                  name={info.name}
                  logoURI={info.logoURI}
                  size="xl"
                  className="ring-2 ring-yellow-400"
                />
              </div>

              {/* Token Name - Bold & Clear */}
              <h3 className="text-xl font-bold dark:text-white text-center mb-2">
                {info.name}
              </h3>

              {/* Contract Address with Copy */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">CONTRACT:</span>
                <button
                  onClick={() => handleCopyContract(promo.token_address)}
                  className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group/copy"
                  title="Copy contract address"
                >
                  <span className="text-xs font-mono dark:text-white">
                    {promo.token_address.slice(0, 6)}...{promo.token_address.slice(-4)}
                  </span>
                  <Copy className="w-3 h-3 text-gray-500 group-hover/copy:text-blue-600" />
                </button>
              </div>

              {/* Chain */}
              <div className="text-center mb-4">
                <span className="inline-block bg-white dark:bg-gray-800 px-3 py-1 rounded-lg text-xs font-medium dark:text-white">
                  {getChainDisplay(promo.chain)}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-yellow-300 dark:border-yellow-700 mb-4"></div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs"
                  onClick={() => handleTrade(promo, info)}
                  title="Trade on our non-custodial DEX"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trade
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="border-yellow-400 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-xs"
                  onClick={() => handleView(promo)}
                  title="View token details"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="border-yellow-400 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-xs"
                  onClick={() => handleShare(promo, info)}
                  title="Share token"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-orange-400/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedTokens;
