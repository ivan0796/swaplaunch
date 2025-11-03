import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';
import { Users, DollarSign, TrendingUp, Copy, Check, Gift } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ReferralsPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchStats();
    }
  }, [isConnected, address]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/referrals/stats/${address}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = `${window.location.origin}?ref=${address}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = async () => {
    if (!stats || stats.unclaimed_amount === 0) {
      toast.error('No rewards to claim');
      return;
    }

    setClaiming(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/referrals/claim/${address}`);
      toast.success(response.data.message);
      fetchStats(); // Refresh stats
    } catch (error) {
      toast.error('Failed to claim rewards');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!isConnected ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 dark:text-gray-400">View your referral stats and earn rewards</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">My Referrals</h1>
              <p className="text-gray-600 dark:text-gray-400">Earn 10% of platform fees from your referrals!</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Referrals</span>
                </div>
                <div className="text-3xl font-bold">{stats?.total_referrals || 0}</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Earned</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  ${stats?.total_earned?.toFixed(2) || '0.00'}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Unclaimed</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  ${stats?.unclaimed_amount?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>

            {/* Referral Link */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Your Referral Link</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm"
                />
                <Button
                  onClick={copyLink}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                ✓ Share this link and earn 10% of platform fees from your referrals' swaps
              </p>
            </div>

            {/* Claim Rewards */}
            {stats?.unclaimed_amount > 0 && (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Rewards Available!</h3>
                    <p className="text-purple-100">You have ${stats.unclaimed_amount.toFixed(2)} ready to claim</p>
                  </div>
                  <Button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    {claiming ? 'Claiming...' : 'Claim Rewards'}
                  </Button>
                </div>
              </div>
            )}

            {/* Referral List */}
            {stats?.referees && stats.referees.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Your Referrals</h3>
                <div className="space-y-3">
                  {stats.referees.map((referee, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div>
                        <div className="font-mono text-sm">
                          {referee.address.slice(0, 6)}...{referee.address.slice(-4)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Joined {new Date(referee.joined_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{referee.total_swaps} swaps</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ${referee.total_volume?.toFixed(0) || 0} volume
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-bold mb-3">How Referrals Work</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Share your unique referral link with friends</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>When they swap, you earn 10% of the platform fee (0.02% of swap amount)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Claim your rewards anytime - fully non-custodial!</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralsPage;