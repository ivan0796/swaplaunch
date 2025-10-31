// Token List Aggregator
import axios from 'axios';

const TOKEN_LISTS = {
  uniswap: 'https://tokens.uniswap.org',
  pancakeswap: 'https://tokens.pancakeswap.finance/pancakeswap-extended.json',
  coingecko: 'https://tokens.coingecko.com/uniswap/all.json'
};

let cachedTokens = null;

/**
 * Load and merge token lists from multiple sources
 */
export const loadTokenLists = async () => {
  if (cachedTokens) return cachedTokens;

  try {
    const lists = await Promise.allSettled([
      axios.get(TOKEN_LISTS.pancakeswap),
      axios.get(TOKEN_LISTS.coingecko)
    ]);

    const allTokens = [];
    const seenAddresses = new Set();

    lists.forEach(result => {
      if (result.status === 'fulfilled' && result.value.data.tokens) {
        result.value.data.tokens.forEach(token => {
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
      }
    });

    cachedTokens = allTokens;
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