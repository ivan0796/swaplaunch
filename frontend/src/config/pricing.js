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
 * Berechne Total Launch Cost
 * @param {string} chain - blockchain name
 * @param {number} gasPrice - in Gwei
 * @param {boolean} withBoost - Feature Boost inkludieren?
 * @returns {object} - breakdown of costs
 */
export const calculateLaunchCost = (chain = 'ethereum', gasPrice = 30, withBoost = false) => {
  let fixedFee = 0;
  let nativeCurrency = 'ETH';
  
  switch(chain.toLowerCase()) {
    case 'ethereum':
      fixedFee = PRICING.launchFixedFeeEth;
      nativeCurrency = 'ETH';
      break;
    case 'bsc':
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
    default:
      fixedFee = PRICING.launchFixedFeeEth;
  }
  
  // Gas cost estimate (nur EVM chains)
  const totalGas = PRICING.gasEstimates.tokenDeploy + 
                   PRICING.gasEstimates.addLiquidity + 
                   PRICING.gasEstimates.lockLiquidity;
  const gasCostEth = chain !== 'solana' ? (totalGas * gasPrice) / 1e9 : 0;
  
  const serviceFee = fixedFee * (PRICING.serviceFeeBps / 10000);
  const boostCost = withBoost ? PRICING.featureBoostEUR : 0;
  
  return {
    fixedFee,
    nativeCurrency,
    gasCost: gasCostEth,
    serviceFee,
    boostCost,
    total: fixedFee + gasCostEth + serviceFee + (withBoost ? boostCost / 100 : 0), // rough EUR conversion
    breakdown: {
      'Launch Fee': `${fixedFee} ${nativeCurrency}`,
      'Gas (estimated)': chain !== 'solana' ? `${gasCostEth.toFixed(4)} ${nativeCurrency}` : 'Included',
      'Service Fee': `${serviceFee.toFixed(4)} ${nativeCurrency}`,
      ...(withBoost && { 'Feature Boost': `€${boostCost}` })
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
