// Blockchain Explorer Utils

export const EXPLORER_URLS = {
  1: 'https://etherscan.io',
  56: 'https://bscscan.com',
  137: 'https://polygonscan.com',
  solana: 'https://solscan.io'
};

export const getExplorerUrl = (chainId, txHash) => {
  const baseUrl = EXPLORER_URLS[chainId];
  if (!baseUrl || !txHash) return null;
  
  if (chainId === 'solana') {
    return `${baseUrl}/tx/${txHash}`;
  }
  return `${baseUrl}/tx/${txHash}`;
};

export const getExplorerName = (chainId) => {
  const names = {
    1: 'Etherscan',
    56: 'BscScan',
    137: 'PolygonScan',
    solana: 'Solscan'
  };
  return names[chainId] || 'Explorer';
};

export const getAddressExplorerUrl = (chainId, address) => {
  const baseUrl = EXPLORER_URLS[chainId];
  if (!baseUrl || !address) return null;
  
  if (chainId === 'solana') {
    return `${baseUrl}/account/${address}`;
  }
  return `${baseUrl}/address/${address}`;
};