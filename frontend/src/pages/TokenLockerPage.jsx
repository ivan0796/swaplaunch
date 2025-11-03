import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { Lock, Calendar, Info, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const TokenLockerPage = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [loading, setLoading] = useState(false);

  const lockFee = '50';

  const handleLock = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!tokenAddress || !amount || !unlockDate) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      toast.info('Lock feature coming soon!');
    } catch (error) {
      toast.error('Failed to lock tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold dark:text-white">Token Locker</h1>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-sm font-bold">BETA</span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Lock your LP tokens or team tokens with time-based vesting.
          </p>

          {/* Beta Notice */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="text-sm text-orange-900 dark:text-orange-200">
                <strong>Beta Feature:</strong> This feature is currently in beta testing. Smart contracts are being audited. Use with caution.
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-xl p-4 mb-6">
            <Info className="w-5 h-5 text-blue-600 inline mr-2" />
            <strong>Lock Fee: ${lockFee} USD</strong>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Token Address</label>
              <Input
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Unlock Date</label>
              <Input
                type="datetime-local"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <Button
              onClick={handleLock}
              disabled={loading || !isConnected}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {loading ? 'Locking...' : isConnected ? 'Lock Tokens' : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenLockerPage;
