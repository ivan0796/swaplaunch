import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { Button } from './ui/button';

const SwapSettingsModal = ({ isOpen, onClose, slippage, setSlippage }) => {
  const [activeTab, setActiveTab] = useState('swaps');
  const [deadline, setDeadline] = useState(20); // minutes
  const [multihops, setMultihops] = useState(true);
  const [expertMode, setExpertMode] = useState(false);
  const [flippySounds, setFlippySounds] = useState(false);
  const [customSlippage, setCustomSlippage] = useState('');

  if (!isOpen) return null;

  const handleSlippageSelect = (value) => {
    setSlippage(value);
    setCustomSlippage('');
  };

  const handleCustomSlippage = (value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
      setSlippage(numValue);
      setCustomSlippage(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('swaps')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'swaps'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Swaps & Liquidity
          </button>
          <button
            onClick={() => setActiveTab('interface')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'interface'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Interface
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'swaps' && (
            <div className="space-y-6">
              {/* Default Transaction Deadline */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm font-semibold dark:text-white">
                    Default Transaction Deadline
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Your transaction will revert if it is pending for more than this period of time.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={deadline}
                    onChange={(e) => setDeadline(parseInt(e.target.value) || 20)}
                    min="1"
                    max="180"
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl outline-none text-lg dark:text-white"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    minutes
                  </span>
                </div>
              </div>

              {/* Slippage Tolerance */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm font-semibold dark:text-white">
                    Slippage Tolerance
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Your transaction will revert if the price changes unfavorably by more than this percentage.
                    </div>
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[0.1, 0.5, 1.0].map(value => (
                    <button
                      key={value}
                      onClick={() => handleSlippageSelect(value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        slippage === value && !customSlippage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Custom"
                      value={customSlippage}
                      onChange={(e) => handleCustomSlippage(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-sm text-center outline-none transition-colors ${
                        customSlippage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      step="0.1"
                      min="0.1"
                      max="50"
                    />
                  </div>
                </div>

                {/* Warning Messages */}
                {slippage < 0.5 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3 text-xs text-orange-800 dark:text-orange-200">
                    ⚠️ Your transaction may fail
                  </div>
                )}
                {slippage > 5 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-xs text-red-800 dark:text-red-200">
                    ⚠️ Your transaction may be frontrun
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'interface' && (
            <div className="space-y-4">
              {/* Multihops */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <div className="font-medium dark:text-white">Multihops</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Allow routing through multiple tokens
                  </div>
                </div>
                <button
                  onClick={() => setMultihops(!multihops)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    multihops ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      multihops ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Expert Mode */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <div className="font-medium dark:text-white">Expert Mode</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Disable transaction confirmations
                  </div>
                </div>
                <button
                  onClick={() => setExpertMode(!expertMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    expertMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      expertMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Flippy Sounds */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <div className="font-medium dark:text-white">Flippy sounds</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Fun sounds for flipping tokens
                  </div>
                </div>
                <button
                  onClick={() => setFlippySounds(!flippySounds)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    flippySounds ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      flippySounds ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mt-6">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 dark:text-blue-200">
                    <p className="font-semibold mb-1">Expert Mode</p>
                    <p>
                      Bypasses confirmation modals and allows high slippage trades. Use at your own risk.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SwapSettingsModal;
