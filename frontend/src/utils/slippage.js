// Intelligent Slippage Calculator

// Definiere Token-Kategorien basierend auf Symbol
const TOKEN_CATEGORIES = {
  stablecoins: ['USDT', 'USDC', 'DAI', 'BUSD', 'USDD', 'FRAX', 'TUSD', 'USDP', 'GUSD', 'FDUSD'],
  majorTokens: ['ETH', 'WETH', 'BTC', 'WBTC', 'BNB', 'WBNB', 'MATIC', 'WMATIC', 'SOL', 'WSOL'],
  bluechips: ['UNI', 'AAVE', 'LINK', 'SUSHI', 'CAKE', 'CRV', 'MKR', 'COMP', 'SNX', 'YFI'],
};

// Prüfe Token-Kategorie
export const getTokenCategory = (tokenSymbol) => {
  const symbol = tokenSymbol?.toUpperCase();
  
  if (TOKEN_CATEGORIES.stablecoins.includes(symbol)) {
    return 'stablecoin';
  }
  if (TOKEN_CATEGORIES.majorTokens.includes(symbol)) {
    return 'major';
  }
  if (TOKEN_CATEGORIES.bluechips.includes(symbol)) {
    return 'bluechip';
  }
  
  return 'unknown';
};

// Intelligente Auto-Slippage basierend auf Token-Typ UND Price Impact
export const calculateAutoSlippage = (priceImpact, sellTokenSymbol, buyTokenSymbol) => {
  const impact = parseFloat(priceImpact) || 0;
  const sellCategory = getTokenCategory(sellTokenSymbol);
  const buyCategory = getTokenCategory(buyTokenSymbol);
  
  // Beide Tokens sind Stablecoins
  if (sellCategory === 'stablecoin' && buyCategory === 'stablecoin') {
    return { 
      slippage: 0.1, 
      warning: null,
      reason: 'Stablecoin pair'
    };
  }
  
  // Mindestens ein Major/Bluechip Token
  const isMajorPair = ['major', 'bluechip', 'stablecoin'].includes(sellCategory) && 
                      ['major', 'bluechip', 'stablecoin'].includes(buyCategory);
  
  if (isMajorPair) {
    if (impact < 0.5) {
      return { slippage: 0.3, warning: null, reason: 'Major token pair, low impact' };
    } else if (impact < 1) {
      return { slippage: 0.5, warning: null, reason: 'Major token pair, normal impact' };
    } else if (impact < 3) {
      return { slippage: 1.0, warning: 'Price impact > 1%', reason: 'Major token pair, medium impact' };
    } else {
      return { slippage: 2.0, warning: '⚠️ High price impact. Consider smaller amount.', reason: 'Major token pair, high impact' };
    }
  }
  
  // Unbekannte Tokens (potenziell Low-Cap oder Meme)
  if (impact < 1) {
    return { slippage: 1.0, warning: null, reason: 'Standard pair, low impact' };
  } else if (impact < 3) {
    return { slippage: 2.0, warning: 'Medium price impact', reason: 'Standard pair, medium impact' };
  } else if (impact < 10) {
    return { slippage: 3.0, warning: '⚠️ High price impact. Verify token liquidity.', reason: 'Standard pair, high impact' };
  } else {
    return { 
      slippage: 5.0, 
      warning: '⚠️ Very high price impact! Token may have low liquidity. Proceed with caution.', 
      reason: 'Low liquidity or high impact'
    };
  }
};

export const formatSlippage = (slippage) => {
  return `${slippage.toFixed(1)}%`;
};

export const calculatePriceImpact = (inputAmount, outputAmount, inputPrice, outputPrice) => {
  try {
    if (!inputAmount || !outputAmount || !inputPrice || !outputPrice) return 0;
    
    const inputValue = parseFloat(inputAmount) * parseFloat(inputPrice);
    const outputValue = parseFloat(outputAmount) * parseFloat(outputPrice);
    
    if (inputValue === 0) return 0;
    
    const impact = ((inputValue - outputValue) / inputValue) * 100;
    return Math.abs(impact);
  } catch (error) {
    console.error('Error calculating price impact:', error);
    return 0;
  }
};

// Prüfe ob Slippage Warning angezeigt werden soll
export const shouldShowSlippageWarning = (slippage, sellTokenSymbol, buyTokenSymbol) => {
  const sellCategory = getTokenCategory(sellTokenSymbol);
  const buyCategory = getTokenCategory(buyTokenSymbol);
  
  // Keine Warnings für renommierte Coins bei normaler Slippage
  const isMajorPair = ['major', 'bluechip', 'stablecoin'].includes(sellCategory) && 
                      ['major', 'bluechip', 'stablecoin'].includes(buyCategory);
  
  if (isMajorPair && slippage <= 1.0) {
    return false; // Keine Warning
  }
  
  // Warning bei hoher Slippage (>2%)
  return slippage > 2.0;
};