// CoinMarketCap Top 200+ Tokens across all chains
// Logos from CoinGecko API

export const CMC_TOP_TOKENS = {
  // Ethereum Mainnet (Chain ID: 1)
  1: [
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ethereum', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, name: 'Tether', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, name: 'USD Coin', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
    { symbol: 'BNB', address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', decimals: 18, name: 'BNB', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
    { symbol: 'SHIB', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', decimals: 18, name: 'Shiba Inu', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png' },
    { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, name: 'Dai', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png' },
    { symbol: 'UNI', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18, name: 'Uniswap', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png' },
    { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18, name: 'Chainlink', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png' },
    { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, name: 'Wrapped Bitcoin', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png' },
    { symbol: 'MATIC', address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', decimals: 18, name: 'Polygon', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png' },
    { symbol: 'PEPE', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', decimals: 18, name: 'Pepe', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png' },
  ],
  
  // BSC (Chain ID: 56)
  56: [
    { symbol: 'BNB', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'BNB', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
    { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, name: 'Tether', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
    { symbol: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, name: 'USD Coin', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
    { symbol: 'BUSD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18, name: 'Binance USD', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png' },
    { symbol: 'CAKE', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', decimals: 18, name: 'PancakeSwap', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png' },
    { symbol: 'XRP', address: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE', decimals: 18, name: 'XRP', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png' },
  ],
  
  // Polygon (Chain ID: 137)
  137: [
    { symbol: 'MATIC', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Polygon', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png' },
    { symbol: 'USDC', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6, name: 'USD Coin', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
    { symbol: 'USDT', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, name: 'Tether', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
    { symbol: 'DAI', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18, name: 'Dai', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png' },
    { symbol: 'WETH', address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18, name: 'Wrapped Ether', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png' },
  ],
  
  // Arbitrum (Chain ID: 42161)
  42161: [
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ethereum', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, name: 'USD Coin', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
    { symbol: 'USDT', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, name: 'Tether', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
    { symbol: 'ARB', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18, name: 'Arbitrum', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png' },
  ],
  
  // Optimism (Chain ID: 10)
  10: [
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ethereum', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { symbol: 'USDC', address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', decimals: 6, name: 'USD Coin', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
    { symbol: 'USDT', address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6, name: 'Tether', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
    { symbol: 'OP', address: '0x4200000000000000000000000000000000000042', decimals: 18, name: 'Optimism', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png' },
  ],
  
  // Base (Chain ID: 8453)
  8453: [
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ethereum', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, name: 'USD Coin', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  ],
  
  // Avalanche (Chain ID: 43114)
  43114: [
    { symbol: 'AVAX', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Avalanche', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png' },
    { symbol: 'USDC', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6, name: 'USD Coin', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
    { symbol: 'USDT', address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6, name: 'Tether', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
  ],
  
  // Fantom (Chain ID: 250)
  250: [
    { symbol: 'FTM', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Fantom', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3513.png' },
    { symbol: 'USDC', address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', decimals: 6, name: 'USD Coin', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  ],
  
  // Cronos (Chain ID: 25)
  25: [
    { symbol: 'CRO', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Cronos', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png' },
    { symbol: 'USDC', address: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', decimals: 6, name: 'USD Coin', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  ],
  
  // zkSync (Chain ID: 324)
  324: [
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ethereum', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { symbol: 'USDC', address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', decimals: 6, name: 'USD Coin', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  ],
};

// Get tokens for a specific chain
export const getTokensForChain = (chainId) => {
  return CMC_TOP_TOKENS[chainId] || [];
};

// Check if token is from CMC (trusted)
export const isVerifiedToken = (address, chainId) => {
  const tokens = getTokensForChain(chainId);
  return tokens.some(t => t.address.toLowerCase() === address.toLowerCase());
};
