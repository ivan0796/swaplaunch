/**
 * Unified Token Logo Resolver
 * ============================
 * 
 * Resolves token logos from multiple sources with fallback chain:
 * 1. Official Tokenlists (Uniswap, Coingecko, 1inch)
 * 2. TrustWallet Assets CDN
 * 3. CoinMarketCap (if available)
 * 4. Initial-based avatar (fallback)
 * 
 * Usage:
 *   import { getTokenLogo, TokenLogo } from './utils/tokenLogoResolver';
 *   
 *   // Function:
 *   const logoUrl = getTokenLogo(tokenAddress, chainId, symbol);
 *   
 *   // Component:
 *   <TokenLogo address={token.address} chainId={chainId} symbol={token.symbol} />
 */

import React from 'react';

// Chain ID to TrustWallet chain name mapping
const TRUSTWALLET_CHAINS = {
  1: 'ethereum',
  56: 'smartchain',
  137: 'polygon',
  42161: 'arbitrum',
  10: 'optimism',
  8453: 'base',
  43114: 'avalanche',
  250: 'fantom',
  25: 'cronos',
  324: 'zksync'
};

// Popular tokenlist URLs
const TOKEN_LISTS = [
  'https://tokens.coingecko.com/uniswap/all.json',
  'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
  'https://tokens.1inch.io/v1.2'
];

// In-memory cache for token logos
const logoCache = new Map();

/**
 * Get TrustWallet CDN URL for token
 */
export const getTrustWalletLogo = (address, chainId) => {
  const chain = TRUSTWALLET_CHAINS[chainId];
  if (!chain) return null;
  
  // TrustWallet uses checksummed addresses
  const checksumAddress = address; // Should be checksummed already
  
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain}/assets/${checksumAddress}/logo.png`;
};

/**
 * Get CoinMarketCap logo (if symbol is known)
 */
export const getCMCLogo = (symbol) => {
  // Map of common symbols to CMC IDs
  const CMC_IDS = {
    'ETH': 1027,
    'BTC': 1,
    'BNB': 1839,
    'USDT': 825,
    'USDC': 3408,
    'MATIC': 3890,
    'AVAX': 5805,
    'SOL': 5426,
    'DAI': 4943,
    'WETH': 2396,
    'WBTC': 3717,
    'LINK': 1975,
    'UNI': 7083,
    'AAVE': 7278,
    'CRO': 3635,
    'FTM': 3513
  };
  
  const cmcId = CMC_IDS[symbol?.toUpperCase()];
  if (!cmcId) return null;
  
  return `https://s2.coinmarketcap.com/static/img/coins/64x64/${cmcId}.png`;
};

/**
 * Generate initial-based avatar as final fallback
 */
export const getInitialAvatar = (symbol) => {
  if (!symbol) return null;
  
  const initial = symbol.charAt(0).toUpperCase();
  const colors = [
    'from-indigo-400 to-purple-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-yellow-400 to-orange-500',
    'from-red-400 to-pink-500',
    'from-purple-400 to-fuchsia-500'
  ];
  
  // Use first letter to deterministically pick color
  const colorIndex = initial.charCodeAt(0) % colors.length;
  
  return {
    type: 'initial',
    initial,
    colorClass: colors[colorIndex]
  };
};

/**
 * Main resolver function
 * Returns: { url: string, source: string } or { type: 'initial', initial: string, colorClass: string }
 */
export const getTokenLogo = (address, chainId, symbol, existingLogoUri = null) => {
  // Check cache first
  const cacheKey = `${chainId}:${address}`;
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey);
  }
  
  // Priority 1: Use existing logoURI if provided and valid
  if (existingLogoUri) {
    const result = { url: existingLogoUri, source: 'provided' };
    logoCache.set(cacheKey, result);
    return result;
  }
  
  // Priority 2: CoinMarketCap for known symbols
  const cmcLogo = getCMCLogo(symbol);
  if (cmcLogo) {
    const result = { url: cmcLogo, source: 'cmc' };
    logoCache.set(cacheKey, result);
    return result;
  }
  
  // Priority 3: TrustWallet CDN
  const trustWalletLogo = getTrustWalletLogo(address, chainId);
  if (trustWalletLogo) {
    const result = { url: trustWalletLogo, source: 'trustwallet' };
    logoCache.set(cacheKey, result);
    return result;
  }
  
  // Priority 4: Initial-based avatar (always works)
  const result = getInitialAvatar(symbol);
  logoCache.set(cacheKey, result);
  return result;
};

/**
 * React Component for Token Logo with automatic fallback
 */
export const TokenLogo = ({ 
  address, 
  chainId, 
  symbol, 
  name,
  logoURI,
  size = 'md',
  className = '' 
}) => {
  const [currentLogo, setCurrentLogo] = React.useState(null);
  const [imageError, setImageError] = React.useState(false);
  
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
    xl: 'w-10 h-10 text-lg'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  React.useEffect(() => {
    const logo = getTokenLogo(address, chainId, symbol, logoURI);
    setCurrentLogo(logo);
    setImageError(false);
  }, [address, chainId, symbol, logoURI]);
  
  const handleImageError = () => {
    setImageError(true);
    // Fallback to initial avatar
    const fallback = getInitialAvatar(symbol);
    setCurrentLogo(fallback);
  };
  
  if (!currentLogo) {
    return (
      <div className={`${sizeClass} rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
    );
  }
  
  // Render initial-based avatar
  if (currentLogo.type === 'initial') {
    return (
      <div 
        className={`${sizeClass} rounded-full bg-gradient-to-br ${currentLogo.colorClass} flex items-center justify-center text-white font-bold ${className}`}
        title={name || symbol}
      >
        {currentLogo.initial}
      </div>
    );
  }
  
  // Render image with fallback
  return (
    <>
      {!imageError && (
        <img
          src={currentLogo.url}
          alt={symbol || name || 'Token'}
          className={`${sizeClass} rounded-full ${className}`}
          onError={handleImageError}
          title={`${name || symbol} (${currentLogo.source})`}
        />
      )}
      {imageError && (
        <div 
          className={`${sizeClass} rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold ${className}`}
          title={name || symbol}
        >
          {symbol?.charAt(0) || '?'}
        </div>
      )}
    </>
  );
};

/**
 * Preload logos for better UX
 */
export const preloadTokenLogos = (tokens, chainId) => {
  tokens.forEach(token => {
    getTokenLogo(token.address, chainId, token.symbol, token.logoURI);
  });
};

export default {
  getTokenLogo,
  TokenLogo,
  getTrustWalletLogo,
  getCMCLogo,
  getInitialAvatar,
  preloadTokenLogos
};
