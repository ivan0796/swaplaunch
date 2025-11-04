import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { Rocket, CheckCircle, Info, Sparkles, Shield, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';
import { PRICING, calculateLaunchCost, fetchCryptoPrices } from '../config/pricing';
import analytics from '../lib/analytics';
import LaunchStatusBar from '../components/LaunchStatusBar';
import LaunchSuccessLinks from '../components/LaunchSuccessLinks';
import UserActionPrompt from '../components/UserActionPrompt';
import { VISIBILITY } from '../config/visibility';

const TokenCreatorPageV2 = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Pump.fun Launch Tracking
  const [launchFlow, setLaunchFlow] = useState('pump'); // 'pump' or 'direct'
  const [launchStage, setLaunchStage] = useState(null); // null, 'created', 'bonding', 'migrated', 'lp_added', 'first_trade'
  const [mintAddress, setMintAddress] = useState('');
  const [pairAddress, setPairAddress] = useState('');
  
  // Form State
  const [selectedChain, setSelectedChain] = useState(1);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [decimals, setDecimals] = useState('18');
  const [description, setDescription] = useState('');
  
  // Token Metadata (Optional)
  const [tokenImage, setTokenImage] = useState('');
  const [tokenImagePreview, setTokenImagePreview] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  
  // Advanced Settings
  const [featureBoost, setFeatureBoost] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [lockDuration, setLockDuration] = useState('30'); // days
  
  // Deployment
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedToken, setDeployedToken] = useState(null);

  const chains = [
    { 
      id: 1, 
      name: 'Ethereum', 
      symbol: 'ETH', 
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      standard: 'ERC-20', 
      decimals: 18 
    },
    { 
      id: 56, 
      name: 'BNB Chain', 
      symbol: 'BNB', 
      logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
      standard: 'BEP-20', 
      decimals: 18 
    },
    { 
      id: 137, 
      name: 'Polygon', 
      symbol: 'MATIC', 
      logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
      standard: 'ERC-20', 
      decimals: 18 
    },
    { 
      id: 42161, 
      name: 'Arbitrum', 
      symbol: 'ETH', 
      logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
      standard: 'ERC-20', 
      decimals: 18 
    },
    { 
      id: 8453, 
      name: 'Base', 
      symbol: 'ETH', 
      logo: 'https://cryptologos.cc/logos/base-logo.png',
      standard: 'ERC-20', 
      decimals: 18 
    },
    { 
      id: 43114, 
      name: 'Avalanche', 
      symbol: 'AVAX', 
      logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
      standard: 'ERC-20', 
      decimals: 18 
    },
    { 
      id: 0, 
      name: 'Solana', 
      symbol: 'SOL', 
      logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
      standard: 'SOL', 
      decimals: 9 
    }
  ];

  const selectedChainData = chains.find(c => c.id === selectedChain) || chains[0];

  // Calculate costs live with crypto prices
  const [launchCost, setLaunchCost] = useState(null);
  const [cryptoPrices, setCryptoPrices] = useState(null);
  const [priceUpdateTime, setPriceUpdateTime] = useState(null);
  
  // Fetch crypto prices on mount and every 5 minutes
  useEffect(() => {
    const fetchPrices = async () => {
      const prices = await fetchCryptoPrices();
      setCryptoPrices(prices);
      setPriceUpdateTime(new Date());
    };
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  // Recalculate costs when chain, boost, or prices change
  useEffect(() => {
    if (cryptoPrices) {
      const cost = calculateLaunchCost(selectedChainData.name.toLowerCase(), 30, featureBoost, cryptoPrices);
      setLaunchCost(cost);
    }
  }, [selectedChain, featureBoost, cryptoPrices]);
  
  // Poll pump.fun token status if launched
  useEffect(() => {
    if (!mintAddress || !launchFlow === 'pump') return;
    
    const pollStatus = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/pump/status/${mintAddress}`);
        const data = await response.json();
        
        if (data.found) {
          setLaunchStage(data.stage);
          if (data.pair_address) {
            setPairAddress(data.pair_address);
          }
        }
      } catch (error) {
        console.error('Error polling pump status:', error);
      }
    };
    
    // Poll every 10 seconds
    const interval = setInterval(pollStatus, 10000);
    pollStatus(); // Initial call
    
    return () => clearInterval(interval);
  }, [mintAddress, launchFlow]);
  
  // Handle user manual action completion
  const handleUserActionComplete = async (stage) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      await fetch(`${backendUrl}/api/pump/mark-stage?mint=${mintAddress}&stage=${stage}`, {
        method: 'POST'
      });
      setLaunchStage(stage);
      toast.success(`${stage === 'lp_added' ? 'Liquidity Added' : 'First Trade'} marked as complete!`);
    } catch (error) {
      console.error('Error marking stage:', error);
      toast.error('Failed to update status');
    }
  };

  // Track page open
  useEffect(() => {
    analytics.tokenLaunchOpened();
  }, []);

  // Steps Definition
  const steps = [
    { number: 1, title: t('launch.step1'), key: 'details' },
    { number: 2, title: t('launch.step2'), key: 'settings' },
    { number: 3, title: t('launch.step3'), key: 'liquidity' },
    { number: 4, title: t('launch.step4'), key: 'confirm' }
  ];

  // Validation
  const canProceed = () => {
    if (currentStep === 1) {
      return tokenName && tokenSymbol && totalSupply && parseFloat(totalSupply) > 0;
    }
    if (currentStep === 2) {
      return true; // Optional settings
    }
    if (currentStep === 3) {
      return true; // Liquidity optional
    }
    return true;
  };

  const handleNextStep = () => {
    if (canProceed()) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      analytics.tokenLaunchStep(nextStep);
    } else {
      toast.error('Please fill all required fields');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleScrollToForm = () => {
    document.getElementById('launch-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConfirmClick = () => {
    analytics.tokenLaunchConfirmClick(tokenName);
    setShowConfirmDialog(true);
  };

  const handleDeploy = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsDeploying(true);
    setShowConfirmDialog(false);

    try {
      // For Solana (pump.fun), guide user to create token on pump.fun
      if (selectedChainData.id === 0) {
        // Generate a mock Solana address for demo
        const mockMint = 'PUMP' + Math.random().toString(36).substring(2, 15).toUpperCase();
        
        setMintAddress(mockMint);
        setLaunchFlow('pump');
        setLaunchStage('created');
        
        // Start tracking
        const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
        await fetch(`${backendUrl}/api/pump/track?mint=${mockMint}`, {
          method: 'POST'
        });
        
        analytics.tokenLaunchSuccess(mockMint, 'Solana/pump.fun');
        toast.success(`🎉 ${tokenName} launched on pump.fun!`);
        
        // Show info modal
        toast.info('Your token is now on pump.fun bonding curve. Waiting for migration to Raydium...', {
          duration: 10000
        });
        
      } else {
        // EVM chains - simulate deployment
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);
        setDeployedToken({
          address: mockAddress,
          name: tokenName,
          symbol: tokenSymbol,
          chain: selectedChainData.name
        });

        analytics.tokenLaunchSuccess(mockAddress, selectedChainData.name);
        toast.success(`🎉 ${tokenName} deployed successfully!`);
        
        // Reset form after delay
        setTimeout(() => {
          setCurrentStep(1);
          setTokenName('');
          setTokenSymbol('');
          setTotalSupply('');
          setDeployedToken(null);
        }, 5000);
      }
      
    } catch (error) {
      console.error('Deployment error:', error);
      analytics.tokenLaunchFail(error.message);
      toast.error('Deployment failed. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <HeaderSlim />

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          {/* Trust Bullets */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium dark:text-white">{t('hero.trustBullet1')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium dark:text-white">{t('hero.trustBullet2')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium dark:text-white">{t('hero.trustBullet3')}</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={handleScrollToForm}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
            >
              <img 
                src="https://customer-assets.emergentagent.com/job_9c53c1f9-10f1-41e7-a7c4-12afcbaf39e9/artifacts/q1ccyq6i_ChatGPT%20Image%204.%20Nov.%202025%2C%2009_26_52.png"
                alt="Rocket"
                className="w-12 h-12 mr-2 object-contain"
              />
              {t('cta.startToken')}
            </Button>
            <Button
              onClick={() => setShowDemoModal(true)}
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg"
            >
              {t('cta.demo')}
            </Button>
          </div>
        </div>
      </section>

      {/* Launch Status & Success Links */}
      {launchStage && (
        <section className="py-6 px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <LaunchStatusBar 
              flow={launchFlow}
              stage={launchStage}
              mint={mintAddress}
              pair={pairAddress}
            />
            
            <UserActionPrompt 
              stage={launchStage}
              mint={mintAddress}
              pair={pairAddress}
              onActionComplete={handleUserActionComplete}
            />
            
            {launchStage === 'first_trade' && (
              <LaunchSuccessLinks 
                mint={mintAddress}
                pair={pairAddress}
              />
            )}
          </div>
        </section>
      )}

      {/* Main Launch Section */}
      <section id="launch-form" className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Progress Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {steps.map((step, idx) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        currentStep >= step.number
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {currentStep > step.number ? <CheckCircle className="w-6 h-6" /> : step.number}
                    </div>
                    <span
                      className={`text-sm mt-2 text-center ${
                        currentStep >= step.number
                          ? 'text-gray-900 dark:text-white font-semibold'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-16 md:w-32 h-1 mx-2 ${
                        currentStep > step.number
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                {/* Step 1: Token Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold mb-6 dark:text-white">{t('launch.step1')}</h3>

                    {/* Chain Selector */}
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Blockchain
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {chains.map((chain) => (
                          <button
                            key={chain.id}
                            onClick={() => {
                              setSelectedChain(chain.id);
                              setDecimals(chain.decimals.toString());
                            }}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              selectedChain === chain.id
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-3xl mb-2">{chain.logo}</div>
                            <div className="text-sm font-semibold dark:text-white">{chain.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{chain.standard}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Token Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Token Name *
                      </label>
                      <Input
                        placeholder="e.g., My Token"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    {/* Token Symbol */}
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Token Symbol *
                      </label>
                      <Input
                        placeholder="e.g., MTK"
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                        maxLength={10}
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    {/* Total Supply */}
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Total Supply *
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 1000000"
                        value={totalSupply}
                        onChange={(e) => setTotalSupply(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    {/* Decimals */}
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Decimals
                      </label>
                      <Input
                        type="number"
                        value={decimals}
                        onChange={(e) => setDecimals(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600"
                        disabled
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Standard for {selectedChainData.standard}
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Fees & Settings */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold mb-6 dark:text-white">{t('launch.step2')}</h3>

                    {/* Token Image (Optional) */}
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Token Logo (Optional)
                      </label>
                      <div className="flex items-center gap-4">
                        {tokenImagePreview && (
                          <img 
                            src={tokenImagePreview} 
                            alt="Token preview" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                          />
                        )}
                        <Input
                          type="url"
                          placeholder="https://example.com/logo.png"
                          value={tokenImage}
                          onChange={(e) => {
                            setTokenImage(e.target.value);
                            setTokenImagePreview(e.target.value);
                          }}
                          className="flex-1 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Recommended: 512x512px, PNG or JPG
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Description (Optional)
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                        rows={4}
                        placeholder="Tell users about your token..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    {/* Social Media Links (Optional) */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                        Social Media Links (Optional)
                      </h4>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">
                          🌐 Website
                        </label>
                        <Input
                          type="url"
                          placeholder="https://yourproject.com"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1 dark:text-gray-400">
                            📱 TikTok
                          </label>
                          <Input
                            type="url"
                            placeholder="https://tiktok.com/@username"
                            value={tiktokUrl}
                            onChange={(e) => setTiktokUrl(e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1 dark:text-gray-400">
                            📷 Instagram
                          </label>
                          <Input
                            type="url"
                            placeholder="https://instagram.com/username"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1 dark:text-gray-400">
                            💬 Discord
                          </label>
                          <Input
                            type="url"
                            placeholder="https://discord.gg/invite"
                            value={discordUrl}
                            onChange={(e) => setDiscordUrl(e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1 dark:text-gray-400">
                            ✈️ Telegram
                          </label>
                          <Input
                            type="url"
                            placeholder="https://t.me/username"
                            value={telegramUrl}
                            onChange={(e) => setTelegramUrl(e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Feature Boost */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="feature-boost"
                          checked={featureBoost}
                          onCheckedChange={setFeatureBoost}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="feature-boost"
                            className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 cursor-pointer flex items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            {t('launch.featureBoost')}
                          </label>
                          <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-1">
                            Your token will be promoted in Trending section and mentioned on social media
                          </p>
                          <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200 mt-2">
                            +€{PRICING.featureBoostEUR}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* DEX Listing Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900 dark:text-blue-200">
                          <p className="font-semibold mb-1">📊 DEX Listings Info</p>
                          <ul className="text-xs space-y-1 list-disc list-inside">
                            <li><strong>DexScreener:</strong> Crawlt automatisch neue Tokens (meist innerhalb von 5-10 Minuten)</li>
                            <li><strong>pump.fun & axiom.pro:</strong> Separate Plattformen - manuelle Registrierung erforderlich</li>
                            <li>Optional: Submit-Formular auf dexscreener.com für schnellere Indexierung</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Liquidity */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold mb-6 dark:text-white">{t('launch.step3')}</h3>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900 dark:text-blue-200">
                          <p className="font-semibold mb-1">Optional: Add Liquidity</p>
                          <p>You can add liquidity now or skip and do it later via DEX</p>
                        </div>
                      </div>
                    </div>

                    {/* Liquidity Amount */}
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Initial Liquidity ({selectedChainData.symbol})
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={liquidityAmount}
                        onChange={(e) => setLiquidityAmount(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    {/* Lock Duration */}
                    {liquidityAmount && parseFloat(liquidityAmount) > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                          Lock Duration (Days)
                        </label>
                        <Input
                          type="number"
                          placeholder="30"
                          value={lockDuration}
                          onChange={(e) => setLockDuration(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Recommended: 30-90 days
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Confirm */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold mb-6 dark:text-white">{t('launch.step4')}</h3>

                    {/* Summary */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Token Name</span>
                        <span className="font-semibold dark:text-white">{tokenName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Symbol</span>
                        <span className="font-semibold dark:text-white">{tokenSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Supply</span>
                        <span className="font-semibold dark:text-white">{totalSupply}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Chain</span>
                        <span className="font-semibold dark:text-white">{selectedChainData.name}</span>
                      </div>
                      {featureBoost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Feature Boost</span>
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">✓ Enabled</span>
                        </div>
                      )}
                    </div>

                    {/* Warning */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-900 dark:text-orange-200">
                          <p className="font-semibold mb-1">Review Before Launch</p>
                          <p>Token contracts cannot be modified after deployment. Please double-check all details.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  {currentStep < 4 ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={!canProceed()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConfirmClick}
                      disabled={!isConnected}
                      className="bg-gradient-to-r from-green-600 to-green-700"
                    >
                      {isConnected ? 'Launch Token 🚀' : 'Connect Wallet'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Price Box (Sidebar) */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-20">
                <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  {t('launch.priceBox.title')}
                </h4>

                {launchCost && (
                  <div className="space-y-3">
                    {Object.entries(launchCost.breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{key}</span>
                        <span className="font-semibold dark:text-white">{value}</span>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold dark:text-white">{t('launch.priceBox.total')}</span>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          {launchCost.total.toFixed(4)} {launchCost.nativeCurrency}
                        </span>
                      </div>
                    </div>

                    {/* Live Update Indicator */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-4">
                      <Clock className="w-3 h-3" />
                      <span>Live pricing • Updates automatically</span>
                    </div>
                  </div>
                )}

                {/* Security Note */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p>
                      All contracts are verified on blockchain explorer. Non-custodial - you control everything.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cta.demo')}</DialogTitle>
            <DialogDescription>
              Watch how easy it is to launch a token on SwapLaunch
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Demo video coming soon</p>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 Tip: Try on testnet first to familiarize yourself
          </p>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('launch.confirmDialog.title')}</DialogTitle>
            <DialogDescription>
              Review costs and deploy your token
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h5 className="font-semibold mb-3 dark:text-white">{t('launch.confirmDialog.breakdown')}</h5>
              {launchCost && (
                <div className="space-y-2 text-sm">
                  {Object.entries(launchCost.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{key}</span>
                      <span className="font-semibold dark:text-white">{value}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span className="dark:text-white">Total</span>
                      <span className="text-green-600 dark:text-green-400">
                        {launchCost.total.toFixed(4)} {launchCost.nativeCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <div className="flex items-start gap-2 text-xs text-blue-900 dark:text-blue-200">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>{t('launch.confirmDialog.security')}:</strong> Contract will be verified automatically. 
                  View full details in <a href="/security" className="underline">Security Page</a>
                </p>
              </div>
            </div>

            <Button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
            >
              {isDeploying ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <img 
                    src="https://customer-assets.emergentagent.com/job_9c53c1f9-10f1-41e7-a7c4-12afcbaf39e9/artifacts/q1ccyq6i_ChatGPT%20Image%204.%20Nov.%202025%2C%2009_26_52.png"
                    alt="Rocket"
                    className="w-7 h-7 mr-2 object-contain"
                  />
                  Confirm & Deploy
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Message */}
      {deployedToken && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white rounded-xl shadow-2xl p-6 max-w-sm z-50">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="font-bold mb-1">Token Deployed! 🎉</h4>
              <p className="text-sm opacity-90 mb-2">{deployedToken.name} on {deployedToken.chain}</p>
              <p className="text-xs font-mono bg-white/20 px-2 py-1 rounded">
                {deployedToken.address.slice(0, 10)}...{deployedToken.address.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TokenCreatorPageV2;
