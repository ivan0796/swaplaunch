import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAccount, useChainId } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';
import SwapFormV2 from '../components/SwapFormV2';
import SolanaSwapForm from '../components/SolanaSwapForm';
import TrendingTokensV2 from '../components/TrendingTokensV2';
import NewListings from '../components/NewListings';
import ReferralWidget from '../components/ReferralWidget';
import ReferralTeaser from '../components/ReferralTeaser';
import AdBanner from '../components/AdBanner';
import { toast } from 'sonner';

const SwapPageV2 = () => {
  const { t } = useTranslation();
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const chainId = useChainId();
  const { publicKey: solanaPublicKey, connected: solanaConnected } = useWallet();
  const [selectedChain, setSelectedChain] = useState(1);

  useEffect(() => {
    if (evmConnected && chainId) {
      setSelectedChain(chainId);
    }
  }, [chainId, evmConnected]);

  // Determine connection status based on selected chain
  const isConnected = selectedChain === 0 ? solanaConnected : evmConnected;
  const walletAddress = selectedChain === 0 
    ? (solanaPublicKey?.toString() || null) 
    : evmAddress;

  // Token selection handlers
  const handleTrendingTokenSelect = (token) => {
    toast.info(`Selected ${token.symbol}`, {
      description: 'Token info loaded. Connect wallet to trade.'
    });
    console.log('Trending token selected:', token);
  };

  const handleNewListingSelect = (token) => {
    toast.info(`New listing: ${token.symbol}`, {
      description: 'Check security before trading'
    });
    console.log('New listing selected:', token);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      {/* Header Component (consistent across all pages) */}
      <HeaderSlim />

      {/* Main Content */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-3">
        {/* Swap Section */}
        <section className="lg:col-span-2">
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight">{t('swap.title')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('swap.subtitle')}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
              {/* Swap Form */}
              <div>
                {selectedChain === 0 ? (
                  <SolanaSwapForm />
                ) : (
                  <SwapFormV2
                    chainId={selectedChain}
                    walletAddress={walletAddress}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Ad Banner */}
          <AdBanner position="banner" />

          {/* Trending Tokens V2 */}
          <TrendingTokensV2 onTokenSelect={handleTrendingTokenSelect} />

          {/* New Listings */}
          <NewListings 
            selectedChain={selectedChain}
            onTokenSelect={handleNewListingSelect} 
          />

          {/* Referral Teaser */}
          <ReferralTeaser />

          {/* Features Card */}
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">{t('features.title')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('features.subtitle')}</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>{t('features.security')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>{t('features.bestRates')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>{t('features.multiChain')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>{t('features.tokenSearch')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>{t('features.transparentFees')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>{t('features.referral')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Security Notice */}
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">🔒 Security First</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your safety matters</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-amber-500">⚠️</div>
                  <div>
                    <div className="font-medium mb-1">Token Security Scanner</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      Automatically detects honeypots, scams, and risky tokens using GoPlus Security API
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-blue-500">🛡️</div>
                  <div>
                    <div className="font-medium mb-1">Secure Transactions</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      Your private keys never leave your wallet. Sign all transactions directly.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-purple-500">🔍</div>
                  <div>
                    <div className="font-medium mb-1">Transparent</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      All fees displayed upfront. No hidden charges.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SwapPageV2;
