import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';
import { Wallet, TrendingUp, TrendingDown, DollarSign, PieChart, Clock, Bell } from 'lucide-react';
import Navbar from '../components/Navbar';
import SwapHistory from '../components/SwapHistory';
import PriceAlerts from '../components/PriceAlerts';

const PortfolioPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assets'); // 'assets', 'history', 'alerts'

  useEffect(() => {
    if (isConnected && address) {
      fetchPortfolio();
    }
  }, [isConnected, address]);

  const fetchPortfolio = async () => {
    try {
      // Mock data for demo
      setPortfolio({
        totalValue: 12450.67,
        pnl: 2340.50,
        pnlPercent: 23.14,
        tokens: [
          { symbol: 'ETH', balance: 2.45, value: 6125, change24h: 5.2, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
          { symbol: 'USDC', balance: 5000, value: 5000, change24h: 0, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
          { symbol: 'BNB', balance: 3.2, value: 1325.67, change24h: -2.1, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' }
        ]
      });
    } catch (error) {
      console.error('Portfolio fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!isConnected ? (
          <div className="text-center py-20">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 dark:text-gray-400">View your portfolio and track your crypto holdings</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20">Loading portfolio...</div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
                </div>
                <div className="text-3xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total P&L</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  +${portfolio.pnl.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">+{portfolio.pnlPercent}%</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Assets</span>
                </div>
                <div className="text-3xl font-bold">{portfolio.tokens.length}</div>
              </div>
            </div>

            {/* Token List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Your Holdings</h3>
              <div className="space-y-3">
                {portfolio.tokens.map((token, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center gap-3">
                      <img src={token.logo} alt={token.symbol} className="w-10 h-10 rounded-full" />
                      <div>
                        <div className="font-bold">{token.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{token.balance} {token.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${token.value.toLocaleString()}</div>
                      <div className={`text-sm flex items-center gap-1 ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(token.change24h)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Source Note */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              ✓ {t('portfolio.dataNote')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;