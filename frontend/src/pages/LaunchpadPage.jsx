import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useWalletClient } from 'wagmi';
import { ArrowLeft, Rocket, Shield, TrendingUp, Coins, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const LaunchpadPage = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [formData, setFormData] = useState({
    // Chain selection
    selectedChain: 1, // Default Ethereum
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    decimals: '18',
    description: '',
    tokenImage: null,
    imagePreview: null,
    // Additional revenue features
    enableAntiBot: false,
    enableLiquidityLock: false,
    lockDuration: '30', // days
    maxWalletPercent: '2', // % of supply
  });

  // Chain configurations
  const chains = [
    { id: 1, name: 'Ethereum', logo: '⟠', standard: 'ERC-20', decimals: 18 },
    { id: 56, name: 'BNB Chain', logo: '🟡', standard: 'BEP-20', decimals: 18 },
    { id: 137, name: 'Polygon', logo: '🟣', standard: 'ERC-20', decimals: 18 },
    { id: 42161, name: 'Arbitrum', logo: '🔵', standard: 'ERC-20', decimals: 18 },
    { id: 8453, name: 'Base', logo: '🔷', standard: 'ERC-20', decimals: 18 },
    { id: 43114, name: 'Avalanche', logo: '🔺', standard: 'ERC-20', decimals: 18 },
    { id: 0, name: 'Solana', logo: '◎', standard: 'SPL', decimals: 9 }
  ];

  const selectedChainData = chains.find(c => c.id === formData.selectedChain) || chains[0];

  const [launching, setLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(null);
  const [estimatedFee, setEstimatedFee] = useState({ eth: '0.025', usd: '25' }); // Dynamic based on gas
  const [selectedChain, setSelectedChain] = useState(1); // For Navbar

  // Estimate fee based on current gas prices (simplified)
  useEffect(() => {
    const estimateGasFee = async () => {
      // In production, fetch real gas prices from etherscan or similar
      // For now, simulate dynamic pricing between 20-50 EUR
      const baseFeEth = 0.02;
      const additionalFees = 
        (formData.enableAntiBot ? 0.005 : 0) +
        (formData.enableLiquidityLock ? 0.01 : 0);
      
      const totalEth = baseFeEth + additionalFees;
      const estimatedUsd = (totalEth * 1250).toFixed(0); // ETH @ ~1250 USD
      
      setEstimatedFee({ eth: totalEth.toFixed(3), usd: estimatedUsd });
    };
    
    estimateGasFee();
  }, [formData.enableAntiBot, formData.enableLiquidityLock]);

  const LAUNCH_FEE = estimatedFee.eth; // Dynamic fee

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleChainSelect = (chainId) => {
    const chain = chains.find(c => c.id === chainId);
    setFormData(prev => ({
      ...prev,
      selectedChain: chainId,
      decimals: chain.decimals.toString()
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          tokenImage: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      {/* Navbar */}
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

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
              {/* Chain Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Select Blockchain <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {chains.map((chain) => (
                    <button
                      key={chain.id}
                      type="button"
                      onClick={() => handleChainSelect(chain.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.selectedChain === chain.id
                          ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{chain.logo}</div>
                      <div className="text-sm font-semibold dark:text-white">{chain.name}</div>
                      <div className="text-xs text-gray-500">{chain.standard}</div>
                    </button>
                  ))}
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <div className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Selected:</strong> {selectedChainData.name} ({selectedChainData.standard})
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Estimated Gas: ~$2-5
                  </div>
                </div>
              </div>

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

              {/* Token Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Token Image <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  {formData.imagePreview ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500">
                      <img 
                        src={formData.imagePreview} 
                        alt="Token preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tokenImage: null, imagePreview: null }))}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">📷</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="tokenImage"
                    />
                    <label
                      htmlFor="tokenImage"
                      className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm font-medium"
                    >
                      Choose Image
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Advanced Features */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold mb-3">🚀 Advanced Features (Extra Fees Apply)</h3>
                
                {/* Anti-Bot Protection */}
                <div className="flex items-start gap-3 mb-3 p-3 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="enableAntiBot"
                    checked={formData.enableAntiBot}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4"
                    id="antiBot"
                  />
                  <div className="flex-1">
                    <label htmlFor="antiBot" className="font-medium cursor-pointer">
                      Anti-Bot Protection (+0.005 ETH ≈ $6)
                    </label>
                    <p className="text-xs text-gray-600">
                      Prevents bot sniping during launch with transaction limits
                    </p>
                  </div>
                </div>

                {/* Liquidity Lock */}
                <div className="flex items-start gap-3 mb-3 p-3 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="enableLiquidityLock"
                    checked={formData.enableLiquidityLock}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4"
                    id="liquidityLock"
                  />
                  <div className="flex-1">
                    <label htmlFor="liquidityLock" className="font-medium cursor-pointer">
                      Liquidity Lock (+0.01 ETH ≈ $13)
                    </label>
                    <p className="text-xs text-gray-600">
                      Automatically locks liquidity to prevent rug pulls
                    </p>
                    {formData.enableLiquidityLock && (
                      <select
                        name="lockDuration"
                        value={formData.lockDuration}
                        onChange={handleInputChange}
                        className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-gray-300"
                      >
                        <option value="30">30 Days</option>
                        <option value="90">90 Days</option>
                        <option value="180">180 Days</option>
                        <option value="365">1 Year</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Max Wallet Limit */}
                <div className="p-3 rounded-lg bg-gray-50">
                  <label className="block font-medium mb-2">
                    Max Wallet Limit (% of supply)
                  </label>
                  <input
                    type="number"
                    name="maxWalletPercent"
                    value={formData.maxWalletPercent}
                    onChange={handleInputChange}
                    min="0.1"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Prevents whales from holding too much. Recommended: 2-5%
                  </p>
                </div>
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
                      Total Launch Fee: {LAUNCH_FEE} ETH (~${estimatedFee.usd})
                    </p>
                    <div className="text-blue-700 dark:text-blue-300 space-y-1">
                      <p>• Base Fee: 0.02 ETH (~$25)</p>
                      {formData.enableAntiBot && <p>• Anti-Bot: +0.005 ETH (~$6)</p>}
                      {formData.enableLiquidityLock && <p>• Liquidity Lock: +0.01 ETH (~$13)</p>}
                      <p className="mt-2 text-xs">
                        Fee adjusts based on current gas prices (€20-50 range)
                      </p>
                    </div>
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
