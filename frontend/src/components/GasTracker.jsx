import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flame, TrendingDown, TrendingUp } from 'lucide-react';

const GasTracker = ({ chainId }) => {
  const [gasData, setGasData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGasData();
    const interval = setInterval(fetchGasData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [chainId]);

  const fetchGasData = async () => {
    try {
      // Mock data for demo - in production use real gas APIs
      const mockGas = {
        1: { fast: 25, standard: 20, slow: 15, trend: 'down' },
        56: { fast: 3, standard: 2, slow: 1, trend: 'stable' },
        137: { fast: 50, standard: 40, slow: 30, trend: 'up' },
        42161: { fast: 0.1, standard: 0.08, slow: 0.05, trend: 'down' },
      };

      setGasData(mockGas[chainId] || mockGas[1]);
    } catch (error) {
      console.error('Gas fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !gasData) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (gasData.trend === 'up') return <TrendingUp className="w-3 h-3 text-red-500" />;
    if (gasData.trend === 'down') return <TrendingDown className="w-3 h-3 text-green-500" />;
    return null;
  };

  const getGasColor = () => {
    if (gasData.fast < 10) return 'text-green-600';
    if (gasData.fast < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700">
      <Flame className="w-4 h-4 text-orange-500" />
      <div className="flex items-center gap-1">
        <span className={`text-xs font-bold ${getGasColor()}`}>
          {gasData.fast}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400">Gwei</span>
        {getTrendIcon()}
      </div>
    </div>
  );
};

export default GasTracker;