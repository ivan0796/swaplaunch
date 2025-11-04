/**
 * Pricing Configuration für SwapLaunch
 * Zentrale Stelle für alle Gebühren und Preise
 */

export const PRICING = {
  // Launch Fees
  launchFixedFeeEth: 0.03,          // Fixed fee in ETH für Token Launch
  launchFixedFeeBsc: 0.1,            // Fixed fee in BNB für BSC
  launchFixedFeePolygon: 50,         // Fixed fee in MATIC für Polygon
  launchFixedFeeSolana: 0.5,         // Fixed fee in SOL für Solana
  
  // Service Fees (Dynamic)
  serviceFeeBps: 25,                  // 0.25% für Swaps/Launch (Basis Points: 25 = 0.25%)
  
  // Feature Boost / Promoted Slots
  featureBoostEUR: 50,                // 7 Tage Trending + Social Mention
  featureBoostDays: 7,
  
  // Advertise Packages
  trendingBoost7d: 50,                // EUR
  socialMentionPrice: 'Auf Anfrage',
  featuredBannerPrice: 'Auf Anfrage',
  
  // Display Options
  showFees: true,                     // Gebühren transparent anzeigen
  showGasEstimate: true,              // Gas-Schätzung zeigen
  
  // Gas Estimates (in Gwei, approximate)
  gasEstimates: {
    tokenDeploy: 2000000,             // ~2M gas für Token Deploy
    addLiquidity: 150000,             // ~150k gas für Add Liquidity
    lockLiquidity: 100000,            // ~100k gas für Lock
  }
};

/**
 * Approximate EUR to Crypto conversion rates (static, for display purposes)
 */
const EUR_CONVERSION_RATES = {
  'ETH': 0.016,      // ~€3000 per ETH
  'BNB': 0.10,       // ~€500 per BNB
  'MATIC': 80,       // ~€0.60 per MATIC
  'SOL': 0.30,       // ~€170 per SOL
  'AVAX': 1.5        // ~€33 per AVAX
};

/**
 * Berechne Total Launch Cost
 * @param {string} chain - blockchain name
 * @param {number} gasPrice - in Gwei
 * @param {boolean} withBoost - Feature Boost inkludieren?
 * @returns {object} - breakdown of costs
 */
export const calculateLaunchCost = (chain = 'ethereum', gasPrice = 30, withBoost = false) => {
  let fixedFee = 0;
  let nativeCurrency = 'ETH';
  
  const chainNormalized = chain.toLowerCase().replace(/\s+/g, '');
  
  switch(chainNormalized) {
    case 'ethereum':
      fixedFee = PRICING.launchFixedFeeEth;
      nativeCurrency = 'ETH';
      break;
    case 'bnbchain':
    case 'bsc':
    case 'binance':
      fixedFee = PRICING.launchFixedFeeBsc;
      nativeCurrency = 'BNB';
      break;
    case 'polygon':
      fixedFee = PRICING.launchFixedFeePolygon;
      nativeCurrency = 'MATIC';
      break;
    case 'solana':
      fixedFee = PRICING.launchFixedFeeSolana;
      nativeCurrency = 'SOL';
      break;
    case 'arbitrum':
      fixedFee = PRICING.launchFixedFeeEth;
      nativeCurrency = 'ETH';
      break;
    case 'base':
      fixedFee = PRICING.launchFixedFeeEth;
      nativeCurrency = 'ETH';
      break;
    case 'avalanche':
      fixedFee = 0.5;
      nativeCurrency = 'AVAX';
      break;
    default:
      fixedFee = PRICING.launchFixedFeeEth;
      nativeCurrency = 'ETH';
  }
  
  // Gas cost estimate (nur EVM chains)
  const totalGas = PRICING.gasEstimates.tokenDeploy + 
                   PRICING.gasEstimates.addLiquidity + 
                   PRICING.gasEstimates.lockLiquidity;
  const gasCostNative = chainNormalized !== 'solana' ? (totalGas * gasPrice) / 1e9 : 0;
  
  const serviceFee = fixedFee * (PRICING.serviceFeeBps / 10000);
  
  // Convert Feature Boost from EUR to native currency
  const boostCostEUR = withBoost ? PRICING.featureBoostEUR : 0;
  const conversionRate = EUR_CONVERSION_RATES[nativeCurrency] || EUR_CONVERSION_RATES['ETH'];
  const boostCostNative = withBoost ? boostCostEUR * conversionRate : 0;
  
  const total = fixedFee + gasCostNative + serviceFee + boostCostNative;
  
  return {
    fixedFee,
    nativeCurrency,
    gasCost: gasCostNative,
    serviceFee,
    boostCost: boostCostEUR,
    boostCostNative,
    total,
    breakdown: {
      'Launch Fee': `${fixedFee} ${nativeCurrency}`,
      'Gas (estimated)': chainNormalized !== 'solana' ? `${gasCostNative.toFixed(4)} ${nativeCurrency}` : 'Included',
      'Service Fee': `${serviceFee.toFixed(4)} ${nativeCurrency}`,
      ...(withBoost && { 'Feature Boost': `${boostCostNative.toFixed(4)} ${nativeCurrency} (€${boostCostEUR})` })
    }
  };
};

/**
 * Format Preis für Display
 */
export const formatPrice = (amount, currency = 'EUR') => {
  if (typeof amount === 'string') return amount;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency === 'EUR' ? 2 : 4
  }).format(amount);
};
