import React from 'react';
import { ExternalLink } from 'lucide-react';

const EXPLORERS = {
  1: { name: 'Etherscan', url: 'https://etherscan.io' },
  56: { name: 'BSCScan', url: 'https://bscscan.com' },
  137: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  42161: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  10: { name: 'Optimism Explorer', url: 'https://optimistic.etherscan.io' },
  8453: { name: 'BaseScan', url: 'https://basescan.org' },
  43114: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  250: { name: 'FTMScan', url: 'https://ftmscan.com' },
  25: { name: 'CronoScan', url: 'https://cronoscan.com' },
  324: { name: 'zkSync Explorer', url: 'https://explorer.zksync.io' },
  0: { name: 'Solana Explorer', url: 'https://explorer.solana.com' },
};

const ExplorerLink = ({ chainId, txHash, address, type = 'tx', className = '' }) => {
  const explorer = EXPLORERS[chainId];
  
  if (!explorer) return null;
  
  const url = type === 'tx' 
    ? `${explorer.url}/tx/${txHash}`
    : `${explorer.url}/address/${address}`;
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm ${className}`}
    >
      <span>View on {explorer.name}</span>
      <ExternalLink className="w-4 h-4" />
    </a>
  );
};

export default ExplorerLink;