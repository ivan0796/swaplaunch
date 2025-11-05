import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Coins, TrendingUp, Info, Shield, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';

const StakingPage = () => {
  const { address: walletAddress } = useAccount();
  const [selectedChain, setSelectedChain] = useState('solana');
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedValidator, setSelectedValidator] = useState('');
  const [loading, setLoading] = useState(false);

  // Staking options
  const stakingOptions = [
    {
      id: 'solana',
      name: 'Solana (SOL)',
      symbol: 'SOL',
      apr: '6.8%',
      minStake: '0.01',
      description: 'Stake SOL with top validators',
      validators: [
        { id: 'v1', name: 'Coinbase Cloud', apr: '7.2%', commission: '8%' },
        { id: 'v2', name: 'Everstake', apr: '6.9%', commission: '10%' },
        { id: 'v3', name: 'P2P Validator', apr: '6.8%', commission: '9%' }
      ]
    },
    {
      id: 'ethereum',
      name: 'Ethereum (ETH)',
      symbol: 'ETH',
      apr: '3.5%',
      minStake: '0.01',
      description: 'Liquid staking via Lido',
      validators: [
        { id: 'lido', name: 'Lido', apr: '3.5%', commission: '10%' }
      ]
    }
  ];

  const selectedOption = stakingOptions.find(opt => opt.id === selectedChain);

  const handleStake = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!selectedValidator) {
      toast.error('Please select a validator');
      return;
    }

    setLoading(true);
    
    // Beta mode - simulate staking
    setTimeout(() => {
      toast.success(`Successfully staked ${stakeAmount} ${selectedOption.symbol}! (Beta Mode)`);
      setLoading(false);
      setStakeAmount('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <HeaderSlim />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Beta Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-1 rounded-full text-sm font-semibold">
            BETA
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staking Form - Like Swap */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-bold dark:text-white">Stake & Earn</h1>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Non-custodial staking. Earn rewards while keeping full control.
              </p>

              {/* Chain Selector */}
              <div className="mb-4">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Select Chain:</label>
                <div className="flex gap-2">
                  {stakingOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedChain(option.id);
                        setSelectedValidator('');
                      }}
                      className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                        selectedChain === option.id
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stake Amount */}
              <div className="mb-4">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Amount to Stake:</label>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-2xl font-semibold outline-none w-full dark:text-white"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Min: {selectedOption?.minStake} {selectedOption?.symbol}
                    </span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      APR: {selectedOption?.apr}
                    </span>
                  </div>
                </div>
              </div>

              {/* Validator Selection */}
              <div className="mb-6">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Select Validator:</label>
                <div className="space-y-2">
                  {selectedOption?.validators.map(validator => (
                    <button
                      key={validator.id}
                      onClick={() => setSelectedValidator(validator.id)}
                      className={`w-full p-3 rounded-xl text-left transition-colors ${
                        selectedValidator === validator.id
                          ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-600'
                          : 'bg-gray-50 dark:bg-gray-900 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold dark:text-white">{validator.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Commission: {validator.commission}</div>
                        </div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          {validator.apr}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 dark:text-blue-200">
                    <strong>Non-Custodial:</strong> Your staked tokens remain in your control. Unstake anytime.
                  </div>
                </div>
              </div>

              {/* Stake Button */}
              <Button
                onClick={handleStake}
                disabled={loading || !walletAddress}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? 'Staking...' : !walletAddress ? 'Connect Wallet' : `Stake ${selectedOption?.symbol}`}
              </Button>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="font-bold mb-4 dark:text-white">Staking Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Staked</span>
                  <span className="font-semibold dark:text-white">0.00 {selectedOption?.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rewards Earned</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">0.00 {selectedOption?.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">APR</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{selectedOption?.apr}</span>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="font-bold mb-4 dark:text-white">How Staking Works</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">1</div>
                  <div>Select chain and amount</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">2</div>
                  <div>Choose validator</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">3</div>
                  <div>Confirm transaction</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">4</div>
                  <div>Earn rewards automatically</div>
                </div>
              </div>
            </div>

            {/* Risk Disclaimer */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4">
              <div className="flex gap-2">
                <Shield className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div className="text-xs text-orange-900 dark:text-orange-200">
                  <strong>Beta Notice:</strong> This is a beta feature. Start with small amounts. Always DYOR.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StakingPage;
