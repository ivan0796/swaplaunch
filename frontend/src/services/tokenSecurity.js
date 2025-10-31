// GoPlus Security API Integration
import axios from 'axios';

const GOPLUS_API_BASE = 'https://api.gopluslabs.io/api/v1';

/**
 * Get token security information from GoPlus
 * @param {string} chainId - Chain ID (1 for Ethereum, 56 for BSC, 137 for Polygon)
 * @param {string} contractAddress - Token contract address
 */
export const getTokenSecurity = async (chainId, contractAddress) => {
  try {
    const response = await axios.get(
      `${GOPLUS_API_BASE}/token_security/${chainId}`,
      {
        params: {
          contract_addresses: contractAddress.toLowerCase()
        }
      }
    );

    const data = response.data;
    if (data && data.result) {
      const tokenData = data.result[contractAddress.toLowerCase()];
      return tokenData || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching token security:', error);
    return null;
  }
};

/**
 * Check if address is malicious
 */
export const checkMaliciousAddress = async (chainId, address) => {
  try {
    const response = await axios.get(
      `${GOPLUS_API_BASE}/address_security/${address}`,
      {
        params: { chain_id: chainId }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error checking malicious address:', error);
    return null;
  }
};

/**
 * Parse security data and return risk assessment
 */
export const parseSecurityRisks = (securityData) => {
  if (!securityData) return { level: 'unknown', risks: [] };

  const risks = [];
  let riskLevel = 'low';

  // Critical risks
  if (securityData.is_honeypot === '1') {
    risks.push({ type: 'critical', message: '🚨 HONEYPOT DETECTED - Cannot sell!' });
    riskLevel = 'critical';
  }

  if (securityData.is_blacklisted === '1') {
    risks.push({ type: 'critical', message: '🚨 Token is BLACKLISTED' });
    riskLevel = 'critical';
  }

  // High risks
  if (securityData.is_proxy === '1') {
    risks.push({ type: 'high', message: '⚠️ Proxy contract - code can be changed' });
    if (riskLevel !== 'critical') riskLevel = 'high';
  }

  if (securityData.is_mintable === '1') {
    risks.push({ type: 'high', message: '⚠️ Owner can mint new tokens' });
    if (riskLevel !== 'critical') riskLevel = 'high';
  }

  if (securityData.can_take_back_ownership === '1') {
    risks.push({ type: 'high', message: '⚠️ Owner can take back ownership' });
    if (riskLevel !== 'critical') riskLevel = 'high';
  }

  // Medium risks
  if (securityData.is_open_source === '0') {
    risks.push({ type: 'medium', message: '⚠️ Contract is not open source' });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  if (securityData.hidden_owner === '1') {
    risks.push({ type: 'medium', message: '⚠️ Hidden owner detected' });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // Tax information
  const buyTax = parseFloat(securityData.buy_tax || 0);
  const sellTax = parseFloat(securityData.sell_tax || 0);

  if (buyTax > 10) {
    risks.push({ type: 'medium', message: `⚠️ High buy tax: ${buyTax}%` });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  if (sellTax > 10) {
    risks.push({ type: 'medium', message: `⚠️ High sell tax: ${sellTax}%` });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // Positive indicators
  if (securityData.is_open_source === '1') {
    risks.push({ type: 'info', message: '✓ Contract is open source' });
  }

  if (securityData.owner_address === '0x0000000000000000000000000000000000000000') {
    risks.push({ type: 'info', message: '✓ Ownership renounced' });
  }

  return { level: riskLevel, risks, buyTax, sellTax };
};

/**
 * Get risk color based on level
 */
export const getRiskColor = (level) => {
  switch (level) {
    case 'critical':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'medium':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-green-700 bg-green-50 border-green-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

export const getRiskBadgeColor = (level) => {
  switch (level) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};