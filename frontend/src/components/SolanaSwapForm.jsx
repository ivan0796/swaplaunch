import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { Button } from './ui/button';
import { ArrowDown, RefreshCw, Info, Search } from 'lucide-react';
import { toast } from 'sonner';
import TokenSearchModal from './TokenSearchModal';
import CombinedSecurityWarning from './CombinedSecurityWarning';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Popular Solana tokens with correct logos
const SOLANA_TOKENS = [
  { 
    symbol: 'SOL', 
    address: 'So11111111111111111111111111111111111111112',
    mint: 'So11111111111111111111111111111111111111112', 
    decimals: 9, 
    name: 'Solana',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png'
  },
  { 
    symbol: 'USDC', 
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 
    decimals: 6, 
    name: 'USD Coin',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
];

const SolanaSwapForm = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  // Token selection states
  const [sellToken, setSellToken] = useState(SOLANA_TOKENS[0]);
  const [buyToken, setBuyToken] = useState(SOLANA_TOKENS[1]);
  const [sellAmount, setSellAmount] = useState('');

  // Modal states
  const [showSellTokenSearch, setShowSellTokenSearch] = useState(false);
  const [showBuyTokenSearch, setShowBuyTokenSearch] = useState(false);
  const [showWalletConfirm, setShowWalletConfirm] = useState(false);

  // Swap states
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState(null);

  // Combined security state
  const [combinedSecurityWarning, setCombinedSecurityWarning] = useState(null);

  // Auto-fetch quote when amount changes
  useEffect(() => {
    if (!sellToken || !buyToken || !sellAmount || parseFloat(sellAmount) <= 0) {
      setQuote(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => clearTimeout(timer);
  }, [sellAmount, sellToken, buyToken]);

  const fetchQuote = async () => {
    if (!sellToken || !buyToken || !sellAmount) return;

    setLoading(true);
    setError(null);

    try {
      const amountInSmallestUnit = Math.floor(parseFloat(sellAmount) * Math.pow(10, sellToken.decimals));

      const response = await axios.get(`${API}/solana/quote`, {
        params: {
          inputMint: sellToken.mint || sellToken.address,
          outputMint: buyToken.mint || buyToken.address,
          amount: amountInSmallestUnit,
          slippageBps: 50
        }
      });

      setQuote(response.data);
    } catch (err) {
      console.error('Quote failed:', err);
      setError(err.response?.data?.detail || 'Failed to get quote');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!quote || !wallet.publicKey || !wallet.signTransaction) {
      toast.error('Missing quote or wallet connection');
      return;
    }

    setShowWalletConfirm(true);
    setSwapping(true);

    try {
      const swapTransactionBuf = Buffer.from(quote.swapTransaction, 'base64');
      let transaction;

      try {
        transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      } catch (e) {
        transaction = Transaction.from(swapTransactionBuf);
      }

      const signed = await wallet.signTransaction(transaction);
      
      setShowWalletConfirm(false);

      const txid = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
        maxRetries: 2
      });

      toast.success('Transaction submitted!', {
        description: `TX: ${txid.slice(0, 10)}...${txid.slice(-8)}`
      });

      await connection.confirmTransaction(txid, 'confirmed');

      toast.success(
        <div>
          <p>Swap completed!</p>
          <a 
            href={`https://solscan.io/tx/${txid}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 underline text-sm"
          >
            View on Solscan
          </a>
        </div>,
        { duration: 10000 }
      );

      setQuote(null);
      setSellAmount('');
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
    if (buyToken && (token.mint || token.address) === (buyToken.mint || buyToken.address)) {
      toast.error('Cannot select the same token for both sides');
      return;
    }
    setSellToken(token);
  };

  const handleSelectBuyToken = (token) => {
    if (sellToken && (token.mint || token.address) === (sellToken.mint || sellToken.address)) {
      toast.error('Cannot select the same token for both sides');
      return;
    }
    setBuyToken(token);
  };

  return (
    <div data-testid="solana-swap-form" className="space-y-4">
      {/* Token Search Modals */}
      <TokenSearchModal
        isOpen={showSellTokenSearch}
        onClose={() => setShowSellTokenSearch(false)}
        onSelectToken={handleSelectSellToken}
        chainId={0}
        excludeToken={buyToken?.mint || buyToken?.address}
      />
      <TokenSearchModal
        isOpen={showBuyTokenSearch}
        onClose={() => setShowBuyTokenSearch(false)}
        onSelectToken={handleSelectBuyToken}
        chainId={0}
        excludeToken={sellToken?.mint || sellToken?.address}
      />

      {/* You Pay */}
      <div className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
        <div className="mb-2 text-sm text-gray-500">You Pay</div>
        
        <div className="space-y-3">
          {/* Token Selector */}
          <button
            onClick={() => setShowSellTokenSearch(true)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900"
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
          <input
            type="number"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            placeholder="0.0"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
      </div>

      {/* Swap Direction */}
      <div className="flex justify-center">
        <button 
          onClick={() => {
            const tempToken = sellToken;
            setSellToken(buyToken);
            setBuyToken(tempToken);
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

      {/* You Receive */}
      <div className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
        <div className="mb-2 text-sm text-gray-500">You Receive</div>
        
        <div className="space-y-3">
          {/* Token Selector */}
          <button
            onClick={() => setShowBuyTokenSearch(true)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900"
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
                {(parseInt(quote.outAmount) / Math.pow(10, buyToken.decimals)).toFixed(6)}
              </span>
            ) : (
              <span className="text-gray-400">0.0</span>
            )}
          </div>
        </div>
      </div>

      {/* Combined Security Warning */}
      <CombinedSecurityWarning
        sellToken={sellToken}
        buyToken={buyToken}
        chainId={0}
        onWarningChange={setCombinedSecurityWarning}
      />

      {/* Quote Details */}
      {quote && sellToken && buyToken && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Rate</span>
                <span className="font-medium">
                  1 {sellToken.symbol} ≈ {(parseInt(quote.outAmount) / parseInt(quote.inAmount) * Math.pow(10, sellToken.decimals - buyToken.decimals)).toFixed(6)} {buyToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price Impact</span>
                <span className="font-medium">{quote.priceImpactPct ? `${quote.priceImpactPct}%` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Route</span>
                <span className="font-medium text-xs">Jupiter</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading indicator during auto-fetch */}
      {loading && (
        <div className="flex items-center justify-center py-3 text-sm text-gray-600">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Fetching best price from Jupiter...
        </div>
      )}

      {/* Action Button */}
      <Button
        data-testid="execute-swap-button"
        onClick={executeSwap}
        disabled={
          !wallet.publicKey || 
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
        ) : !wallet.publicKey ? (
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

export default SolanaSwapForm;
