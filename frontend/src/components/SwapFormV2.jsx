import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { useWalletClient } from 'wagmi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowDown, RefreshCw, Info, Zap, Settings, Search } from 'lucide-react';
import { toast } from 'sonner';
import TokenPriceWidget from './TokenPriceWidget';
import { getCoinGeckoId } from '../services/coingecko';
import { calculateAutoSlippage, formatSlippage, shouldShowSlippageWarning } from '../utils/slippage';
import { saveSwapToHistory } from '../utils/localHistory';
import { getExplorerUrl, getExplorerName } from '../utils/explorer';
import { getReferrerFromStorage } from '../utils/referral';
import TokenSearchModal from './TokenSearchModal';
import TokenSecurityPanel from './TokenSecurityPanel';
import TokenSearchAutocomplete from './TokenSearchAutocomplete';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Popular default tokens by chain
const DEFAULT_TOKENS = {
  1: [
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ethereum' },
    { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6, name: 'USD Coin' },
  ],
  56: [
    { symbol: 'BNB', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'BNB' },
    { symbol: 'USDT', address: '0x55d398326f99059ff775485246999027b3197955', decimals: 18, name: 'Tether USD' },
  ],
  137: [
    { symbol: 'MATIC', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Polygon' },
    { symbol: 'USDC', address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', decimals: 6, name: 'USD Coin' },
  ]
};

const SwapFormV2 = ({ chainId, walletAddress }) => {
  const { data: walletClient } = useWalletClient();
  
  // Token selection states
  const [sellToken, setSellToken] = useState(null);
  const [buyToken, setBuyToken] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  
  // Modal states
  const [showSellTokenSearch, setShowSellTokenSearch] = useState(false);
  const [showBuyTokenSearch, setShowBuyTokenSearch] = useState(false);
  
  // Swap states
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState(null);
  
  // Slippage states
  const [autoSlippage, setAutoSlippage] = useState(true);
  const [manualSlippage, setManualSlippage] = useState(0.5);
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  
  // Price tracking
  const [sellTokenCoinId, setSellTokenCoinId] = useState(null);
  const [buyTokenCoinId, setBuyTokenCoinId] = useState(null);

  // Initialize with default tokens when chain changes
  useEffect(() => {
    const defaults = DEFAULT_TOKENS[chainId] || [];
    if (defaults.length >= 2) {
      setSellToken(defaults[0]);
      setBuyToken(defaults[1]);
    } else {
      setSellToken(null);
      setBuyToken(null);
    }
    setQuote(null);
    setSellAmount('');
    setError(null);
  }, [chainId]);

  // Update CoinGecko ID when sell token changes
  useEffect(() => {
    if (sellToken?.address) {
      const coinId = getCoinGeckoId(sellToken.address, chainId);
      setSellTokenCoinId(coinId);
    }
  }, [sellToken, chainId]);

  // Update CoinGecko ID when buy token changes
  useEffect(() => {
    if (buyToken?.address) {
      const coinId = getCoinGeckoId(buyToken.address, chainId);
      setBuyTokenCoinId(coinId);
    }
  }, [buyToken, chainId]);

  // Auto-fetch quote when inputs change (with debouncing)
  useEffect(() => {
    if (!sellToken || !buyToken || !sellAmount || parseFloat(sellAmount) <= 0) {
      setQuote(null);
      setError(null);
      return;
    }

    // Debounce: Wait 800ms after user stops typing
    const timer = setTimeout(() => {
      fetchQuote();
    }, 800);

    return () => clearTimeout(timer);
  }, [sellToken, buyToken, sellAmount, walletAddress]);

  const fetchQuote = async () => {
    if (!sellToken || !buyToken || !sellAmount || parseFloat(sellAmount) <= 0 || !walletAddress) {
      return;
    }

    setLoading(true);
    setError(null);
    setPriceImpact(0);

    try {
      const sellAmountInBaseUnits = ethers.parseUnits(sellAmount, sellToken.decimals).toString();

      const chainNames = { 1: 'ethereum', 56: 'bsc', 137: 'polygon' };
      const chainName = chainNames[chainId] || 'ethereum';

      const response = await axios.post(`${API}/evm/quote`, {
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount: sellAmountInBaseUnits,
        takerAddress: walletAddress,
        chain: chainName
      });

      const quoteData = response.data;
      
      // 0x v2 API can return buyAmount in different places
      const buyAmount = quoteData.buyAmount || quoteData.transaction?.buyAmount || quoteData.issues?.buyAmount;
      
      if (!buyAmount) {
        throw new Error('No buyAmount in quote response');
      }

      // Calculate price impact (simplified)
      const outputAmount = ethers.formatUnits(buyAmount, buyToken.decimals);
      const expectedOutput = parseFloat(sellAmount); // Simplified
      const impact = Math.abs(((expectedOutput - parseFloat(outputAmount)) / expectedOutput) * 100);
      setPriceImpact(impact);

      // Normalize quote data structure
      setQuote({
        ...quoteData,
        buyAmount: buyAmount // Ensure buyAmount is at top level
      });
    } catch (err) {
      console.error('Error fetching quote:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch quote';
      setError(errorMsg);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!quote || !walletClient) {
      toast.error('Missing quote or wallet connection');
      return;
    }

    setSwapping(true);

    try {
      // 0x v2 API returns transaction data in a nested structure
      const txData = quote.transaction || quote;
      
      // Validate transaction data exists
      if (!txData.to || !txData.data) {
        throw new Error('Invalid quote data - missing transaction details');
      }

      const txHash = await walletClient.sendTransaction({
        to: txData.to,
        data: txData.data,
        value: BigInt(txData.value || '0'),
        gas: txData.gas ? BigInt(txData.gas) : undefined,
        gasPrice: txData.gasPrice ? BigInt(txData.gasPrice) : undefined,
      });

      toast.success('Transaction submitted!', {
        description: `TX: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`
      });

      // Get referrer if exists
      const referrer = getReferrerFromStorage();

      // Log swap to backend
      const chainNames = { 1: 'ethereum', 56: 'bsc', 137: 'polygon' };
      const swapLogData = {
        wallet_address: walletAddress,
        chain: chainNames[chainId],
        chain_id: chainId,
        token_in: sellToken.address,
        token_out: buyToken.address,
        amount_in: sellAmount,
        amount_out: ethers.formatUnits(quote.buyAmount, buyToken.decimals),
        fee_amount: (parseFloat(ethers.formatUnits(quote.buyAmount, buyToken.decimals)) * 0.002).toFixed(6),
        tx_hash: txHash,
        status: 'completed',
        referrer: referrer || undefined
      };

      try {
        await axios.post(`${API}/swaps`, swapLogData);

        // Log referral if exists
        if (referrer) {
          await axios.post(`${API}/referrals`, {
            referrer_wallet: referrer,
            trader_wallet: walletAddress,
            chain: chainNames[chainId],
            token_pair: `${sellToken.symbol}-${buyToken.symbol}`,
            swap_amount: sellAmount,
            tx_hash: txHash
          });
        }
      } catch (logError) {
        console.error('Failed to log swap:', logError);
      }

      // Save to localStorage history
      saveSwapToHistory({
        chain: chainNames[chainId],
        chainId: chainId,
        tokenInSymbol: sellToken.symbol,
        tokenOutSymbol: buyToken.symbol,
        amountIn: sellAmount,
        amountOut: ethers.formatUnits(quote.buyAmount, buyToken.decimals),
        txHash: txHash
      });

      // Show explorer link
      const explorerUrl = getExplorerUrl(chainId, txHash);
      const explorerName = getExplorerName(chainId);
      if (explorerUrl) {
        toast.success(
          <div>
            <p>Swap completed!</p>
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
              View on {explorerName}
            </a>
          </div>,
          { duration: 10000 }
        );
      }

      // Reset form
      setQuote(null);
      setSellAmount('');
      toast.success('Swap completed successfully!');
    } catch (err) {
      console.error('Swap failed:', err);
      const errorMsg = err.message || 'Swap transaction failed';
      toast.error(errorMsg);
    } finally {
      setSwapping(false);
    }
  };

  const handleSelectSellToken = (token) => {
    // Don't allow same token
    if (buyToken && token.address.toLowerCase() === buyToken.address.toLowerCase()) {
      toast.error('Cannot select the same token for both sides');
      return;
    }
    setSellToken(token);
  };

  const handleSelectBuyToken = (token) => {
    // Don't allow same token
    if (sellToken && token.address.toLowerCase() === sellToken.address.toLowerCase()) {
      toast.error('Cannot select the same token for both sides');
      return;
    }
    setBuyToken(token);
  };

  // Calculate slippage intelligently based on token types
  const effectiveSlippage = autoSlippage 
    ? calculateAutoSlippage(priceImpact, sellToken?.symbol, buyToken?.symbol)
    : { slippage: manualSlippage, warning: null };

  // Prüfe ob Warning angezeigt werden soll (nicht bei renommierten Coins)
  const showWarning = effectiveSlippage.warning && 
    shouldShowSlippageWarning(effectiveSlippage.slippage, sellToken?.symbol, buyToken?.symbol);

  return (
    <div data-testid="swap-form" className="space-y-4">
      {/* Token Search Modals */}
      <TokenSearchModal
        isOpen={showSellTokenSearch}
        onClose={() => setShowSellTokenSearch(false)}
        onSelectToken={handleSelectSellToken}
        chainId={chainId}
        excludeToken={buyToken?.address}
      />
      <TokenSearchModal
        isOpen={showBuyTokenSearch}
        onClose={() => setShowBuyTokenSearch(false)}
        onSelectToken={handleSelectBuyToken}
        chainId={chainId}
        excludeToken={sellToken?.address}
      />

      {/* Token Price Widget */}
      {sellTokenCoinId && (
        <TokenPriceWidget coinId={sellTokenCoinId} />
      )}


      {/* Universal Token Search */}
      <div className="mb-4">
        <TokenSearchAutocomplete
          onSelect={(token) => {
            // Map resolved token to our format
            const formattedToken = {
              symbol: token.symbol,
              address: token.address,
              decimals: token.decimals || 18,
              name: token.name,
              logoURI: token.logoURL
            };
            
            // Set as sell token by default
            if (buyToken && token.address?.toLowerCase() === buyToken.address?.toLowerCase()) {
              toast.error('Cannot select the same token for both sides');
              return;
            }
            setSellToken(formattedToken);
            toast.success(`Selected ${token.symbol}`, {
              description: `Now trading ${token.name}`
            });
          }}
          placeholder="🔍 Search any token by name, symbol or address"
          excludeAddress={buyToken?.address}
          chainId={chainId}
        />
      </div>

      {/* Slippage Settings */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Slippage Tolerance</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={autoSlippage ? "default" : "outline"}
            onClick={() => setAutoSlippage(true)}
            className="h-8 px-3"
            data-testid="auto-slippage-button"
          >
            <Zap className="w-3 h-3 mr-1" />
            Auto
          </Button>
          <Button
            size="sm"
            variant={!autoSlippage ? "default" : "outline"}
            onClick={() => setShowSlippageSettings(!showSlippageSettings)}
            className="h-8 px-3"
          >
            <Settings className="w-3 h-3 mr-1" />
            {formatSlippage(effectiveSlippage.slippage)}
          </Button>
        </div>
      </div>

      {showSlippageSettings && !autoSlippage && (
        <div className="bg-gray-50 rounded-lg p-3">
          <label className="text-xs text-gray-600 mb-2 block">Custom Slippage (%)</label>
          <Input
            type="number"
            value={manualSlippage}
            onChange={(e) => setManualSlippage(parseFloat(e.target.value) || 0.5)}
            step="0.1"
            min="0.1"
            max="50"
            className="h-8"
          />
        </div>
      )}

      {showWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200">
          {effectiveSlippage.warning}
        </div>
      )}

      {/* Sell Token */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">You Pay</label>
        <div className="space-y-2">
          {/* Token Selector Button */}
          <button
            onClick={() => setShowSellTokenSearch(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl hover:border-blue-500 transition-colors flex items-center justify-between bg-white"
            data-testid="sell-token-button"
          >
            <div className="flex items-center gap-2">
              {sellToken ? (
                <>
                  {sellToken.logoURI && (
                    <img src={sellToken.logoURI} alt={sellToken.symbol} className="w-6 h-6 rounded-full" />
                  )}
                  <div className="text-left">
                    <div className="font-semibold">{sellToken.symbol}</div>
                    <div className="text-xs text-gray-500">{sellToken.name}</div>
                  </div>
                </>
              ) : (
                <span className="text-gray-500">Select Token</span>
              )}
            </div>
            <Search className="w-5 h-5 text-gray-400" />
          </button>

          {/* Amount Input */}
          <Input
            data-testid="sell-amount-input"
            type="number"
            placeholder="0.0"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            className="w-full px-4 py-3 text-lg"
            step="any"
            min="0"
          />
        </div>

        {/* Security Panel for Sell Token */}
        {sellToken && sellToken.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' && (
          <TokenSecurityPanel
            tokenAddress={sellToken.address}
            chainId={chainId}
            tokenSymbol={sellToken.symbol}
          />
        )}
      </div>

      {/* Swap Direction */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-full p-2">
          <ArrowDown className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      {/* Buy Token */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">You Receive</label>
        <div className="space-y-2">
          {/* Token Selector Button */}
          <button
            onClick={() => setShowBuyTokenSearch(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl hover:border-blue-500 transition-colors flex items-center justify-between bg-white"
            data-testid="buy-token-button"
          >
            <div className="flex items-center gap-2">
              {buyToken ? (
                <>
                  {buyToken.logoURI && (
                    <img src={buyToken.logoURI} alt={buyToken.symbol} className="w-6 h-6 rounded-full" />
                  )}
                  <div className="text-left">
                    <div className="font-semibold">{buyToken.symbol}</div>
                    <div className="text-xs text-gray-500">{buyToken.name}</div>
                  </div>
                </>
              ) : (
                <span className="text-gray-500">Select Token</span>
              )}
            </div>
            <Search className="w-5 h-5 text-gray-400" />
          </button>

          {/* Amount Display */}
          <div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 text-lg text-gray-900 flex items-center justify-between">
            {loading ? (
              <span className="text-gray-500 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </span>
            ) : quote && buyToken ? (
              <span className="font-medium">
                {ethers.formatUnits(quote.buyAmount, buyToken.decimals)}
              </span>
            ) : (
              <span className="text-gray-400">0.0</span>
            )}
          </div>
        </div>

        {/* Security Panel for Buy Token */}
        {buyToken && buyToken.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' && (
          <TokenSecurityPanel
            tokenAddress={buyToken.address}
            chainId={chainId}
            tokenSymbol={buyToken.symbol}
          />
        )}
      </div>

        {/* Price Widget for Buy Token */}
        {buyTokenCoinId && (
          <div className="mt-2">
            <TokenPriceWidget coinId={buyTokenCoinId} />
          </div>
        )}


      {/* Quote Details */}
      {quote && sellToken && buyToken && (
        <div data-testid="quote-details" className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Rate:</span>
                <span className="font-medium">
                  1 {sellToken.symbol} = {(parseFloat(ethers.formatUnits(quote.buyAmount, buyToken.decimals)) / parseFloat(sellAmount)).toFixed(6)} {buyToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (0.2%):</span>
                <span className="font-medium">
                  {(parseFloat(ethers.formatUnits(quote.buyAmount, buyToken.decimals)) * 0.002).toFixed(6)} {buyToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slippage:</span>
                <span className="font-medium">{formatSlippage(effectiveSlippage.slippage)}</span>
              </div>
              {quote.sources && quote.sources.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium text-xs">{quote.sources.slice(0, 2).map(s => s.name).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div data-testid="error-message" className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading indicator during auto-fetch */}
      {loading && (
        <div className="flex items-center justify-center py-3 text-sm text-gray-600">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Fetching best price across multiple DEXs...
        </div>
      )}

      {/* Action Button */}
      <Button
        data-testid="execute-swap-button"
        onClick={executeSwap}
        disabled={!walletAddress || !quote || swapping || loading}
        className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
      >
        {swapping ? (
          <>
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Swapping...
          </>
        ) : !walletAddress ? (
          'Connect Wallet'
        ) : !quote ? (
          'Enter amount to swap'
        ) : (
          'Confirm Swap'
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-xs text-center text-gray-500 mt-4">
        🔒 Always verify transaction details in your wallet before signing
      </div>
    </div>
  );
};

export default SwapFormV2;
