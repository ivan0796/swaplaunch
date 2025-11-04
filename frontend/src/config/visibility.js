/**
 * Visibility & Deep Links Configuration
 * For pump.fun auto-visibility to Raydium/Dexscreener/Axiom
 */

export const VISIBILITY = {
  usePumpFunByDefault: true,
  showLinksOnSuccess: true,
  
  deepLinks: {
    dexScreenerToken: (mint) => `https://dexscreener.com/solana/${mint}`,
    dexScreenerPair: (pair) => `https://dexscreener.com/solana/${pair}`,
    raydiumPool: (pair) => `https://raydium.io/swap/?inputMint=sol&outputMint=${pair}`,
    raydiumAddLiquidity: (mint) => `https://raydium.io/liquidity/add/?mode=add&pool_id=${mint}`,
    axiomPulseMint: (mint) => `https://axiom.trade/pulse/${mint}`,
    pumpFunToken: (mint) => `https://pump.fun/${mint}`
  }
};
