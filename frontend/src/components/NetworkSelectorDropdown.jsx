import React from 'react';
import { ChevronDown, Search } from 'lucide-react';

const CHAIN_CONFIG = {
  // EVM Chains
  1: {
    name: 'Ethereum',
    icon: '⟠',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    color: 'from-blue-400 to-blue-600',
    type: 'EVM',
    dexUrl: 'https://app.uniswap.org',
  },
  56: {
    name: 'BSC',
    icon: '🟡',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png',
    color: 'from-yellow-400 to-yellow-600',
    type: 'EVM',
    dexUrl: 'https://pancakeswap.finance',
  },
  137: {
    name: 'Polygon',
    icon: '🟪',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
    color: 'from-purple-400 to-purple-600',
    type: 'EVM',
    dexUrl: 'https://quickswap.exchange',
  },
  42161: {
    name: 'Arbitrum',
    icon: '🔵',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
    color: 'from-blue-500 to-blue-700',
    type: 'EVM',
    dexUrl: 'https://app.uniswap.org',
  },
  10: {
    name: 'Optimism',
    icon: '🔴',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png',
    color: 'from-red-400 to-red-600',
    type: 'EVM',
    dexUrl: 'https://app.uniswap.org',
  },
  8453: {
    name: 'Base',
    icon: '🔵',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
    color: 'from-blue-600 to-indigo-600',
    type: 'EVM',
    dexUrl: 'https://app.uniswap.org',
  },
  43114: {
    name: 'Avalanche',
    icon: '🔺',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png',
    color: 'from-red-500 to-red-700',
    type: 'EVM',
    dexUrl: 'https://traderjoexyz.com',
  },
  250: {
    name: 'Fantom',
    icon: '👻',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/info/logo.png',
    color: 'from-blue-400 to-cyan-500',
    type: 'EVM',
    dexUrl: 'https://spooky.fi',
  },
  25: {
    name: 'Cronos',
    icon: '💎',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cronos/info/logo.png',
    color: 'from-blue-600 to-purple-600',
    type: 'EVM',
    dexUrl: 'https://vvs.finance',
  },
  324: {
    name: 'zkSync',
    icon: '⚡',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/zksync/info/logo.png',
    color: 'from-purple-600 to-blue-600',
    type: 'EVM',
    dexUrl: 'https://app.mute.io',
  },
  
  // Non-EVM Layer-1 Chains
  0: {
    name: 'Solana',
    icon: '◎',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
    color: 'from-purple-500 to-indigo-600',
    type: 'Non-EVM',
    dexUrl: 'https://jup.ag',
  },
  'xrp': {
    name: 'XRP Ledger',
    icon: '💧',
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png',
    color: 'from-blue-500 to-cyan-500',
    type: 'Non-EVM',
    dexUrl: 'https://sologenic.org',
  },
  'tron': {
    name: 'Tron',
    icon: '⚡',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png',
    color: 'from-red-500 to-orange-500',
    type: 'Non-EVM',
    dexUrl: 'https://sunswap.com',
  }
};

const NetworkSelectorDropdown = ({ selectedChain, onChainChange, className = "" }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const selectedConfig = CHAIN_CONFIG[selectedChain] || CHAIN_CONFIG[1];
  const searchInputRef = React.useRef(null);

  const handleSelect = (chainId) => {
    onChainChange(chainId);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter chains based on search query - show ALL chains, no EVM/Non-EVM filtering
  const getFilteredChains = () => {
    const allChains = Object.entries(CHAIN_CONFIG);
    
    if (!searchQuery) {
      return allChains;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    return allChains.filter(([_, config]) => 
      config.name.toLowerCase().includes(lowerQuery) ||
      config.type.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredChains = getFilteredChains();

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors min-w-[140px]"
      >
        <img 
          src={selectedConfig.logoUrl} 
          alt={selectedConfig.name}
          className="w-5 h-5 rounded-full"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'inline';
          }}
        />
        <span className="text-lg" style={{ display: 'none' }}>{selectedConfig.icon}</span>
        <span className="font-medium text-sm">{selectedConfig.name}</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery('');
            }}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 min-w-[250px] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suche nach Chain..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            {/* Chain List */}
            <div className="max-h-[350px] overflow-y-auto">
              {filteredChains.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Keine Chains gefunden
                </div>
              ) : (
                filteredChains.map(([chainId, config]) => {
                  const isSelected = chainId === selectedChain || (typeof chainId === 'number' && chainId === selectedChain);
                  
                  return (
                    <button
                      key={chainId}
                      onClick={() => handleSelect(chainId)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <img 
                        src={config.logoUrl} 
                        alt={config.name}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'inline';
                        }}
                      />
                      <span className="text-xl" style={{ display: 'none' }}>{config.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{config.name}</div>
                        <div className="text-xs text-gray-500">{config.type}</div>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NetworkSelectorDropdown;
