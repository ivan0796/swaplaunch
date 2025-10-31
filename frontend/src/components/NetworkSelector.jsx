import React from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { Button } from './ui/button';
import { mainnet, bsc, polygon } from 'wagmi/chains';

const CHAIN_CONFIG = {
  [mainnet.id]: {
    name: 'Ethereum',
    icon: '⟠',
    color: 'from-blue-400 to-blue-600',
    type: 'evm'
  },
  [bsc.id]: {
    name: 'BSC',
    icon: '🟡',
    color: 'from-yellow-400 to-yellow-600',
    type: 'evm'
  },
  [polygon.id]: {
    name: 'Polygon',
    icon: '🟪',
    color: 'from-purple-400 to-purple-600',
    type: 'evm'
  },
  0: {
    name: 'Solana',
    icon: '◎',
    color: 'from-purple-500 to-indigo-600',
    type: 'solana'
  }
};

const NetworkSelector = ({ selectedChain, onChainChange, disabled }) => {
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const handleChainSelect = async (chainId) => {
    onChainChange(chainId);
    
    // Only switch EVM chains via wagmi
    if (!disabled && chainId !== 0 && currentChainId !== chainId) {
      try {
        await switchChain({ chainId });
      } catch (error) {
        console.error('Failed to switch chain:', error);
      }
    }
  };

  return (
    <div data-testid="network-selector" className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Network
      </label>
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(CHAIN_CONFIG).map(([chainKey, config]) => {
          const chainId = parseInt(chainKey);
          const isSelected = selectedChain === chainId;
          const isCurrentNetwork = currentChainId === chainId;
          
          return (
            <button
              key={chainKey}
              data-testid={`network-${config.name.toLowerCase()}`}
              onClick={() => handleChainSelect(chainId)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
                flex flex-col items-center gap-2
              `}
            >
              {/* Network Icon */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-2xl
                bg-gradient-to-br ${config.color}
                shadow-md
              `}>
                {config.icon}
              </div>
              
              {/* Network Name */}
              <span className="font-medium text-sm">{config.name}</span>
              
              {/* Active Indicator */}
              {isCurrentNetwork && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
      {disabled && (
        <p className="text-xs text-gray-500 mt-2">
          Connect your wallet to switch networks
        </p>
      )}
    </div>
  );
};

export default NetworkSelector;