/**
 * Vendor-agnostic Analytics Tracking
 * Unterstützt: Umami, Plausible, oder Console Fallback
 */

/**
 * Track Event
 * @param {string} name - Event name (e.g., 'wallet_connected')
 * @param {object} props - Event properties
 */
export const track = (name, props = {}) => {
  try {
    // Umami Analytics
    if (typeof window !== 'undefined' && window.umami?.track) {
      window.umami.track(name, props);
    }
    
    // Plausible Analytics
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible(name, { props });
    }
    
    // Console fallback for development
    if (process.env.NODE_ENV === 'development') {
      console.info('[analytics:track]', name, props);
    }
  } catch (e) {
    // Silent fail - analytics should never break the app
    console.warn('Analytics tracking failed:', e);
  }
};

/**
 * Track Page View
 * @param {string} path - Page path
 */
export const trackPageView = (path) => {
  track('pageview', { path });
};

/**
 * Predefined Event Tracking Functions
 */
export const analytics = {
  // Wallet Events
  walletConnected: (address, chain) => track('wallet_connected', { address: address?.slice(0, 6), chain }),
  walletDisconnected: () => track('wallet_disconnected'),
  
  // Token Launch Events
  tokenLaunchOpened: () => track('token_launch_opened'),
  tokenLaunchStep: (step) => track('token_launch_step', { step }),
  tokenLaunchConfirmClick: (tokenName) => track('token_launch_confirm_click', { tokenName }),
  tokenLaunchSuccess: (tokenAddress, chain) => track('token_launch_success', { tokenAddress: tokenAddress?.slice(0, 6), chain }),
  tokenLaunchFail: (error) => track('token_launch_fail', { error }),
  
  // Swap Events
  swapSubmit: (fromToken, toToken, amount) => track('swap_submit', { fromToken, toToken, amount }),
  swapSuccess: (fromToken, toToken, txHash) => track('swap_success', { fromToken, toToken, txHash: txHash?.slice(0, 10) }),
  swapFail: (error) => track('swap_fail', { error }),
  
  // Trending/Monetization Events
  trendingBoostClick: (tokenName) => track('trending_boost_click', { tokenName }),
  advertiseInquiryOpen: (product) => track('advertise_inquiry_open', { product }),
  
  // Referral Events
  referralLinkCopied: () => track('referral_link_copied'),
  referralDashboardView: () => track('referral_dashboard_view'),
  
  // Generic Events
  ctaClick: (ctaName, location) => track('cta_click', { ctaName, location }),
  featureUsed: (featureName) => track('feature_used', { featureName }),
};

export default analytics;
