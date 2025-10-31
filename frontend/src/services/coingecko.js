// CoinGecko API Service
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Token ID mapping for CoinGecko
const TOKEN_COINGECKO_IDS = {
  // Ethereum
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'ethereum',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'weth',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usd-coin',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether',
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'dai',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'wrapped-bitcoin',
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'chainlink',
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'uniswap',
  // BSC
  '0x55d398326f99059ff775485246999027b3197955': 'tether',
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': 'usd-coin',
  '0xe9e7cea3dedca5984780bafc599bd69add087d56': 'binance-usd',
  '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c': 'binance-bitcoin',
  '0x2170ed0880ac9a755fd29b2688956bd959f933f8': 'ethereum',
  '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82': 'pancakeswap-token',
  '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe': 'ripple',
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': 'wbnb',
  // Polygon - CRITICAL: Native MATIC
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'matic-network', // Falls Polygon Chain
  '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': 'wmatic',
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 'usd-coin',
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 'tether',
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': 'weth',
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6': 'wrapped-bitcoin',
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': 'dai',
  '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39': 'chainlink',
  // Solana
  'So11111111111111111111111111111111111111112': 'solana',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'usd-coin',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'tether',
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'raydium',
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'bonk',
  'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL': 'jito-governance-token',
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': 'dogwifcoin',
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'jupiter-exchange-solana',
};

// Chain-aware CoinGecko ID resolution
export const getCoinGeckoId = (tokenAddress, chainId) => {
  const addr = tokenAddress?.toLowerCase();
  
  // Special case: 0xeeee... native token depends on chain
  if (addr === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    switch (chainId) {
      case 1: return 'ethereum';
      case 56: return 'binancecoin';
      case 137: return 'matic-network';
      default: return 'ethereum';
    }
  }
  
  return TOKEN_COINGECKO_IDS[addr] || null;
};

export const getTrendingTokens = async () => {
  try {
    const response = await axios.get(`${API}/coingecko/trending`);
    return response.data.coins || [];
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    return [];
  }
};

export const getTokenPrice = async (coinId) => {
  try {
    const response = await axios.get(`${API}/coingecko/price/${coinId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
};

export const formatPriceChange = (change) => {
  if (!change) return '0.00';
  const formatted = Math.abs(change).toFixed(2);
  return change >= 0 ? `+${formatted}` : `-${formatted}`;
};

export const getPriceChangeColor = (change) => {
  if (!change) return 'text-gray-500';
  return change >= 0 ? 'text-green-600' : 'text-red-600';
};