import React from 'react';
import { TrendingUp, Info, Percent } from 'lucide-react';

const RewardPanel = ({ mode = 'sol' }) => {
  const rewardData = {
    sol: {
      apy: '~7-9%',
      commission: '8%',
      netAPY: '~6.5-8.5%',
      description: 'Validator Commission',
      feeInfo: 'Earnings via validator commission (8%). No additional app fee.',
    },
    spl: {
      apy: '~12-18%',
      rewardFee: '5%',
      netAPY: '~11.4-17.1%',
      description: 'Reward Distribution Fee',
      feeInfo: 'Platform fee: 5% on rewards. Transparent, on-chain collection.',
    },
  };

  const data = rewardData[mode];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* APY Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estimated APY</p>
            <p className="text-2xl font-bold text-green-600">{data.apy}</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Variable returns based on network performance
        </p>
      </div>

      {/* Fee Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Percent className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{data.description}</p>
            <p className="text-2xl font-bold text-blue-600">
              {mode === 'sol' ? data.commission : data.rewardFee}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {data.feeInfo}
        </p>
      </div>

      {/* Net APY Card */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm opacity-90">Your Net APY</p>
            <p className="text-2xl font-bold">{data.netAPY}</p>
          </div>
        </div>
        <p className="text-xs opacity-80">
          After {mode === 'sol' ? 'commission' : 'platform fee'}
        </p>
      </div>
    </div>
  );
};

export default RewardPanel;
