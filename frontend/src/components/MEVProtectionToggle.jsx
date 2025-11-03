import React from 'react';
import { Shield, Info } from 'lucide-react';

const MEVProtectionToggle = ({ enabled, onToggle, slippageMode, onSlippageModeChange }) => {
  return (
    <div className="space-y-4">
      {/* MEV Protection Toggle */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-sm">MEV Protection</span>
          </div>
          <button
            onClick={onToggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              enabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-blue-800">
          {enabled 
            ? 'Protected: Your transaction is routed through private RPC to prevent front-running.'
            : 'Not protected: Standard public RPC routing.'}
        </p>
      </div>

      {/* Auto Slippage */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-sm">Slippage</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSlippageModeChange('auto')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                slippageMode === 'auto'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => onSlippageModeChange('custom')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                slippageMode === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              Custom
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          {slippageMode === 'auto'
            ? 'Automatically adjusted based on market volatility (0.1-0.5%)'
            : 'Set your own slippage tolerance'}
        </p>
      </div>
    </div>
  );
};

export default MEVProtectionToggle;