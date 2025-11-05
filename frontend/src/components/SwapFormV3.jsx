import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Settings, ArrowDown, Info } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';
import { useSettings } from '../contexts/SettingsContext';
import SwapSettingsModal from './SwapSettingsModal';
import TokenSearchModal from './TokenSearchModal';
import ReferralCodeInput from './ReferralCodeInput';

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const SwapFormV3 = ({ chainId = 1 }) => {
  const { t } = useTranslation();
  const { address: walletAddress } = useAccount();
  const { formatPrice, getCurrencySymbol } = useCurrency();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();

  // Tabs State
  const [activeTab, setActiveTab] = useState('swap'); // swap, twap, limit

  // Tokens
  const [sellToken, setSellToken] = useState(null);
  const [buyToken, setBuyToken] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('0');

  // UI State
  const [loading, setLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSellTokenModal, setShowSellTokenModal] = useState(false);
  const [showBuyTokenModal, setShowBuyTokenModal] = useState(false);

  // TWAP specific
  const [twapInterval, setTwapInterval] = useState(5); // minutes
  const [twapSplits, setTwapSplits] = useState(10);

  // Limit specific
  const [limitPrice, setLimitPrice] = useState('');
  const [limitExpiry, setLimitExpiry] = useState('7'); // days

  // Quote data
  const [quote, setQuote] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  
  // Token prices in USD - Initialize with fallback immediately
  const [tokenPrices, setTokenPrices] = useState({
    ETH: 3100,
    WETH: 3100,
    BNB: 620,
    SOL: 170,
    MATIC: 0.60,
    USDT: 1,
    USDC: 1,
    DAI: 1,
    BTC: 95000,
    WBTC: 95000
  });

  // Fetch token prices from CoinGecko via backend - FAST & IMMEDIATE
  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        const response = await axios.get(`${API}/api/crypto/prices`, { timeout: 5000 });
        if (response.data) {
          // Add alias mappings for common tokens
          const prices = {
            ...response.data,
            'WETH': response.data.ETH || response.data.ethereum || 3100,
            'WBTC': response.data.BTC || response.data.bitcoin || 95000,
          };
          setTokenPrices(prev => ({ ...prev, ...prices }));
          console.log('✅ Live token prices updated:', prices);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch live prices, using fallback');
      }
    };
    
    // Fetch immediately on mount
    fetchTokenPrices();
    
    // Then refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchTokenPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load tokens from URL params (for promoted tokens)
  useEffect(() => {
    const buyTokenParam = searchParams.get('buyToken');
    const sellTokenParam = searchParams.get('sellToken');

    if (buyTokenParam || sellTokenParam) {
      // Fetch token info and set
      const loadTokensFromParams = async () => {
        try {
          // Load buy token (You Receive)
          if (buyTokenParam) {
            const buyResponse = await axios.get(`${API}/api/token/resolve`, {
              params: { query: buyTokenParam, limit: 1 }
            });
            if (buyResponse.data.results && buyResponse.data.results.length > 0) {
              const token = buyResponse.data.results[0];
              setBuyToken({
                address: buyTokenParam,
                symbol: token.symbol || 'TOKEN',
                name: token.name || 'Unknown',
                logoURI: token.logoURI || null,
                decimals: token.decimals || 18
              });
            }
          }

          // Load sell token (You Pay) - native token
          if (sellTokenParam) {
            const nativeTokens = {
              'ETH': {
                address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: 18,
                logoURI: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png'
              },
              'BNB': {
                address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                symbol: 'BNB',
                name: 'BNB',
                decimals: 18,
                logoURI: null
              },
              'MATIC': {
                address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                symbol: 'MATIC',
                name: 'Polygon',
                decimals: 18,
                logoURI: null
              },
              'SOL': {
                address: 'So11111111111111111111111111111111111111112',
                symbol: 'SOL',
                name: 'Solana',
                decimals: 9,
                logoURI: null
              },
              'XRP': {
                address: 'XRP',
                symbol: 'XRP',
                name: 'XRP',
                decimals: 6,
                logoURI: null
              }
            };

            const nativeToken = nativeTokens[sellTokenParam.toUpperCase()];
            if (nativeToken) {
              setSellToken(nativeToken);
            }
          }
        } catch (error) {
          console.error('Error loading tokens from params:', error);
        }
      };

      loadTokensFromParams();
    }
  }, [searchParams]);

  // Default tokens
  useEffect(() => {
    // Only set defaults if no URL params
    if (!searchParams.get('buyToken') && !searchParams.get('sellToken')) {
      // Set default tokens based on chain
      if (chainId === 1) { // Ethereum
        setSellToken({
          address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          logoURI: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png'
        });
        setBuyToken({
          address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6,
          logoURI: 'https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png'
        });
      } else if (chainId === 56) { // BSC
        setSellToken({
          address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          symbol: 'BNB',
          name: 'BNB',
          decimals: 18,
          logoURI: 'https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png'
        });
        setBuyToken({
          address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
          symbol: 'CAKE',
          name: 'PancakeSwap Token',
          decimals: 18,
          logoURI: 'https://tokens.1inch.io/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82.png'
        });
      }
    }
  }, [chainId, searchParams]);

  // Fetch quote when amount changes
  useEffect(() => {
    if (sellAmount && parseFloat(sellAmount) > 0 && sellToken && buyToken) {
      const timer = setTimeout(() => {
        fetchQuote();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setBuyAmount('0');
      setQuote(null);
    }
  }, [sellAmount, sellToken, buyToken]);

  const fetchQuote = async () => {
    if (!sellToken || !buyToken || !sellAmount || parseFloat(sellAmount) <= 0) {
      return;
    }

    setLoading(true);

    try {
      const sellAmountInBaseUnits = ethers.parseUnits(sellAmount, sellToken.decimals).toString();
      const chainNames = { 1: 'ethereum', 56: 'bsc', 137: 'polygon' };
      const chainName = chainNames[chainId] || 'ethereum';
      const takerAddr = walletAddress || '0x0000000000000000000000000000000000000000';

      const response = await axios.post(`${API}/api/evm/quote`, {
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount: sellAmountInBaseUnits,
        takerAddress: takerAddr,
        chain: chainName
      });

      const quoteData = response.data;
      const buyAmountFormatted = ethers.formatUnits(quoteData.buyAmount, buyToken.decimals);
      
      setBuyAmount(buyAmountFormatted);
      setQuote(quoteData);

      // Calculate exchange rate
      const rate = parseFloat(buyAmountFormatted) / parseFloat(sellAmount);
      setExchangeRate(rate);

    } catch (error) {
      console.error('Quote error:', error);
      toast.error('Failed to fetch quote');
      setBuyAmount('0');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    if (activeTab === 'swap') {
      toast.info('Swap functionality coming soon');
    } else if (activeTab === 'twap') {
      toast.info('TWAP order will be executed');
    } else if (activeTab === 'limit') {
      toast.info('Limit order will be placed');
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'twap') {
      return (
        <>
          {/* TWAP Additional Settings - Kompakter */}
          <div className="mb-2 space-y-2">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-2.5">
              <label className="text-xs font-medium mb-1.5 block dark:text-gray-300">
                Time Interval
              </label>
              <div className="flex gap-1.5">
                {[5, 10, 30, 60].map(min => (
                  <button
                    key={min}
                    onClick={() => setTwapInterval(min)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      twapInterval === min
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-2.5">
              <label className="text-xs font-medium mb-1.5 block dark:text-gray-300">
                Number of Splits
              </label>
              <input
                type="number"
                value={twapSplits}
                onChange={(e) => setTwapSplits(parseInt(e.target.value) || 10)}
                min="2"
                max="100"
                className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg outline-none text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Order will be split into {twapSplits} parts over {(twapInterval * twapSplits) / 60} hours
              </p>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'limit') {
      return (
        <>
          {/* Limit Order Settings - Kompakter */}
          <div className="mb-2 space-y-2">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-2.5">
              <label className="text-xs font-medium mb-1.5 block dark:text-gray-300">
                Limit Price
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg outline-none text-base"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {buyToken?.symbol}/{sellToken?.symbol}
                </span>
              </div>
              {exchangeRate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Market: {(1 / exchangeRate).toFixed(6)} {buyToken?.symbol}/{sellToken?.symbol}
                </p>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-2.5">
              <label className="text-xs font-medium mb-1.5 block dark:text-gray-300">
                Expiry
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { value: '1', label: '1 day' },
                  { value: '7', label: '7 days' },
                  { value: '30', label: '30 days' },
                  { value: 'never', label: 'Never' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setLimitExpiry(opt.value)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      limitExpiry === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Tabs - Kompakter */}
      <div className="flex gap-1 mb-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {[
          { id: 'swap', label: 'Swap' },
          { id: 'twap', label: 'TWAP' },
          { id: 'limit', label: 'Limit' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Swap Form - Kompakter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Settings Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Referral Code Input */}
        <ReferralCodeInput />

        {/* From Token - Kompakter */}
        <div className="mb-2">
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">From:</label>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <input
                type="number"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-2xl font-semibold outline-none w-full dark:text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowSellTokenModal(true)}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                {sellToken?.logoURI ? (
                  <img 
                    src={sellToken.logoURI} 
                    alt={sellToken.symbol} 
                    className="w-5 h-5 rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : sellToken?.symbol && (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {sellToken.symbol.charAt(0)}
                  </div>
                )}
                <span className="font-semibold dark:text-white">{sellToken?.symbol || 'Select'}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {(() => {
                    if (!sellAmount || sellAmount === '0' || !sellToken) return <span className="text-gray-400">{getCurrencySymbol()}--</span>;
                    const price = tokenPrices[sellToken.symbol];
                    if (!price || isNaN(price)) return <span className="text-gray-400">{getCurrencySymbol()}--</span>;
                    const value = parseFloat(sellAmount) * price;
                    if (isNaN(value)) return <span className="text-gray-400">{getCurrencySymbol()}--</span>;
                    return <span>≈ {formatPrice(value)}</span>;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Swap Arrow - Kompakter */}
        <div className="flex justify-center my-1">
          <button
            onClick={() => {
              const temp = sellToken;
              setSellToken(buyToken);
              setBuyToken(temp);
              setSellAmount(buyAmount);
              setBuyAmount('0');
            }}
            className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* To Token - Kompakter */}
        <div className="mb-2">
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">To:</label>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-2xl font-semibold dark:text-white">
                {loading ? '...' : buyAmount}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowBuyTokenModal(true)}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                {buyToken?.logoURI ? (
                  <img 
                    src={buyToken.logoURI} 
                    alt={buyToken.symbol} 
                    className="w-5 h-5 rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : buyToken?.symbol && (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {buyToken.symbol.charAt(0)}
                  </div>
                )}
                <span className="font-semibold dark:text-white">{buyToken?.symbol || 'Select'}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {(() => {
                    if (!buyAmount || buyAmount === '0' || !buyToken) return <span className="text-gray-400">{getCurrencySymbol()}--</span>;
                    const price = tokenPrices[buyToken.symbol];
                    if (!price || isNaN(price)) return <span className="text-gray-400">{getCurrencySymbol()}--</span>;
                    const value = parseFloat(buyAmount) * price;
                    if (isNaN(value)) return <span className="text-gray-400">{getCurrencySymbol()}--</span>;
                    return <span>≈ {formatPrice(value)}</span>;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab-specific content (TWAP/Limit settings) */}
        {renderTabContent()}

        {/* Slippage Info - Kompakter */}
        {activeTab === 'swap' && (
          <div className="flex items-center justify-between text-xs mb-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Slippage Tolerance</span>
            <span className="font-medium dark:text-white">{settings.slippage}%</span>
          </div>
        )}

        {/* Exchange Rate - Kompakter */}
        {exchangeRate && (
          <div className="flex items-center justify-between text-xs mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3 text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">Rate</span>
            </div>
            <span className="font-medium dark:text-white text-xs">
              1 {buyToken?.symbol} ≈ {(1 / exchangeRate).toFixed(6)} {sellToken?.symbol}
            </span>
          </div>
        )}

        {/* Fee - Kompakter */}
        {quote && (
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-gray-600 dark:text-gray-400">Fee</span>
            <span className="font-medium dark:text-white">
              ~{quote.feePercent || 0.2}% ({getCurrencySymbol()}{quote.feeUsd?.toFixed(2) || '0.00'})
            </span>
          </div>
        )}

        {/* Action Button - Kompakter */}
        <Button
          onClick={handleSwap}
          disabled={!walletAddress || loading || !sellAmount || parseFloat(sellAmount) <= 0}
          className="w-full py-3 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {!walletAddress ? 'Connect Wallet' : loading ? 'Loading...' : 
            activeTab === 'swap' ? 'Swap' : 
            activeTab === 'twap' ? 'Place TWAP Order' : 
            'Place Limit Order'}
        </Button>

        {/* Non-Custodial Notice - Kompakter */}
        <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          🔒 Non-custodial · Your keys, your crypto
        </div>
      </div>

      {/* Settings Modal */}
      <SwapSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Token Search Modals */}
      <TokenSearchModal
        isOpen={showSellTokenModal}
        onClose={() => setShowSellTokenModal(false)}
        onSelectToken={(token) => {
          setSellToken(token);
          setShowSellTokenModal(false);
        }}
        chainId={chainId}
        excludeToken={buyToken?.address}
      />

      <TokenSearchModal
        isOpen={showBuyTokenModal}
        onClose={() => setShowBuyTokenModal(false)}
        onSelectToken={(token) => {
          setBuyToken(token);
          setShowBuyTokenModal(false);
        }}
        chainId={chainId}
        excludeToken={sellToken?.address}
      />
    </div>
  );
};

export default SwapFormV3;
