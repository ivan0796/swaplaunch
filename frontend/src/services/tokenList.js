// Token List Aggregator
import axios from 'axios';

const TOKEN_LISTS = {
  uniswap: 'https://tokens.uniswap.org',
  pancakeswap: 'https://tokens.pancakeswap.finance/pancakeswap-extended.json',
  sushiswap: 'https://token-list.sushi.com',
  coingecko: 'https://tokens.coingecko.com/uniswap/all.json',
  quickswap: 'https://unpkg.com/quickswap-default-token-list@1.2.25/build/quickswap-default.tokenlist.json',
  // 1inch token list
  oneinch_eth: 'https://tokens.1inch.io/v1.1/1',
  oneinch_bsc: 'https://tokens.1inch.io/v1.1/56',
  oneinch_polygon: 'https://tokens.1inch.io/v1.1/137'
};

let cachedTokens = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load and merge token lists from multiple sources
 */
export const loadTokenLists = async () => {
  // Return cached tokens if still valid
  if (cachedTokens && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return cachedTokens;
  }

  try {
    const lists = await Promise.allSettled([
      axios.get(TOKEN_LISTS.pancakeswap),
      axios.get(TOKEN_LISTS.sushiswap),
      axios.get(TOKEN_LISTS.coingecko),
      axios.get(TOKEN_LISTS.quickswap),
      axios.get(TOKEN_LISTS.oneinch_eth),
      axios.get(TOKEN_LISTS.oneinch_bsc),
      axios.get(TOKEN_LISTS.oneinch_polygon)
    ]);

    const allTokens = [];
    const seenAddresses = new Set();

    lists.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        let tokens = [];
        
        // Handle different response formats
        if (result.value.data.tokens) {
          // Standard token list format (Uniswap, PancakeSwap, etc.)
          tokens = result.value.data.tokens;
        } else if (Array.isArray(result.value.data)) {
          // 1inch format - returns array directly
          tokens = result.value.data;
        } else if (typeof result.value.data === 'object') {
          // Handle object format from 1inch (key-value pairs)
          tokens = Object.values(result.value.data);
        }

        tokens.forEach(token => {
          // Ensure token has required fields
          if (!token.address || !token.symbol || !token.chainId) return;
          
          const key = `${token.chainId}-${token.address.toLowerCase()}`;
          if (!seenAddresses.has(key)) {
            seenAddresses.add(key);
            allTokens.push({
              name: token.name || token.symbol,
              symbol: token.symbol,
              address: token.address.toLowerCase(),
              decimals: token.decimals || 18,
              chainId: token.chainId,
              logoURI: token.logoURI || token.logoUri || null,
              searchKey: `${token.name || token.symbol} ${token.symbol} ${token.address}`.toLowerCase()
            });
          }
        });
      }
    });

    // Add popular/common tokens that might be missing
    const commonTokens = [
      // Ethereum
      { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, chainId: 1, name: 'Ethereum' },
      { symbol: 'WETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18, chainId: 1, name: 'Wrapped Ether' },
      // BSC
      { symbol: 'BNB', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, chainId: 56, name: 'BNB' },
      { symbol: 'WBNB', address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', decimals: 18, chainId: 56, name: 'Wrapped BNB' },
      // Polygon
      { symbol: 'MATIC', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, chainId: 137, name: 'Polygon' },
      { symbol: 'WMATIC', address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', decimals: 18, chainId: 137, name: 'Wrapped Matic' }
    ];

    commonTokens.forEach(token => {
      const key = `${token.chainId}-${token.address.toLowerCase()}`;
      if (!seenAddresses.has(key)) {
        seenAddresses.add(key);
        allTokens.push({
          ...token,
          address: token.address.toLowerCase(),
          searchKey: `${token.name} ${token.symbol} ${token.address}`.toLowerCase()
        });
      }
    });

    cachedTokens = allTokens;
    cacheTimestamp = Date.now();
    console.log(`Loaded ${allTokens.length} tokens from ${lists.length} sources`);
    return allTokens;
  } catch (error) {
    console.error('Error loading token lists:', error);
    return [];
  }
};

/**
 * Search tokens by name, symbol, or address
 */
export const searchTokens = async (query, chainId = null) => {
  const tokens = await loadTokenLists();
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) return [];

  let filtered = tokens.filter(token => {
    // Filter by chain if specified
    if (chainId && token.chainId !== chainId) return false;
    
    // Search in name, symbol, or address
    return (
      token.name.toLowerCase().includes(searchTerm) ||
      token.symbol.toLowerCase().includes(searchTerm) ||
      token.address.toLowerCase().includes(searchTerm)
    );
  });

  // Sort by relevance
  filtered.sort((a, b) => {
    // Exact symbol match first
    if (a.symbol.toLowerCase() === searchTerm) return -1;
    if (b.symbol.toLowerCase() === searchTerm) return 1;
    
    // Then symbol starts with
    if (a.symbol.toLowerCase().startsWith(searchTerm)) return -1;
    if (b.symbol.toLowerCase().startsWith(searchTerm)) return 1;
    
    // Then name starts with
    if (a.name.toLowerCase().startsWith(searchTerm)) return -1;
    if (b.name.toLowerCase().startsWith(searchTerm)) return 1;
    
    return 0;
  });

  return filtered.slice(0, 50); // Return top 50 results
};

/**
 * Get token by address
 */
export const getTokenByAddress = async (address, chainId) => {
  const tokens = await loadTokenLists();
  return tokens.find(
    token => 
      token.address.toLowerCase() === address.toLowerCase() &&
      token.chainId === chainId
  );
};

/**
 * Validate if address is a valid Ethereum address
 */
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};