import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useWalletClient } from 'wagmi';
import { ArrowLeft, Rocket, Shield, TrendingUp, Coins, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import WalletButtonWithHistory from '../components/WalletButtonWithHistory';

const LaunchpadPage = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    decimals: '18',
    description: '',
  });

  const [launching, setLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(null);

  const LAUNCH_FEE = '0.05'; // 0.05 ETH/BNB launch fee

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLaunch = async () => {
    if (!isConnected || !walletClient) {
      toast.error('Please connect your wallet');
      return;
    }

    // Validation
    if (!formData.tokenName || !formData.tokenSymbol || !formData.totalSupply) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLaunching(true);

    try {
      // This is a simplified version - in production you would:
      // 1. Deploy via a Factory Contract
      // 2. Pay launch fee
      // 3. Setup initial liquidity
      // 4. Create token contract
      
      toast.info('🚀 Launching your token...', {
        description: 'This is a demo. In production, a smart contract would be deployed.'
      });

      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock success response
      const mockTokenAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      setLaunchSuccess({
        tokenAddress: mockTokenAddress,
        tokenName: formData.tokenName,
        tokenSymbol: formData.tokenSymbol,
        totalSupply: formData.totalSupply,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`
      });

      toast.success('🎉 Token launched successfully!', {
        description: `${formData.tokenName} (${formData.tokenSymbol}) is now live!`
      });

    } catch (error) {
      console.error('Launch failed:', error);
      toast.error('Launch failed. Please try again.');
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(129,140,248,.25),transparent),radial-gradient(800px_500px_at_80%_0%,rgba(16,185,129,.18),transparent)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 opacity-80 hover:opacity-100">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Swap</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg">
              🚀
            </div>
            <div className="text-sm font-semibold tracking-tight">Launchpad</div>
          </div>
          <div className="flex items-center gap-2">
            <WalletButtonWithHistory />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Non-Custodial Token Launchpad</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Launch your own token in minutes. No coding required. Fully decentralized.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-black/5 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold">Non-Custodial</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You maintain full control. We never hold your tokens or funds.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Coins className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Low Fee</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Only {LAUNCH_FEE} ETH launch fee. No hidden costs.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold">Instant Trading</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Token is immediately tradable on all DEXs after launch.
            </p>
          </div>
        </div>

        {/* Launch Form or Success */}
        {!launchSuccess ? (
          <div className="rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
            <h2 className="text-2xl font-bold mb-6">Launch Your Token</h2>

            <div className="space-y-4">
              {/* Token Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Token Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tokenName"
                  value={formData.tokenName}
                  onChange={handleInputChange}
                  placeholder="e.g., My Awesome Token"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Token Symbol */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Token Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tokenSymbol"
                  value={formData.tokenSymbol}
                  onChange={handleInputChange}
                  placeholder="e.g., MAT"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none uppercase"
                  maxLength="10"
                />
              </div>

              {/* Total Supply */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Supply <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalSupply"
                  value={formData.totalSupply}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total number of tokens to mint
                </p>
              </div>

              {/* Decimals */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Decimals
                </label>
                <select
                  name="decimals"
                  value={formData.decimals}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none"
                >
                  <option value="6">6 (like USDC)</option>
                  <option value="9">9 (like Solana)</option>
                  <option value="18">18 (Standard)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about your token..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Fee Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Launch Fee: {LAUNCH_FEE} ETH
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      This one-time fee covers gas costs and platform maintenance. Your token will be deployed to the blockchain immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Launch Button */}
              <Button
                onClick={handleLaunch}
                disabled={!isConnected || launching || !formData.tokenName || !formData.tokenSymbol || !formData.totalSupply}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400"
              >
                {launching ? (
                  <>
                    <Rocket className="w-5 h-5 mr-2 animate-bounce" />
                    Launching...
                  </>
                ) : !isConnected ? (
                  'Connect Wallet to Launch'
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    Launch Token
                  </>
                )}
              </Button>

              {/* Demo Notice */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ <strong>Demo Mode:</strong> This is a demonstration interface. In production, a Factory Contract would deploy your ERC-20 token on-chain with proper security audits and gas optimization.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Success Message */
          <div className="rounded-2xl border border-green-200 bg-green-50/70 p-8 shadow-sm backdrop-blur dark:border-green-800 dark:bg-green-900/20">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
                  🎉 Token Launched Successfully!
                </h2>
                <p className="text-green-700 dark:text-green-300">
                  Your token is now live on the blockchain
                </p>
              </div>

              <div className="w-full max-w-md space-y-3 text-left bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-green-300 dark:border-green-700">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Token Name:</span>
                  <p className="font-semibold">{launchSuccess.tokenName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Symbol:</span>
                  <p className="font-semibold">{launchSuccess.tokenSymbol}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Supply:</span>
                  <p className="font-semibold">{launchSuccess.totalSupply}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Contract Address:</span>
                  <p className="font-mono text-xs break-all">{launchSuccess.tokenAddress}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">TX Hash:</span>
                  <p className="font-mono text-xs break-all">{launchSuccess.txHash}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setLaunchSuccess(null);
                    setFormData({
                      tokenName: '',
                      tokenSymbol: '',
                      totalSupply: '',
                      decimals: '18',
                      description: '',
                    });
                  }}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Launch Another Token
                </Button>
                <Link to="/">
                  <Button variant="outline">
                    Go to Swap
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-8 rounded-2xl border border-black/5 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
          <h3 className="font-bold text-lg mb-4">How It Works</h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xs">1</span>
              <p><strong>Fill in token details:</strong> Name, symbol, supply, and decimals</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xs">2</span>
              <p><strong>Pay launch fee:</strong> One-time {LAUNCH_FEE} ETH fee for deployment</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xs">3</span>
              <p><strong>Token is deployed:</strong> ERC-20 contract deployed via Factory</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xs">4</span>
              <p><strong>Add liquidity (optional):</strong> Create trading pairs on Uniswap/PancakeSwap</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xs">5</span>
              <p><strong>Start trading:</strong> Your token is live and tradable!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LaunchpadPage;
