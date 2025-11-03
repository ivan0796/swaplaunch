import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { useWalletClient } from 'wagmi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowDown, RefreshCw, Info, Zap, Settings, Search, TrendingUp } from 'lucide-react';
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
import PairSearchModal from './PairSearchModal';
import CombinedSecurityWarning from './CombinedSecurityWarning';
import TokenRiskDisclaimer from './TokenRiskDisclaimer';
import FeeBreakdownBar from './FeeBreakdownBar';
import MEVProtectionToggle from './MEVProtectionToggle';
import ExplorerLink from './ExplorerLink';
import RouteBreakdown from './RouteBreakdown';
import { CMC_TOP_TOKENS } from '../utils/cmcTokens';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Popular default tokens by chain - ONLY Top/Major coins with CMC logos
const DEFAULT_TOKENS = {
  1: [ // Ethereum
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ethereum', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, name: 'Tether', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, name: 'USD Coin', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
    { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, name: 'Wrapped Ether', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png' },
    { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, name: 'Dai', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png' },
  ],
  56: [ // BSC
    { symbol: 'BNB', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'BNB', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
    { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, name: 'Tether', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
    { symbol: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, name: 'USD Coin', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  ],
  137: [ // Polygon
    { symbol: 'MATIC', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Polygon', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png' },
    { symbol: 'USDC', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6, name: 'USD Coin', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
    { symbol: 'USDT', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, name: 'Tether', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
  ],
  42161: [ // Arbitrum
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ethereum', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, name: 'USD Coin', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
    { symbol: 'ARB', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18, name: 'Arbitrum', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png' },
  ],
  10: [ // Optimism
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ethereum', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { symbol: 'USDC', address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', decimals: 6, name: 'USD Coin', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
    { symbol: 'OP', address: '0x4200000000000000000000000000000000000042', decimals: 18, name: 'Optimism', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png' },
  ],
  8453: [ // Base
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ethereum', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, name: 'USD Coin', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  ],
  43114: [ // Avalanche
    { symbol: 'AVAX', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Avalanche', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png' },
    { symbol: 'USDC', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6, name: 'USD Coin', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  ],
  250: [ // Fantom
    { symbol: 'FTM', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Fantom', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3513.png' },
    { symbol: 'USDC', address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', decimals: 6, name: 'USD Coin', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  ],
  25: [ // Cronos
    { symbol: 'CRO', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Cronos', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png' },
    { symbol: 'USDC', address: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', decimals: 6, name: 'USD Coin', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  ],
  324: [ // zkSync
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ethereum', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { symbol: 'USDC', address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', decimals: 6, name: 'USD Coin', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  ],
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
  const [showPairSearch, setShowPairSearch] = useState(false);
  const [showWalletConfirm, setShowWalletConfirm] = useState(false);
  
  // Risk disclaimer states
  const [showRiskDisclaimer, setShowRiskDisclaimer] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);
  const [pendingTokenType, setPendingTokenType] = useState(null); // 'sell' or 'buy'
  
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
  
  // MEV Protection & Advanced settings
  const [mevProtection, setMevProtection] = useState(false);
  const [slippageMode, setSlippageMode] = useState('auto'); // 'auto' or 'custom'
  
  // Price tracking
  const [sellTokenCoinId, setSellTokenCoinId] = useState(null);
  const [buyTokenCoinId, setBuyTokenCoinId] = useState(null);
  
  // Combined security state
  const [combinedSecurityWarning, setCombinedSecurityWarning] = useState(null);

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

      // Normalize quote data structure and preserve all tiered fee fields
      setQuote({
        ...quoteData,
        buyAmount: buyAmount, // Ensure buyAmount is at top level
        // NEW: Tiered fee fields from API (v1-tiered)
        feeTier: quoteData.feeTier,
        feePercent: quoteData.feePercent,
        feeUsd: quoteData.feeUsd,
        amountInUsd: quoteData.amountInUsd,
        netAmountIn: quoteData.netAmountIn,
        originalAmountIn: quoteData.originalAmountIn,
        nextTier: quoteData.nextTier,
        notes: quoteData.notes,
        quoteVersion: quoteData.quoteVersion
      });
      
      // Log tiered fee info for debugging
      if (quoteData.feeTier) {
        console.log('[Tiered Fee]', {
          tier: quoteData.feeTier,
          feePercent: `${quoteData.feePercent}%`,
          feeUsd: quoteData.feeUsd ? `$${quoteData.feeUsd}` : 'N/A',
          amountUsd: quoteData.amountInUsd ? `$${quoteData.amountInUsd}` : 'N/A',
          nextTier: quoteData.nextTier
        });
      }
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

    // Show wallet confirmation modal
    setShowWalletConfirm(true);

    setSwapping(true);

    try {
      // 0x v2 API returns transaction data in a nested structure
      const txData = quote.transaction || quote;
      
      // Validate transaction data exists
      if (!txData.to || !txData.data) {
        setShowWalletConfirm(false);
        throw new Error('Invalid quote data - missing transaction details');
      }

      const txHash = await walletClient.sendTransaction({
        to: txData.to,
        data: txData.data,
        value: BigInt(txData.value || '0'),
        gas: txData.gas ? BigInt(txData.gas) : undefined,
        gasPrice: txData.gasPrice ? BigInt(txData.gasPrice) : undefined,
      });

      // Hide confirmation modal after signing
      setShowWalletConfirm(false);

      // Show success with Explorer link
      toast.success(
        <div className="flex flex-col gap-2">
          <div>Transaction submitted!</div>
          <ExplorerLink chainId={chainId} txHash={txHash} type="tx" />
        </div>,
        { duration: 10000 }
      );

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
      setShowWalletConfirm(false);
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

  // Handle pair selection
  const handleSelectPair = (pair) => {
    // Set both tokens from the pair
    const baseToken = {
      symbol: pair.baseToken.symbol,
      address: pair.baseToken.address,
      decimals: 18, // Default, should ideally get from chain
      name: pair.baseToken.name,
      logoURI: pair.logoUrl
    };
    
    const quoteToken = {
      symbol: pair.quoteToken.symbol,
      address: pair.quoteToken.address,
      decimals: 18,
      name: pair.quoteToken.name,
      logoURI: null
    };
    
    setSellToken(baseToken);
    setBuyToken(quoteToken);
    toast.success(`Selected ${pair.baseToken.symbol}/${pair.quoteToken.symbol} pair`);
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

      {/* Pair Search Modal */}
      <PairSearchModal
        isOpen={showPairSearch}
        onClose={() => setShowPairSearch(false)}
        onSelectPair={handleSelectPair}
        chainId={chainId}
      />

      {/* Token Price Widget */}
      {sellTokenCoinId && (
        <TokenPriceWidget coinId={sellTokenCoinId} />
      )}

      {/* Quick Pair Selection Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPairSearch(true)}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Select Trading Pair
        </Button>
        <span className="text-xs text-gray-500">Or search tokens individually below</span>
      </div>

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
            onClick={() => {
              setAutoSlippage(false);
              setShowSlippageSettings(!showSlippageSettings);
            }}
            className="h-8 px-3"
          >
            <Settings className="w-3 h-3 mr-1" />
            {formatSlippage(effectiveSlippage.slippage)}
          </Button>
        </div>
      </div>

      {showSlippageSettings && !autoSlippage && (
        <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800">
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Custom Slippage (%)</label>
          <Input
            type="number"
            value={manualSlippage}
            onChange={(e) => setManualSlippage(parseFloat(e.target.value) || 0.5)}
            step="0.1"
            min="0.1"
            max="50"
            className="h-8"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Recommended: 0.1-0.5% for stablecoins, 0.5-1% for major tokens
          </p>
        </div>
      )}

      {/* Auto-Slippage Info (nur sichtbar im Auto-Modus) */}
      {autoSlippage && effectiveSlippage.reason && (
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Zap className="w-3 h-3" />
          <span>Auto: {effectiveSlippage.reason}</span>
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
                  {sellToken.logoURI ? (
                    <img 
                      src={sellToken.logoURI} 
                      alt={sellToken.symbol} 
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                    style={{ display: sellToken.logoURI ? 'none' : 'flex' }}
                  >
                    {sellToken.symbol?.charAt(0) || '?'}
                  </div>
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

        {/* Security Panel for Sell Token - Hidden, using combined warning instead */}
        {/* {sellToken && sellToken.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' && (
          <TokenSecurityPanel
            tokenAddress={sellToken.address}
            chainId={chainId}
            tokenSymbol={sellToken.symbol}
          />
        )} */}
      </div>

      {/* Swap Direction */}
      <div className="flex justify-center">
        <button 
          onClick={() => {
            // Swap tokens
            const tempToken = sellToken;
            setSellToken(buyToken);
            setBuyToken(tempToken);
            
            // Clear amounts and quote
            setSellAmount('');
            setQuote(null);
            
            toast.success('Tokens swapped!');
          }}
          className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors cursor-pointer"
          title="Swap token positions"
        >
          <ArrowDown className="w-5 h-5 text-gray-600" />
        </button>
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
                  {buyToken.logoURI ? (
                    <img 
                      src={buyToken.logoURI} 
                      alt={buyToken.symbol} 
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                    style={{ display: buyToken.logoURI ? 'none' : 'flex' }}
                  >
                    {buyToken.symbol?.charAt(0) || '?'}
                  </div>
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

        {/* Security Panel for Buy Token - Hidden, using combined warning instead */}
        {/* {buyToken && buyToken.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' && (
          <TokenSecurityPanel
            tokenAddress={buyToken.address}
            chainId={chainId}
            tokenSymbol={buyToken.symbol}
          />
        )} */}
      </div>

        {/* Price Widget for Buy Token */}
        {buyTokenCoinId && (
          <div className="mt-2">
            <TokenPriceWidget coinId={buyTokenCoinId} />
          </div>
        )}


      {/* MEV Protection & Slippage Settings */}
      <MEVProtectionToggle
        enabled={mevProtection}
        onToggle={() => setMevProtection(!mevProtection)}
        slippageMode={slippageMode}
        onSlippageModeChange={setSlippageMode}
      />

      {/* Fee Breakdown Bar */}
      {quote && <FeeBreakdownBar quote={quote} platformFeeBps={20} />}

      {/* Tiered Fee Info - Simple display for user (UI styling by user) */}
      {quote && quote.feeTier && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                Platform Fee: {quote.feePercent}%
              </span>
            </div>
            {quote.feeUsd && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ${quote.feeUsd.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Tier Info */}
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Your Tier:</span>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {quote.feeTier.replace(/_/g, ' ')}
              </span>
            </div>
            
            {quote.amountInUsd && (
              <div className="flex justify-between">
                <span>Trade Amount:</span>
                <span className="font-medium">${quote.amountInUsd.toFixed(2)}</span>
              </div>
            )}
            
            {/* Next Tier Progress */}
            {quote.nextTier && (
              <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
                <div className="flex justify-between mb-1">
                  <span>Next Tier ({quote.nextTier.fee_percent}%):</span>
                  <span className="font-medium">${quote.nextTier.amount_needed_usd.toFixed(0)} more</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-purple-600 h-1.5 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, ((quote.amountInUsd || 0) / (quote.nextTier.threshold_usd || 1)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Note */}
          {quote.notes && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
              💡 {quote.notes}
            </div>
          )}
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
                <span className="text-gray-600">Slippage:</span>
                <span className="font-medium">{slippageMode === 'auto' ? 'Auto (0.1-0.5%)' : formatSlippage(effectiveSlippage.slippage)}</span>
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
      
      {/* Combined Security Warning - placed above button */}
      <CombinedSecurityWarning
        sellToken={sellToken}
        buyToken={buyToken}
        chainId={chainId}
        onWarningChange={setCombinedSecurityWarning}
      />

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
        disabled={
          !walletAddress || 
          !sellToken || 
          !buyToken || 
          !sellAmount || 
          parseFloat(sellAmount) <= 0 ||
          !quote || 
          swapping || 
          loading
        }
        className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
      >
        {swapping ? (
          <>
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Swapping...
          </>
        ) : !walletAddress ? (
          'Connect Wallet'
        ) : !sellToken || !buyToken ? (
          'Select tokens'
        ) : !sellAmount || parseFloat(sellAmount) <= 0 ? (
          'Enter amount'
        ) : loading ? (
          'Loading...'
        ) : !quote ? (
          'Swap not available for this pair'
        ) : (
          'Start Swapping'
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-xs text-center text-gray-500 mt-4">
        🔒 Always verify transaction details in your wallet before signing
      </div>

      {/* Wallet Confirmation Modal */}
      {showWalletConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Bitte in der Wallet bestätigen</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Überprüfen Sie die Transaktionsdetails in Ihrer Wallet und bestätigen Sie den Swap.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Warte auf Bestätigung...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapFormV2;
