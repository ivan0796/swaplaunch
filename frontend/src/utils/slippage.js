// Slippage Calculator

export const calculateAutoSlippage = (priceImpact) => {
  const impact = parseFloat(priceImpact) || 0;
  
  if (impact < 1) {
    return { slippage: 0.5, warning: null };
  } else if (impact >= 1 && impact < 5) {
    return { slippage: 2.0, warning: 'Medium price impact' };
  } else {
    return {
      slippage: 5.0,
      warning: 'High price impact! Consider reducing swap amount.'
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