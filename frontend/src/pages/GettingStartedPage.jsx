import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';
import { Wallet, ArrowRightLeft, Rocket, Gift, Shield, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';

const GettingStartedPage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Wallet,
      title: '1. Connect Your Wallet',
      description: 'Connect MetaMask, WalletConnect, or Phantom. SwapLaunch is 100% non-custodial - we never hold your funds.',
      action: 'Connect Wallet',
      link: '/trade/swap'
    },
    {
      icon: ArrowRightLeft,
      title: '2. Swap Tokens',
      description: 'Trade tokens across Ethereum, BSC, Polygon, and Solana. Fees: 0.25% + DEX fees. MEV protection available.',
      action: 'Start Swapping',
      link: '/trade/swap'
    },
    {
      icon: Rocket,
      title: '3. Launch Your Token',
      description: 'Deploy your token in minutes. Fees: ETH 0.03 (~$93-124) | BNB 0.1 (~$62) | MATIC 50 (~$30) | SOL 0.5 (~$85)',
      action: 'Launch Token',
      link: '/launch'
    },
    {
      icon: Gift,
      title: '4. Use Referral Code',
      description: 'Got a referral code? Redeem it for a free first swap! Check your wallet dropdown to get your own referral code.',
      action: 'View Referrals',
      link: '/earn/referrals'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Non-Custodial',
      description: 'Your keys, your crypto. We never hold your funds.'
    },
    {
      icon: Zap,
      title: 'Multi-Chain',
      description: 'Swap and launch on Ethereum, BSC, Polygon, Solana, and more.'
    },
    {
      icon: Gift,
      title: 'Referral Rewards',
      description: 'Earn rewards by inviting friends. Free first swap for new users!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <HeaderSlim />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Getting Started with SwapLaunch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your non-custodial gateway to multi-chain DeFi
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 dark:text-white">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(step.link)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {step.action}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Why SwapLaunch?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center"
                >
                  <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Swap Fees</h3>
              <ul className="space-y-2 text-white/90">
                <li>• Platform: 0.25% (25 basis points)</li>
                <li>• DEX fees: Varies by route</li>
                <li>• Gas: Network-dependent</li>
                <li>• MEV Protection: Optional</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Launch Fees</h3>
              <ul className="space-y-2 text-white/90">
                <li>• Ethereum: 0.03 ETH (~$93-124)</li>
                <li>• BNB Chain: 0.1 BNB (~$62)</li>
                <li>• Polygon: 50 MATIC (~$30)</li>
                <li>• Solana: 0.5 SOL (~$85)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => navigate('/trade/swap')}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
          >
            Start Trading Now
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GettingStartedPage;
