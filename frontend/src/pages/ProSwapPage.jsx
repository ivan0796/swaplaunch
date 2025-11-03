import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const ProSwapPage = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold dark:text-white">Pro Swap</h1>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-sm font-bold">BETA</span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Advanced trading interface with real-time charts, order book, and detailed market analytics.
          </p>

          {/* Beta Notice */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="text-sm text-orange-900 dark:text-orange-200">
                <strong>Beta Feature:</strong> Pro Swap interface is currently in development. Advanced trading features coming soon.
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1 dark:text-white">Real-Time Charts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">TradingView integration with advanced charting tools</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1 dark:text-white">Order Book</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Live order book with depth visualization</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1 dark:text-white">Market Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Detailed market statistics and trading indicators</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1 dark:text-white">Advanced Orders</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Limit orders, stop-loss, and take-profit</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Use Standard Swap
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProSwapPage;
