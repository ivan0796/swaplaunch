import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowDown, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Popular Solana tokens
const SOLANA_TOKENS = [
  { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9, name: 'Solana' },
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, name: 'USD Coin' },
  { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, name: 'Tether USD' },
];

const SolanaSwapForm = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [sellToken, setSellToken] = useState(SOLANA_TOKENS[0]);
  const [buyToken, setBuyToken] = useState(SOLANA_TOKENS[1]);
  const [sellAmount, setSellAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fetch quote when inputs change
  useEffect(() => {
    if (!sellToken || !buyToken || !sellAmount || parseFloat(sellAmount) <= 0) {
      setQuote(null);
      setError(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchQuote();
    }, 800);

    return () => clearTimeout(timer);
  }, [sellToken, buyToken, sellAmount, wallet.publicKey]);

  const fetchQuote = async () => {
    if (!sellToken || !buyToken || !sellAmount || parseFloat(sellAmount) <= 0 || !wallet.publicKey) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sellAmountLamports = Math.floor(parseFloat(sellAmount) * Math.pow(10, sellToken.decimals));

      const response = await axios.post(`${API}/solana/quote`, {
        inputMint: sellToken.mint,
        outputMint: buyToken.mint,
        amount: sellAmountLamports,
        userPublicKey: wallet.publicKey.toString()
      });

      setQuote(response.data);
    } catch (err) {
      console.error('Error fetching Solana quote:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch quote';
      setError(errorMsg);
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

    setSwapping(true);

    try {
      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(quote.swapTransaction, 'base64');
      let transaction;
      
      try {
        // Try as versioned transaction first
        transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      } catch (e) {
        // Fallback to legacy transaction
        transaction = Transaction.from(swapTransactionBuf);
      }

      // Sign and send transaction
      const signed = await wallet.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
        maxRetries: 2
      });

      toast.success('Transaction submitted!', {
        description: `TX: ${txid.slice(0, 10)}...${txid.slice(-8)}`
      });

      // Wait for confirmation
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

      // Reset form
      setQuote(null);
      setSellAmount('');
    } catch (err) {
      console.error('Swap failed:', err);
      const errorMsg = err.message || 'Swap transaction failed';
      toast.error(errorMsg);
    } finally {
      setSwapping(false);
    }
  };

  const handleSelectSellToken = (token) => {
    if (buyToken && token.mint === buyToken.mint) {
      toast.error('Cannot select the same token for both sides');
      return;
    }
    setSellToken(token);
  };

  const handleSelectBuyToken = (token) => {
    if (sellToken && token.mint === sellToken.mint) {
      toast.error('Cannot select the same token for both sides');
      return;
    }
    setBuyToken(token);
  };

  return (
    <div data-testid="solana-swap-form" className="space-y-4">
      {/* Wallet Connection Notice */}
      {!wallet.connected && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">Solana Wallet Required</p>
            <p className="text-blue-700 mt-1">Connect your Phantom or Solflare wallet to swap on Solana</p>
          </div>
        </div>
      )}

      {/* Sell Token */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">You Pay</label>
        <div className="flex gap-2">
          <select
            data-testid="sell-token-select"
            value={sellToken?.mint}
            onChange={(e) => {
              const token = SOLANA_TOKENS.find(t => t.mint === e.target.value);
              handleSelectSellToken(token);
            }}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SOLANA_TOKENS.map(token => (
              <option key={token.mint} value={token.mint}>
                {token.symbol}
              </option>
            ))}
          </select>
          <Input
            data-testid="sell-amount-input"
            type="number"
            placeholder="0.0"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            className="flex-1 px-4 py-3 text-lg"
            step="any"
            min="0"
          />
        </div>
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
        <div className="flex gap-2">
          <select
            data-testid="buy-token-select"
            value={buyToken?.mint}
            onChange={(e) => {
              const token = SOLANA_TOKENS.find(t => t.mint === e.target.value);
              handleSelectBuyToken(token);
            }}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SOLANA_TOKENS.map(token => (
              <option key={token.mint} value={token.mint}>
                {token.symbol}
              </option>
            ))}
          </select>
          <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 text-lg text-gray-900 flex items-center justify-between">
            {loading ? (
              <span className="text-gray-500 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </span>
            ) : quote ? (
              <span className="font-medium">
                {(quote.outAmount / Math.pow(10, buyToken.decimals)).toFixed(6)}
              </span>
            ) : (
              <span className="text-gray-400">0.0</span>
            )}
          </div>
        </div>
      </div>

      {/* Quote Details */}
      {quote && (
        <div data-testid="quote-details" className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Rate:</span>
                <span className="font-medium">
                  1 {sellToken.symbol} = {((quote.outAmount / Math.pow(10, buyToken.decimals)) / parseFloat(sellAmount)).toFixed(6)} {buyToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (0.2%):</span>
                <span className="font-medium">
                  {((quote.outAmount / Math.pow(10, buyToken.decimals)) * 0.002).toFixed(6)} {buyToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price Impact:</span>
                <span className="font-medium">{quote.priceImpactPct}%</span>
              </div>
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

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-3 text-sm text-gray-600">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Fetching best price via Jupiter...
        </div>
      )}

      {/* Action Button */}
      <Button
        data-testid="execute-swap-button"
        onClick={executeSwap}
        disabled={!quote || swapping || loading || !wallet.connected}
        className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
      >
        {swapping ? (
          <>
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Swapping...
          </>
        ) : !wallet.connected ? (
          'Connect Solana Wallet'
        ) : !quote ? (
          'Enter amount to swap'
        ) : (
          'Confirm Swap'
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-xs text-center text-gray-500 mt-4">
        🔒 Powered by Jupiter - Always verify transaction details
      </div>
    </div>
  );
};

export default SolanaSwapForm;
