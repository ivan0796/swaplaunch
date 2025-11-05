import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { ChevronDown, Settings, ArrowDown, Info } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const SwapFormV3 = ({ chainId = 1 }) => {
  const { t } = useTranslation();
  const { address: walletAddress } = useAccount();
  const { formatPrice, getCurrencySymbol } = useCurrency();

  // Tabs State
  const [activeTab, setActiveTab] = useState('swap'); // swap, twap, limit

  // Tokens
  const [sellToken, setSellToken] = useState(null);
  const [buyToken, setBuyToken] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('0');

  // UI State
  const [loading, setLoading] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);

  // TWAP specific
  const [twapInterval, setTwapInterval] = useState(5); // minutes
  const [twapSplits, setTwapSplits] = useState(10);

  // Limit specific
  const [limitPrice, setLimitPrice] = useState('');
  const [limitExpiry, setLimitExpiry] = useState('7'); // days

  // Quote data
  const [quote, setQuote] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  // Default tokens
  useEffect(() => {
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
  }, [chainId]);

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

    toast.info('Swap functionality coming soon');
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {[
          { id: 'swap', label: 'Swap' },
          { id: 'twap', label: 'TWAP' },
          { id: 'limit', label: 'Limit' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Swap Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Settings Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Slippage Tolerance
            </label>
            <div className="flex gap-2">
              {[0.1, 0.5, 1.0].map(val => (
                <button
                  key={val}
                  onClick={() => setSlippage(val)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    slippage === val
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {val}%
                </button>
              ))}
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
                step="0.1"
                min="0.1"
                max="50"
              />
            </div>
          </div>
        )}

        {/* From Token */}
        <div className="mb-3">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">From:</label>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <input
                type="number"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-3xl font-semibold outline-none w-full dark:text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                {sellToken?.logoURI && (
                  <img src={sellToken.logoURI} alt={sellToken.symbol} className="w-6 h-6 rounded-full" />
                )}
                <span className="font-semibold dark:text-white">{sellToken?.symbol || 'Select'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {sellAmount && sellAmount !== '0' ? (
                    <span>≈ {formatPrice(parseFloat(sellAmount) * 3000)}</span>
                  ) : (
                    <span>$0.00</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center my-2">
          <button
            onClick={() => {
              const temp = sellToken;
              setSellToken(buyToken);
              setBuyToken(temp);
              setSellAmount(buyAmount);
              setBuyAmount('0');
            }}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* To Token */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">To:</label>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-semibold dark:text-white">
                {loading ? '...' : buyAmount}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                {buyToken?.logoURI && (
                  <img src={buyToken.logoURI} alt={buyToken.symbol} className="w-6 h-6 rounded-full" />
                )}
                <span className="font-semibold dark:text-white">{buyToken?.symbol || 'Select'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {buyAmount && buyAmount !== '0' ? (
                    <span>≈ {formatPrice(parseFloat(buyAmount) * 1)}</span>
                  ) : (
                    <span>$0.00</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slippage Info */}
        {!showSettings && (
          <div className="flex items-center justify-between text-sm mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Slippage Tolerance</span>
            <span className="font-medium dark:text-white">Auto: {slippage}%</span>
          </div>
        )}

        {/* Exchange Rate */}
        {exchangeRate && (
          <div className="flex items-center justify-between text-sm mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-1">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">Rate</span>
            </div>
            <span className="font-medium dark:text-white">
              1 {buyToken?.symbol} ≈ {(1 / exchangeRate).toFixed(8)} {sellToken?.symbol}
            </span>
          </div>
        )}

        {/* Fee */}
        {quote && (
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-gray-600 dark:text-gray-400">Fee</span>
            <span className="font-medium dark:text-white">
              ~{quote.feePercent || 0.2}% ({getCurrencySymbol()}{quote.feeUsd?.toFixed(2) || '0.00'})
            </span>
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={!walletAddress || loading || !sellAmount || parseFloat(sellAmount) <= 0}
          className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {!walletAddress ? 'Connect Wallet' : loading ? 'Loading...' : 'Swap'}
        </Button>

        {/* Non-Custodial Notice */}
        <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          🔒 Non-custodial · Your keys, your crypto
        </div>
      </div>
    </div>
  );
};

export default SwapFormV3;
