import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { useWalletClient } from 'wagmi';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowDown, RefreshCw, Info } from 'lucide-react';
import { toast } from 'sonner';
import { SOLANA_TOKENS } from '../utils/solanaTokens';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Popular tokens by chain
const POPULAR_TOKENS = {
  1: [
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18 },
    { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
    { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6 },
    { symbol: 'DAI', address: '0x6b175474e89094c44da98b954eedeac495271d0f', decimals: 18 },
  ],
  56: [
    { symbol: 'BNB', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18 },
    { symbol: 'USDT', address: '0x55d398326f99059ff775485246999027b3197955', decimals: 18 },
    { symbol: 'BUSD', address: '0xe9e7cea3dedca5984780bafc599bd69add087d56', decimals: 18 },
  ],
  137: [
    { symbol: 'MATIC', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18 },
    { symbol: 'USDC', address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', decimals: 6 },
    { symbol: 'USDT', address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', decimals: 6 },
  ],
  solana: SOLANA_TOKENS
};

const SwapForm = ({ chainId, walletAddress, walletType = 'evm' }) => {
  const { data: walletClient } = useWalletClient();
  const { connection } = useConnection();
  const { publicKey: solanaPublicKey, sendTransaction: sendSolanaTransaction } = useWallet();
  const [sellToken, setSellToken] = useState('');
  const [buyToken, setBuyToken] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when chain changes
  useEffect(() => {
    const tokens = POPULAR_TOKENS[chainId] || [];
    if (tokens.length >= 2) {
      if (walletType === 'solana') {
        setSellToken(tokens[0].mint);
        setBuyToken(tokens[1].mint);
      } else {
        setSellToken(tokens[0].address);
        setBuyToken(tokens[1].address);
      }
    }
    setQuote(null);
    setSellAmount('');
  }, [chainId, walletType]);

  const getTokenDecimals = (tokenAddress) => {
    const tokens = POPULAR_TOKENS[chainId] || [];
    const token = tokens.find(t => {
      const addr = walletType === 'solana' ? t.mint : t.address;
      return addr?.toLowerCase() === tokenAddress?.toLowerCase();
    });
    return token ? token.decimals : (walletType === 'solana' ? 9 : 18);
  };

  const fetchQuote = async () => {
    if (!sellToken || !buyToken || !sellAmount || parseFloat(sellAmount) <= 0) {
      setError('Please fill all fields with valid values');
      return;
    }

    setLoading(true);
    setError(null);
    setQuote(null);

    try {
      if (walletType === 'solana') {
        // Solana quote via Jupiter
        const decimals = getTokenDecimals(sellToken);
        const amount = Math.floor(parseFloat(sellAmount) * Math.pow(10, decimals)).toString();

        const response = await axios.post(`${API}/solana/quote`, {
          inputMint: sellToken,
          outputMint: buyToken,
          amount: amount,
          slippageBps: 50,
          takerPublicKey: walletAddress
        });

        setQuote({ ...response.data, isSolana: true });
        toast.success('Solana quote fetched successfully!');
      } else {
        // EVM quote via 0x
        const decimals = getTokenDecimals(sellToken);
        const sellAmountInBaseUnits = ethers.parseUnits(sellAmount, decimals).toString();

        const chainNames = { 1: 'ethereum', 56: 'bsc', 137: 'polygon' };
        const chainName = chainNames[chainId] || 'ethereum';

        const response = await axios.post(`${API}/evm/quote`, {
          sellToken,
          buyToken,
          sellAmount: sellAmountInBaseUnits,
          takerAddress: walletAddress,
          chain: chainName
        });

        setQuote(response.data);
        toast.success('Quote fetched successfully!');
      }
    } catch (err) {
      console.error('Error fetching quote:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch quote';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!quote) {
      toast.error('Missing quote');
      return;
    }

    setSwapping(true);

    try {
      if (walletType === 'solana' && quote.isSolana) {
        // Solana swap execution
        toast.info('Solana swap - Preparing transaction...');
        
        // Note: Full Jupiter swap integration requires additional steps
        // This is a simplified version - production should use Jupiter SDK
        toast.warning('Solana swap integration in progress. Use Jupiter directly for now.');
        
        // Log the swap attempt
        try {
          await axios.post(`${API}/swaps`, {
            wallet_address: walletAddress,
            chain: 'solana',
            chain_id: 0,
            token_in: sellToken,
            token_out: buyToken,
            amount_in: sellAmount,
            amount_out: (parseInt(quote.netOutputAmount) / Math.pow(10, getTokenDecimals(buyToken))).toString(),
            fee_amount: (parseInt(quote.platformFee.amount) / Math.pow(10, getTokenDecimals(buyToken))).toString(),
            status: 'pending'
          });
        } catch (logError) {
          console.error('Failed to log swap:', logError);
        }
      } else {
        // EVM swap via wallet
        if (!walletClient) {
          toast.error('Wallet not connected');
          return;
        }

        const txHash = await walletClient.sendTransaction({
          to: quote.to,
          data: quote.data,
          value: BigInt(quote.value || '0'),
          gas: BigInt(quote.gas || '500000'),
          gasPrice: BigInt(quote.gasPrice || '0')
        });

        toast.success('Transaction submitted!', {
          description: `TX: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`
        });

        // Log swap to backend
        try {
          const chainNames = { 1: 'ethereum', 56: 'bsc', 137: 'polygon' };
          await axios.post(`${API}/swaps`, {
            wallet_address: walletAddress,
            chain: chainNames[chainId],
            chain_id: chainId,
            token_in: sellToken,
            token_out: buyToken,
            amount_in: sellAmount,
            amount_out: ethers.formatUnits(quote.buyAmount, getTokenDecimals(buyToken)),
            fee_amount: (parseFloat(ethers.formatUnits(quote.buyAmount, getTokenDecimals(buyToken))) * 0.002).toFixed(6),
            tx_hash: txHash,
            status: 'completed'
          });
        } catch (logError) {
          console.error('Failed to log swap:', logError);
        }

        // Reset form
        setQuote(null);
        setSellAmount('');
        toast.success('Swap completed successfully!');
      }
    } catch (err) {
      console.error('Swap failed:', err);
      const errorMsg = err.message || 'Swap transaction failed';
      toast.error(errorMsg);
    } finally {
      setSwapping(false);
    }
  };

  const tokens = POPULAR_TOKENS[chainId] || [];

  return (
    <div data-testid="swap-form" className="space-y-4">
      {/* Sell Token */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">You Pay</label>
        <div className="flex gap-2">
          <select
            data-testid="sell-token-select"
            value={sellToken}
            onChange={(e) => setSellToken(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Token</option>
            {tokens.map(token => (
              <option key={token.address} value={token.address}>
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

      {/* Swap Direction Indicator */}
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
            value={buyToken}
            onChange={(e) => setBuyToken(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Token</option>
            {tokens.map(token => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
          <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 text-lg text-gray-900">
            {quote ? ethers.formatUnits(quote.buyAmount, getTokenDecimals(buyToken)) : '0.0'}
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
                <span className="font-medium">1 {tokens.find(t => t.address === sellToken)?.symbol} = {(parseFloat(ethers.formatUnits(quote.buyAmount, getTokenDecimals(buyToken))) / parseFloat(sellAmount)).toFixed(6)} {tokens.find(t => t.address === buyToken)?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (0.2%):</span>
                <span className="font-medium">{(parseFloat(ethers.formatUnits(quote.buyAmount, getTokenDecimals(buyToken))) * 0.002).toFixed(6)} {tokens.find(t => t.address === buyToken)?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gas (estimated):</span>
                <span className="font-medium">{quote.estimatedGas || 'N/A'}</span>
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

      {/* Error Message */}
      {error && (
        <div data-testid="error-message" className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          data-testid="get-quote-button"
          onClick={fetchQuote}
          disabled={loading || !sellToken || !buyToken || !sellAmount}
          className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Fetching Quote...
            </>
          ) : (
            'Get Quote'
          )}
        </Button>

        {quote && (
          <Button
            data-testid="execute-swap-button"
            onClick={executeSwap}
            disabled={swapping}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            {swapping ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Swapping...
              </>
            ) : (
              'Confirm Swap'
            )}
          </Button>
        )}
      </div>

      {/* Security Notice */}
      <div className="text-xs text-center text-gray-500 mt-4">
        Always verify transaction details in your wallet before signing
      </div>
    </div>
  );
};

export default SwapForm;