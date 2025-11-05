import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, TrendingUp, ExternalLink, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { TokenLogo } from '../utils/tokenLogoResolver';
import { toast } from 'sonner';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const TokenDetailPage = () => {
  const { chain, contract } = useParams();
  const navigate = useNavigate();
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Get chain ID
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

  // Get explorer URL
  const getExplorerUrl = (chain, address) => {
    const explorers = {
      'ethereum': `https://etherscan.io/token/${address}`,
      'eth': `https://etherscan.io/token/${address}`,
      'bsc': `https://bscscan.com/token/${address}`,
      'binance': `https://bscscan.com/token/${address}`,
      'polygon': `https://polygonscan.com/token/${address}`,
      'matic': `https://polygonscan.com/token/${address}`,
      'solana': `https://solscan.io/token/${address}`
    };
    return explorers[chain.toLowerCase()] || '#';
  };

  // Fetch token info
  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const response = await axios.get(`${API}/api/token/resolve`, {
          params: {
            query: contract,
            limit: 1
          }
        });

        if (response.data.results && response.data.results.length > 0) {
          const token = response.data.results[0];
          setTokenInfo({
            name: token.name || 'Unknown Token',
            symbol: token.symbol || 'N/A',
            logoURI: token.logoURI || null,
            address: contract
          });
        } else {
          setTokenInfo({
            name: contract.slice(0, 8).toUpperCase(),
            symbol: 'TOKEN',
            logoURI: null,
            address: contract
          });
        }
      } catch (error) {
        console.error('Error fetching token info:', error);
        setTokenInfo({
          name: contract.slice(0, 8).toUpperCase(),
          symbol: 'TOKEN',
          logoURI: null,
          address: contract
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
  }, [contract]);

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contract);
    toast.success('Contract address copied!');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Token page link copied!');
    
    // Twitter share
    const twitterUrl = `https://twitter.com/intent/tweet?text=Check out ${tokenInfo?.name} on SwapLaunch!&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleTrade = () => {
    const chainId = getChainId(chain);
    
    // Native tokens
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
    const fromToken = nativeTokens[chain.toLowerCase()] || 'ETH';
    
    navigate(`/trade/swap?chain=${chainId}&buyToken=${contract}&sellToken=${fromToken}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <HeaderSlim />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <HeaderSlim />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Token Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              {/* Token Logo */}
              <div className="flex justify-center mb-4">
                <TokenLogo
                  address={contract}
                  chainId={getChainId(chain)}
                  symbol={tokenInfo?.symbol}
                  name={tokenInfo?.name}
                  logoURI={tokenInfo?.logoURI}
                  size="xl"
                  className="ring-4 ring-blue-200 dark:ring-blue-800 w-20 h-20"
                />
              </div>

              {/* Token Name */}
              <h1 className="text-2xl font-bold dark:text-white text-center mb-2">
                {tokenInfo?.name}
              </h1>

              {/* Token Symbol */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                {tokenInfo?.symbol}
              </p>

              {/* Contract Address */}
              <div className="mb-4">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  CONTRACT ADDRESS
                </label>
                <button
                  onClick={handleCopyContract}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
                  title="Copy contract address"
                >
                  <span className="text-sm font-mono dark:text-white truncate">
                    {contract}
                  </span>
                  <Copy className="w-4 h-4 text-gray-500 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                </button>
              </div>

              {/* Chain */}
              <div className="mb-6">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  BLOCKCHAIN
                </label>
                <div className="px-3 py-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-400">
                    {getChainDisplay(chain)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleTrade}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trade Non-Custodial
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Token
                </Button>

                <Button
                  onClick={() => window.open(getExplorerUrl(chain, contract), '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              </div>
            </div>
          </div>

          {/* Chart & Details */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold dark:text-white mb-4">Token Chart</h2>
              
              {/* DexScreener Embed */}
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <iframe
                  src={`https://dexscreener.com/${chain}/${contract}?embed=1&theme=dark`}
                  className="w-full h-full"
                  title="DexScreener Chart"
                />
              </div>

              {/* Additional Info */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trading Platform</div>
                  <div className="font-semibold dark:text-white">Non-Custodial DEX</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chain</div>
                  <div className="font-semibold dark:text-white">{getChainDisplay(chain)}</div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>🔒 Non-Custodial Trading:</strong> All trades are executed directly on-chain. 
                  You maintain full control of your assets at all times. We never hold your funds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TokenDetailPage;
