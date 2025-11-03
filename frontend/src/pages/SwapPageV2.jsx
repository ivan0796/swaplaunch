import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useChainId } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '../components/Navbar';
import SwapFormV2 from '../components/SwapFormV2';
import SolanaSwapForm from '../components/SolanaSwapForm';
import TrendingTokensV2 from '../components/TrendingTokensV2';
import NewListings from '../components/NewListings';
import ReferralWidget from '../components/ReferralWidget';
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
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(129,140,248,.25),transparent),radial-gradient(800px_500px_at_80%_0%,rgba(16,185,129,.18),transparent)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 text-white text-lg">
              🚀
            </div>
            <div className="text-sm font-semibold tracking-tight">SwapLaunch v2.0</div>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link className="opacity-80 hover:opacity-100" to="/">{t('nav.trade')}</Link>
            <Link className="opacity-80 hover:opacity-100" to="/projects">{t('nav.projects')}</Link>
            <Link className="opacity-80 hover:opacity-100" to="/launchpad">{t('nav.launchpad')}</Link>
            <Link className="opacity-80 hover:opacity-100" to="/token-locker">{t('nav.tokenLocker')}</Link>
            <Link className="opacity-80 hover:opacity-100" to="/limit-orders">{t('nav.limitDCA')}</Link>
            <Link className="opacity-80 hover:opacity-100" to="/bridge">{t('nav.bridge')}</Link>
          </nav>
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />
            {/* Network Selector in Header */}
            <NetworkSelectorDropdown
              selectedChain={selectedChain}
              onChainChange={setSelectedChain}
            />
            <SwapHistoryModal />
            {isConnected && <ReferralWidget walletAddress={walletAddress} />}
            {selectedChain === 0 ? (
              <WalletMultiButton />
            ) : (
              <WalletButtonWithHistory />
            )}
          </div>
        </div>
      </header>

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
                  <span>{t('features.nonCustodial')}</span>
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
                    <div className="font-medium mb-1">Non-Custodial</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      Your private keys never leave your wallet. We never have access to your funds.
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
      <footer className="border-t border-black/5 bg-white/60 py-8 text-sm text-gray-500 backdrop-blur dark:border-white/10 dark:bg-gray-900/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div>© {new Date().getFullYear()} SwapLaunch. Non-custodial swaps powered by 0x & Jupiter.</div>
          <div className="flex items-center gap-4">
            <Link className="hover:underline" to="/risk-disclosure">Risk Disclosure</Link>
            <a className="hover:underline cursor-pointer" href="#">Docs</a>
            <a className="hover:underline cursor-pointer" href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SwapPageV2;
