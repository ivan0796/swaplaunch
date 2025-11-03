import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { Lock, Calendar, Info, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const TokenLockerPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [loading, setLoading] = useState(false);

  const lockFee = '50'; // 50 USD in native token

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
      toast.info('Lock feature coming soon! Smart contract deployment in progress.');
      // TODO: Implement actual locking contract
    } catch (error) {
      toast.error('Failed to lock tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Navbar */}
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

const TokenLockerPage = () => {
  const { address, isConnected } = useAccount();
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [loading, setLoading] = useState(false);

  const lockFee = '50'; // 50 USD in native token

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
      toast.info('Lock feature coming soon! Smart contract deployment in progress.');
      // TODO: Implement actual locking contract
    } catch (error) {
      toast.error('Failed to lock tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SwapLaunch v2.0
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Trade</Link>
            <Link to="/launchpad" className="text-gray-600 hover:text-blue-600">Launchpad</Link>
            <Link to="/token-locker" className="text-blue-600 font-semibold">Token Locker</Link>
            <Link to="/bridge" className="text-gray-600 hover:text-blue-600">Bridge</Link>
            <Link to="/faq" className="text-gray-600 hover:text-blue-600">FAQ</Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Token Locker</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Lock your LP tokens or team tokens with time-based vesting. Fully non-custodial and secure.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>Lock Fee: ${lockFee} USD</strong><br />
              Tokens remain in your control. Only you can unlock them after the specified date.
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Token Address</label>
              <Input
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount to Lock</label>
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Unlock Date
              </label>
              <Input
                type="datetime-local"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <Button
              onClick={handleLock}
              disabled={loading || !isConnected}
              className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Locking...' : isConnected ? `Lock Tokens (Fee: $${lockFee})` : 'Connect Wallet'}
            </Button>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl mb-2">🔒</div>
              <div className="font-semibold mb-1">Non-Custodial</div>
              <div className="text-xs text-gray-600">You keep full control</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl mb-2">⏰</div>
              <div className="font-semibold mb-1">Time-Locked</div>
              <div className="text-xs text-gray-600">Unlock at set date</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold mb-1">Transparent</div>
              <div className="text-xs text-gray-600">On-chain verification</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenLockerPage;