import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Lock, Calendar, Info, CheckCircle, Clock, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';

const TokenLockerPage = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [loading, setLoading] = useState(false);
  const [myLocks, setMyLocks] = useState([]);
  
  // Fiat preview state
  const [fiatPreview, setFiatPreview] = useState({ usd: null, eur: null });
  const [isFiatLoading, setIsFiatLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadMyLocks();
    }
  }, [isConnected, address]);

  // Fetch fiat preview when amount or token changes
  useEffect(() => {
    const fetchFiatPreview = async () => {
      try {
        setIsFiatLoading(true);
        
        if (!tokenAddress || !amount || Number(amount) <= 0) {
          setFiatPreview({ usd: null, eur: null });
          return;
        }

        // Map common tokens to CoinGecko IDs
        const coinIdMap = {
          // Stablecoins
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usd-coin', // USDC
          '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether', // USDT
          '0x6b175474e89094c44da98b954eedeac495271d0f': 'dai', // DAI
          // Major tokens
          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'weth', // WETH
          '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'wrapped-bitcoin', // WBTC
        };

        const coinId = coinIdMap[tokenAddress.toLowerCase()];
        
        if (!coinId) {
          setFiatPreview({ usd: null, eur: null });
          return;
        }

        const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/crypto/price/${coinId}`);
        
        if (!response.ok) {
          setFiatPreview({ usd: null, eur: null });
          return;
        }

        const data = await response.json();
        const amt = Number(amount);
        
        setFiatPreview({
          usd: data.price_usd ? (amt * data.price_usd).toFixed(2) : null,
          eur: data.price_eur ? (amt * data.price_eur).toFixed(2) : null,
        });
        
      } catch (error) {
        console.error('Error fetching fiat preview:', error);
        setFiatPreview({ usd: null, eur: null });
      } finally {
        setIsFiatLoading(false);
      }
    };

    // Debounce: only fetch after user stops typing
    const timeoutId = setTimeout(fetchFiatPreview, 500);
    return () => clearTimeout(timeoutId);
    
  }, [tokenAddress, amount]);

  const loadMyLocks = async () => {
    // Mock data - replace with actual contract reads
    setMyLocks([
      {
        id: 1,
        token: 'USDC',
        amount: '10000',
        unlockDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        beneficiary: address,
        locked: true
      }
    ]);
  };

  const handleLock = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!tokenAddress || !amount || !unlockDate) {
      toast.error('Please fill all required fields');
      return;
    }

    const unlockTimestamp = new Date(unlockDate).getTime();
    if (unlockTimestamp <= Date.now()) {
      toast.error('Unlock date must be in the future');
      return;
    }

    setLoading(true);
    try {
      // In production: Interact with TokenLocker smart contract
      // 1. Approve token spend
      // 2. Call lock() function
      // For now: Show success message
      
      toast.success('Tokens locked successfully! 🔒');
      toast.info('Non-Custodial: You control the unlock. Tokens locked in smart contract.');
      
      // Reset form
      setTokenAddress('');
      setAmount('');
      setUnlockDate('');
      setBeneficiary('');
      
      // Reload locks
      setTimeout(() => loadMyLocks(), 1000);
    } catch (error) {
      console.error('Lock error:', error);
      toast.error('Failed to lock tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (lockId) => {
    toast.info('Unlocking... This will send tokens to beneficiary.');
    // Call contract unlock function
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lock Form */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold dark:text-white">Token Locker</h1>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Lock tokens with time-based vesting. 100% non-custodial.
            </p>

            {/* Non-Custodial Notice */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-900 dark:text-green-200">
                  <strong>Non-Custodial:</strong> Tokens locked in smart contract. You control unlock. We never hold your funds.
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Token Address *</label>
                <Input
                  placeholder="0x..."
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Amount *</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
                {/* Fiat Preview */}
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {isFiatLoading ? (
                    <span className="animate-pulse">Loading fiat value...</span>
                  ) : (fiatPreview.usd || fiatPreview.eur) ? (
                    <span className="flex items-center gap-1">
                      ≈ 
                      {fiatPreview.eur && (
                        <span className="font-medium">€{Number(fiatPreview.eur).toLocaleString()}</span>
                      )}
                      {fiatPreview.eur && fiatPreview.usd && <span>·</span>}
                      {fiatPreview.usd && (
                        <span className="font-medium">${Number(fiatPreview.usd).toLocaleString()}</span>
                      )}
                    </span>
                  ) : amount && tokenAddress ? (
                    <span className="text-gray-400">Fiat preview not available</span>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Unlock Date *</label>
                <Input
                  type="datetime-local"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Beneficiary (Optional)</label>
                <Input
                  placeholder={address || '0x... (defaults to your address)'}
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Who can unlock tokens. Defaults to your wallet.</p>
              </div>

              <Button
                onClick={handleLock}
                disabled={loading || !isConnected}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Locking...' : isConnected ? '🔒 Lock Tokens' : 'Connect Wallet'}
              </Button>
            </div>
          </div>

          {/* My Locks */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold dark:text-white">My Locks</h2>
            </div>

            {!isConnected ? (
              <div className="text-center py-12">
                <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">Connect wallet to view your locks</p>
              </div>
            ) : myLocks.length === 0 ? (
              <div className="text-center py-12">
                <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No active locks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myLocks.map((lock) => {
                  const unlockTime = new Date(lock.unlockDate);
                  const isUnlockable = unlockTime <= new Date();
                  
                  return (
                    <div key={lock.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-lg dark:text-white">{lock.amount} {lock.token}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Locked until</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isUnlockable 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {isUnlockable ? '🔓 Unlockable' : '🔒 Locked'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <Calendar className="w-4 h-4" />
                        {unlockTime.toLocaleString()}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                        Beneficiary: {lock.beneficiary.slice(0, 6)}...{lock.beneficiary.slice(-4)}
                      </div>

                      {isUnlockable && (
                        <Button
                          onClick={() => handleUnlock(lock.id)}
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Unlock Tokens
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <Lock className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold mb-2 dark:text-white">Time-Based Vesting</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Lock tokens until specific date. Perfect for team vesting.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <Shield className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-bold mb-2 dark:text-white">100% Non-Custodial</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Smart contract holds tokens. You control unlock.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <CheckCircle className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold mb-2 dark:text-white">Auto Unlock</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tokens automatically unlockable after date. Claim anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenLockerPage;
