// CoinGecko API Service
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Token ID mapping for CoinGecko
const TOKEN_COINGECKO_IDS = {
  // Ethereum
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'ethereum',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usd-coin',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether',
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'dai',
  // BSC
  '0x55d398326f99059ff775485246999027b3197955': 'tether',
  '0xe9e7cea3dedca5984780bafc599bd69add087d56': 'binance-usd',
  // Polygon
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 'usd-coin',
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 'tether',
  // Solana
  'So11111111111111111111111111111111111111112': 'solana',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'usd-coin',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'tether',
};

export const getCoinGeckoId = (tokenAddress) => {
  return TOKEN_COINGECKO_IDS[tokenAddress?.toLowerCase()] || null;
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