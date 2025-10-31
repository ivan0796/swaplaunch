// Popular tokens with CoinGecko IDs for logo fetching
export const POPULAR_TOKENS = {
  1: [ // Ethereum
    { symbol: 'ETH', name: 'Ethereum', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, coingeckoId: 'ethereum' },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18, coingeckoId: 'weth' },
    { symbol: 'USDT', name: 'Tether USD', address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6, coingeckoId: 'tether' },
    { symbol: 'USDC', name: 'USD Coin', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6, coingeckoId: 'usd-coin' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', decimals: 8, coingeckoId: 'wrapped-bitcoin' },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6b175474e89094c44da98b954eedeac495271d0f', decimals: 18, coingeckoId: 'dai' },
    { symbol: 'LINK', name: 'Chainlink', address: '0x514910771af9ca656af840dff83e8264ecf986ca', decimals: 18, coingeckoId: 'chainlink' },
    { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: 18, coingeckoId: 'uniswap' },
  ],
  56: [ // BSC
    { symbol: 'BNB', name: 'BNB', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, coingeckoId: 'binancecoin' },
    { symbol: 'WBNB', name: 'Wrapped BNB', address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', decimals: 18, coingeckoId: 'wbnb' },
    { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059ff775485246999027b3197955', decimals: 18, coingeckoId: 'tether' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18, coingeckoId: 'usd-coin' },
    { symbol: 'BTCB', name: 'Bitcoin BEP2', address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', decimals: 18, coingeckoId: 'binance-bitcoin' },
    { symbol: 'ETH', name: 'Ethereum Token', address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8', decimals: 18, coingeckoId: 'ethereum' },
    { symbol: 'CAKE', name: 'PancakeSwap', address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', decimals: 18, coingeckoId: 'pancakeswap-token' },
    { symbol: 'XRP', name: 'XRP', address: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe', decimals: 18, coingeckoId: 'ripple' },
  ],
  137: [ // Polygon
    { symbol: 'MATIC', name: 'Polygon', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, coingeckoId: 'matic-network' },
    { symbol: 'WMATIC', name: 'Wrapped Matic', address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', decimals: 18, coingeckoId: 'wmatic' },
    { symbol: 'USDT', name: 'Tether USD', address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', decimals: 6, coingeckoId: 'tether' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', decimals: 6, coingeckoId: 'usd-coin' },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', decimals: 18, coingeckoId: 'weth' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', decimals: 8, coingeckoId: 'wrapped-bitcoin' },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', decimals: 18, coingeckoId: 'dai' },
    { symbol: 'LINK', name: 'Chainlink', address: '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', decimals: 18, coingeckoId: 'chainlink' },
  ],
  0: [ // Solana
    { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', decimals: 9, coingeckoId: 'solana' },
    { symbol: 'USDT', name: 'Tether USD', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, coingeckoId: 'tether' },
    { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, coingeckoId: 'usd-coin' },
    { symbol: 'RAY', name: 'Raydium', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6, coingeckoId: 'raydium' },
    { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, coingeckoId: 'bonk' },
    { symbol: 'JTO', name: 'Jito', mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL', decimals: 9, coingeckoId: 'jito-governance-token' },
    { symbol: 'WIF', name: 'dogwifhat', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6, coingeckoId: 'dogwifcoin' },
    { symbol: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6, coingeckoId: 'jupiter-exchange-solana' },
  ]
};

// Fetch logo from CoinGecko or fallback to TrustWallet
export const getTokenLogo = (address, chainId, coingeckoId) => {
  // Try CoinGecko first if we have the ID
  if (coingeckoId) {
    // Use proper CoinGecko API endpoint for token images
    return `https://assets.coingecko.com/coins/images/${coingeckoId}/large/logo.png`;
  }
  
  // Fallback to TrustWallet assets
  if (!address || address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    // Native tokens
    const nativeLogos = {
      1: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      56: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      137: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png'
    };
    return nativeLogos[chainId];
  }
  
  // EVM tokens from TrustWallet
  const chainMap = {
    1: 'ethereum',
    56: 'smartchain',
    137: 'polygon'
  };
  
  const chain = chainMap[chainId];
  if (chain && address.startsWith('0x')) {
    const checksumAddress = address; // Should ideally checksum
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain}/assets/${checksumAddress}/logo.png`;
  }
  
  return null;
};

// Add logos to popular tokens
export const getPopularTokens = (chainId) => {
  const tokens = POPULAR_TOKENS[chainId] || [];
  return tokens.map(token => ({
    ...token,
    logoURI: getTokenLogo(token.address || token.mint, chainId, token.coingeckoId)
  }));
};
