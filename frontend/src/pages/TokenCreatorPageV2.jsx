import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { Rocket, CheckCircle, Info, Sparkles, Shield, Clock, DollarSign, AlertCircle, Share2, Copy, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';
import FeaturedTokens from '../components/FeaturedTokens';
import { PRICING, calculateLaunchCost, fetchCryptoPrices } from '../config/pricing';
import analytics from '../lib/analytics';
import LaunchStatusBar from '../components/LaunchStatusBar';
import LaunchSuccessLinks from '../components/LaunchSuccessLinks';
import UserActionPrompt from '../components/UserActionPrompt';
import ChainLogo from '../components/ChainLogo';
import ManualPairInput from '../components/ManualPairInput';
import IndexingLatencyNotice from '../components/IndexingLatencyNotice';
import NonCustodialDisclaimer from '../components/NonCustodialDisclaimer';
import ImageDropzone from '../components/ImageDropzone';
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
  const [showManualInput, setShowManualInput] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Form State
  const [selectedChain, setSelectedChain] = useState(1);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [decimals, setDecimals] = useState('18');
  const [description, setDescription] = useState('');
  
  // Token Metadata
  const [tokenImage, setTokenImage] = useState('');
  const [tokenImageFile, setTokenImageFile] = useState(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  
  // Test Mode
  const [testMode, setTestMode] = useState(true); // Enable test mode by default
  
  // Advanced Settings
  const [featureBoost, setFeatureBoost] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [lockDuration, setLockDuration] = useState('30'); // days
  
  // Deployment
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedToken, setDeployedToken] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const chains = [
    { 
      id: 1, 
      name: 'Ethereum', 
      symbol: 'ETH', 
      color: 'from-gray-600 to-gray-800',
      standard: 'ERC-20', 
      decimals: 18 
    },
    { 
      id: 56, 
      name: 'BNB Chain', 
      symbol: 'BNB', 
      color: 'from-yellow-400 to-yellow-600',
      standard: 'BEP-20', 
      decimals: 18 
    },
    { 
      id: 137, 
      name: 'Polygon', 
      symbol: 'MATIC', 
      color: 'from-purple-500 to-purple-700',
      standard: 'ERC-20', 
      decimals: 18 
    },
    { 
      id: 42161, 
      name: 'Arbitrum', 
      symbol: 'ARB', 
      color: 'from-blue-400 to-blue-600',
      standard: 'ERC-20', 
      decimals: 18 
    },
    { 
      id: 8453, 
      name: 'Base', 
      symbol: 'BASE', 
      color: 'from-blue-500 to-blue-700',
      standard: 'ERC-20', 
      decimals: 18 
    },
    { 
      id: 43114, 
      name: 'Avalanche', 
      symbol: 'AVAX', 
      color: 'from-red-500 to-red-700',
      standard: 'ERC-20', 
      decimals: 18 
    },
    { 
      id: 0, 
      name: 'Solana', 
      symbol: 'SOL', 
      color: 'from-purple-400 to-pink-500',
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
    if (!mintAddress || launchFlow !== 'pump') return;
    
    let pollCount = 0;
    const MAX_POLLS_BEFORE_MANUAL = 9; // 90 seconds (9 x 10s)
    
    const pollStatus = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/pump/status/${mintAddress}`);
        const data = await response.json();
        
        if (data.found) {
          setLaunchStage(data.stage);
          if (data.pair_address) {
            setPairAddress(data.pair_address);
            setShowManualInput(false); // Hide manual input if auto-detected
          }
        }
        
        pollCount++;
        if (pollCount >= MAX_POLLS_BEFORE_MANUAL && launchStage === 'bonding' && !pairAddress) {
          setTimeoutReached(true);
          console.warn('⏱️ Timeout reached - showing manual input option');
        }
      } catch (error) {
        console.error('❌ Error polling pump status:', error);
      }
    };
    
    // Poll every 10 seconds
    const interval = setInterval(pollStatus, 10000);
    pollStatus(); // Initial call
    
    return () => clearInterval(interval);
  }, [mintAddress, launchFlow, launchStage, pairAddress]);
  
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
  
  // Handle manual pair input
  const handleManualPairSubmit = async ({ mint, pair }) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/pump/manual-override?mint=${mint}&pair=${pair}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setMintAddress(mint);
        setPairAddress(pair);
        setLaunchStage('migrated');
        setShowManualInput(false);
        toast.success('✅ Pair address set manually - you can now add liquidity!');
      }
    } catch (error) {
      console.error('Error in manual override:', error);
      toast.error('Failed to set pair address');
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

  // Social Media Share Functions
  const getShareMessage = () => {
    if (!deployedToken) return '';
    return `🚀 Just launched ${deployedToken.name} ($${deployedToken.symbol}) on ${deployedToken.chain}!\n\nContract: ${deployedToken.address}\n\nCreated on LaunchSwap 💎`;
  };

  const getShareUrl = () => {
    if (!deployedToken) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/token/${deployedToken.address}`;
  };

  const handleShareTwitter = () => {
    const message = getShareMessage();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    const message = getShareMessage();
    const url = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareWhatsApp = () => {
    const message = getShareMessage();
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank');
  };

  const handleShareDiscord = () => {
    // Copy to clipboard for Discord (Discord doesn't have direct share API)
    const message = getShareMessage();
    navigator.clipboard.writeText(message);
    toast.success('Message copied! Paste it in Discord');
  };

  const handleCopyContract = () => {
    if (deployedToken) {
      navigator.clipboard.writeText(deployedToken.address);
      toast.success('Contract address copied!');
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Reset form
    setTimeout(() => {
      setCurrentStep(1);
      setTokenName('');
      setTokenSymbol('');
      setTotalSupply('');
      setDeployedToken(null);
      setTokenImage('');
      setTokenImageFile(null);
    }, 300);
  };

  const handleDeploy = async () => {
    // Validate required fields (skip image check in test mode)
    if (!testMode && !tokenImage) {
      toast.error('Token logo is required');
      return;
    }
    
    if (!testMode && !isConnected) {
      toast.error('Please connect your wallet or enable Test Mode');
      return;
    }

    setIsDeploying(true);
    setShowConfirmDialog(false);

    try {
      // Test Mode: Simulate deployment
      if (testMode) {
        toast.info('🧪 Test Mode: Simulating token deployment...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockAddress = selectedChainData.id === 0 
          ? 'TEST' + Math.random().toString(36).substring(2, 15).toUpperCase()
          : '0x' + Math.random().toString(16).slice(2, 42);
        
        setDeployedToken({
          address: mockAddress,
          name: tokenName,
          symbol: tokenSymbol,
          chain: selectedChainData.name
        });
        
        analytics.tokenLaunchSuccess(mockAddress, `${selectedChainData.name} (Test Mode)`);
        setShowSuccessModal(true);
        
        return;
      }
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
        
        // Show success modal
        setShowSuccessModal(true);
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
            {/* Non-Custodial Disclaimer */}
            <NonCustodialDisclaimer />
            
            {/* Status Bar */}
            <LaunchStatusBar 
              flow={launchFlow}
              stage={launchStage}
              mint={mintAddress}
              pair={pairAddress}
            />
            
            {/* Manual Input Option (after timeout) */}
            {timeoutReached && launchStage === 'bonding' && !pairAddress && (
              <ManualPairInput 
                onSubmit={handleManualPairSubmit}
                initialMint={mintAddress}
              />
            )}
            
            {/* User Action Prompts */}
            <UserActionPrompt 
              stage={launchStage}
              mint={mintAddress}
              pair={pairAddress}
              onActionComplete={handleUserActionComplete}
            />
            
            {/* Success Links & Indexing Notice */}
            {launchStage === 'first_trade' && (
              <>
                <IndexingLatencyNotice />
                <LaunchSuccessLinks 
                  mint={mintAddress}
                  pair={pairAddress}
                />
              </>
            )}
          </div>
        </section>
      )}

      {/* Featured Tokens Section */}
      <section className="py-8 px-4 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <FeaturedTokens />
        </div>
      </section>

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
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold dark:text-white">{t('launch.step1')}</h3>
                      
                      {/* Test Mode Toggle */}
                      <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <input
                          type="checkbox"
                          id="test-mode"
                          checked={testMode}
                          onChange={(e) => setTestMode(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label htmlFor="test-mode" className="text-sm font-medium text-yellow-900 dark:text-yellow-200 cursor-pointer">
                          🧪 Test Mode (No Wallet Required)
                        </label>
                      </div>
                    </div>

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
                            <div className="flex justify-center mb-2">
                              <ChainLogo chain={chain.name} size={48} />
                            </div>
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

                    {/* Token Logo Upload (Mandatory) */}
                    <ImageDropzone
                      onImageSelect={(preview, file) => {
                        setTokenImage(preview);
                        setTokenImageFile(file);
                      }}
                      maxSize={2}
                      required={true}
                    />

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
                      disabled={!testMode && !isConnected}
                      className="bg-gradient-to-r from-green-600 to-green-700"
                    >
                      {testMode ? 'Launch Test Token 🧪' : (isConnected ? 'Launch Token 🚀' : 'Connect Wallet')}
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

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle className="w-8 h-8 text-green-600" />
              Token erfolgreich erstellt! 🎉
            </DialogTitle>
            <DialogDescription>
              Ihr Token wurde erfolgreich deployed und ist nun live auf der Blockchain
            </DialogDescription>
          </DialogHeader>

          {deployedToken && (
            <div className="space-y-6">
              {/* Token Information */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold dark:text-white">{deployedToken.name}</h3>
                      <p className="text-lg text-gray-600 dark:text-gray-300">${deployedToken.symbol}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Chain</p>
                      <p className="font-semibold dark:text-white">{deployedToken.chain}</p>
                    </div>
                  </div>

                  {/* Contract Address */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contract Address</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyContract}
                        className="h-8"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Kopieren
                      </Button>
                    </div>
                    <p className="font-mono text-sm break-all text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                      {deployedToken.address}
                    </p>
                  </div>

                  {/* View on Explorer */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const explorerUrls = {
                        'Ethereum': `https://etherscan.io/address/${deployedToken.address}`,
                        'BNB Chain': `https://bscscan.com/address/${deployedToken.address}`,
                        'Polygon': `https://polygonscan.com/address/${deployedToken.address}`,
                        'Arbitrum': `https://arbiscan.io/address/${deployedToken.address}`,
                        'Base': `https://basescan.org/address/${deployedToken.address}`,
                        'Avalanche': `https://snowtrace.io/address/${deployedToken.address}`,
                        'Solana': `https://solscan.io/token/${deployedToken.address}`
                      };
                      const explorerUrl = explorerUrls[deployedToken.chain];
                      if (explorerUrl) window.open(explorerUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Im Explorer anzeigen
                  </Button>
                </div>
              </div>

              {/* Share Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-lg dark:text-white">Teilen Sie Ihren Token</h4>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* X/Twitter */}
                  <Button
                    variant="outline"
                    onClick={handleShareTwitter}
                    className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X / Twitter
                  </Button>

                  {/* Telegram */}
                  <Button
                    variant="outline"
                    onClick={handleShareTelegram}
                    className="flex items-center gap-2 bg-[#0088cc] text-white hover:bg-[#0077b3]"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.155.232.171.326.016.095.037.313.021.482z"/>
                    </svg>
                    Telegram
                  </Button>

                  {/* WhatsApp */}
                  <Button
                    variant="outline"
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-2 bg-[#25D366] text-white hover:bg-[#20BA5A]"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </Button>

                  {/* Facebook */}
                  <Button
                    variant="outline"
                    onClick={handleShareFacebook}
                    className="flex items-center gap-2 bg-[#1877F2] text-white hover:bg-[#166FE5]"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>

                  {/* Discord */}
                  <Button
                    variant="outline"
                    onClick={handleShareDiscord}
                    className="flex items-center gap-2 bg-[#5865F2] text-white hover:bg-[#4752C4]"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Discord
                  </Button>

                  {/* Reddit */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const message = getShareMessage();
                      const url = `https://www.reddit.com/submit?title=${encodeURIComponent(`${deployedToken.name} Launch`)}&text=${encodeURIComponent(message)}`;
                      window.open(url, '_blank');
                    }}
                    className="flex items-center gap-2 bg-[#FF4500] text-white hover:bg-[#E03D00]"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                    </svg>
                    Reddit
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseSuccessModal}
                  className="flex-1"
                >
                  Fenster schließen
                </Button>
                <Button
                  onClick={() => {
                    handleCloseSuccessModal();
                    // Navigate to swap page or portfolio
                    window.location.href = '/trade/swap';
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Zum Trading
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default TokenCreatorPageV2;
