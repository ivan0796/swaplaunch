import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { 
  Users, DollarSign, TrendingUp, Copy, Check, Gift, 
  Trophy, Share2, Sparkles, ExternalLink 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ReferralsPage = () => {
  const { t } = useTranslation();
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { publicKey: solanaPublicKey, connected: solanaConnected } = useWallet();
  
  const [selectedChain, setSelectedChain] = useState(1);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const walletAddress = evmAddress || (solanaPublicKey ? solanaPublicKey.toBase58() : null);
  const isConnected = evmConnected || solanaConnected;

  useEffect(() => {
    // Always fetch leaderboard (no wallet needed)
    fetchLeaderboard();
    
    // Fetch user stats only if wallet is connected
    if (isConnected && walletAddress) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [isConnected, walletAddress]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/referrals/stats/${walletAddress}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/referrals/leaderboard?limit=10`);
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const referralLink = walletAddress ? `${window.location.origin}/?ref=${walletAddress}` : '';

  const copyLink = () => {
    if (!referralLink) return;
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
      const response = await axios.post(`${BACKEND_URL}/api/referrals/claim/${walletAddress}`);
      toast.success(response.data.message);
      fetchStats(); // Refresh stats
    } catch (error) {
      toast.error('Failed to claim rewards');
    } finally {
      setClaiming(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">{t('referrals.program')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('referrals.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('referrals.subtitle')}
          </p>
        </div>

        {/* Wallet Connection Required */}
        {!isConnected ? (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">{t('referrals.connectWallet')}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('referrals.connectWalletDesc')}
            </p>
          </div>
        ) : (
          <>
            {/* Referral Link Box */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  {t('referrals.yourLink')}
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-sm dark:text-white"
                  />
                  <Button
                    onClick={copyLink}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? t('referrals.copied') : t('referrals.copy')}
                  </Button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Total Referrals */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold dark:text-white">
                          {stats?.total_referrals || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Referrals</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Users invited
                    </div>
                  </div>

                  {/* Total Earned */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold dark:text-white">
                          {formatCurrency(stats?.total_earned || 0)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Earned</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Lifetime rewards
                    </div>
                  </div>

                  {/* Unclaimed Amount */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <Gift className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold dark:text-white">
                          {formatCurrency(stats?.unclaimed_amount || 0)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
                      </div>
                    </div>
                    <div className="text-xs bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg px-3 py-2 text-yellow-700 dark:text-yellow-400">
                      💰 {t('referrals.withdrawalNote')}
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 mb-8 shadow-lg">
                  <h3 className="text-2xl font-bold mb-6 dark:text-white text-center">How It Works</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        1
                      </div>
                      <h4 className="font-semibold mb-2 dark:text-white">Share Your Link</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Copy your unique referral link and share it with friends
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        2
                      </div>
                      <h4 className="font-semibold mb-2 dark:text-white">Friends Trade</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your referrals connect wallet and start trading on SwapLaunch
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        3
                      </div>
                      <h4 className="font-semibold mb-2 dark:text-white">Earn Rewards</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You earn 10% of platform fees from every swap they make
                      </p>
                    </div>
                  </div>
                </div>

                {/* Referral List */}
                {stats?.referees && stats.referees.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Your Referrals ({stats.referees.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Address</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Joined</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Swaps</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Volume</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.referees.map((referee, idx) => (
                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                              <td className="py-3 px-4 text-sm dark:text-white font-mono">
                                {formatAddress(referee.address)}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                {referee.joined_at ? new Date(referee.joined_at).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-sm text-right dark:text-white">
                                {referee.total_swaps || 0}
                              </td>
                              <td className="py-3 px-4 text-sm text-right dark:text-white">
                                {formatCurrency(referee.total_volume || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Leaderboard */}
                {leaderboard.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Top Referrers
                    </h3>
                    <div className="space-y-3">
                      {leaderboard.map((entry, idx) => (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-4 rounded-xl ${
                            entry.rank === 1 
                              ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700' 
                              : entry.rank === 2
                              ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/20 dark:to-gray-600/20 border border-gray-200 dark:border-gray-600'
                              : entry.rank === 3
                              ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700'
                              : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              entry.rank === 1 ? 'bg-yellow-500 text-white' :
                              entry.rank === 2 ? 'bg-gray-400 text-white' :
                              entry.rank === 3 ? 'bg-orange-500 text-white' :
                              'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                              {entry.rank}
                            </div>
                            <div>
                              <div className="font-mono text-sm dark:text-white">
                                {formatAddress(entry.wallet)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {entry.total_referrals} referrals
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(entry.total_earned)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {formatCurrency(entry.total_volume)} volume
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReferralsPage;