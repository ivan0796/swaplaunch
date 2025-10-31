// Referral System Utils

export const getReferrerFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('ref');
};

export const generateReferralLink = (walletAddress) => {
  if (!walletAddress) return null;
  const baseUrl = window.location.origin;
  return `${baseUrl}/?ref=${walletAddress}`;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const saveReferrerToStorage = (referrer) => {
  if (referrer) {
    localStorage.setItem('swaplaunch_referrer', referrer);
  }
};

export const getReferrerFromStorage = () => {
  return localStorage.getItem('swaplaunch_referrer');
};