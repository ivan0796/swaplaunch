import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Zap, TrendingUp, BarChart3, Clock, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import SwapFormV2 from '../components/SwapFormV2';

const ProSwapPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);
  const [activeTab, setActiveTab] = useState('swap'); // 'swap', 'limit', 'chart'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold dark:text-white">Pro Swap</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Swap Interface */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('swap')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === 'swap' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Swap
                </button>
                <button
                  onClick={() => setActiveTab('limit')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === 'limit' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Limit
                </button>
              </div>

              {/* Swap Form */}
              {activeTab === 'swap' && (
                <SwapFormV2 
                  chainId={selectedChain} 
                  walletAddress={address}
                />
              )}

              {activeTab === 'limit' && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Limit Orders</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Set target price for automatic execution</p>
                  <a href="/trade/limit-orders" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                    Go to Limit Orders →
                  </a>
                </div>
              )}
            </div>

            {/* Non-Custodial Badge */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 mt-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <div className="text-sm text-green-900 dark:text-green-200">
                  <strong>Non-Custodial:</strong> You sign all transactions. We never hold funds.
                </div>
              </div>
            </div>
          </div>

          {/* Right: Market Info & Analytics */}
          <div className="lg:col-span-2">
            {/* Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">24h Volume</span>
                </div>
                <div className="text-2xl font-bold dark:text-white">$2.4M</div>
                <div className="text-sm text-green-600">+12.4%</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Swaps</span>
                </div>
                <div className="text-2xl font-bold dark:text-white">15,234</div>
                <div className="text-sm text-blue-600">+8.2%</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Fee</span>
                </div>
                <div className="text-2xl font-bold dark:text-white">0.23%</div>
                <div className="text-sm text-gray-500">Dynamic</div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Price Chart</h3>
              <div className="aspect-[16/9] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">TradingView Chart</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Real-time price data and technical indicators</p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 dark:text-white">Advanced Orders</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Limit orders, stop-loss, take-profit</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 dark:text-white">Market Depth</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Live order book visualization</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 dark:text-white">Smart Routing</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Best price across all DEXs</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 dark:text-white">MEV Protection</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Protected from front-running</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProSwapPage;
