import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';

const RiskDisclosure = () => {
  const [selectedChain, setSelectedChain] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold dark:text-white">Risk Disclosure</h1>
          </div>

          <div className="space-y-6 text-gray-600 dark:text-gray-300">
            <p>
              <strong>Important:</strong> Trading and investing in cryptocurrencies involves substantial risk of loss and is not suitable for every investor.
            </p>

            <div>
              <h2 className="text-xl font-bold mb-2 dark:text-white">Platform Risks</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Smart contract vulnerabilities</li>
                <li>Market volatility and price fluctuations</li>
                <li>Impermanent loss in liquidity pools</li>
                <li>Network congestion and failed transactions</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-2 dark:text-white">Your Responsibility</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are solely responsible for your private keys</li>
                <li>Always verify transaction details before signing</li>
                <li>Do your own research (DYOR) before investing</li>
                <li>Never invest more than you can afford to lose</li>
              </ul>
            </div>

            <p className="text-sm italic">
              By using SwapLaunch, you acknowledge and accept these risks. This is not financial advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclosure;