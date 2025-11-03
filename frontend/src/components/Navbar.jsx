import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButtonWithHistory from './WalletButtonWithHistory';
import NetworkSelectorDropdown from './NetworkSelectorDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar = ({ selectedChain, onChainChange }) => {
  const { t } = useTranslation();
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { publicKey: solanaAddress, connected: solanaConnected } = useWallet();

  return (
    <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <span className="text-xl">🚀</span>
            </div>
            <div className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent sm:text-2xl">
              SwapLaunch v2.0
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link className="opacity-80 hover:opacity-100" to="/">{t('nav.trade')}</Link>
            <Link className="opacity-80 hover:opacity-100" to="/projects">{t('nav.projects')}</Link>
            <Link className="opacity-80 hover:opacity-100" to="/launchpad">{t('nav.launchpad')}</Link>
            <Link className="opacity-80 hover:opacity-100" to="/token-locker">{t('nav.tokenLocker')}</Link>
            <Link className="opacity-80 hover:opacity-100" to="/limit-orders">{t('nav.limitDCA')}</Link>
            <Link className="opacity-80 hover:opacity-100" to="/bridge">{t('nav.bridge')}</Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Network Selector */}
            {selectedChain !== undefined && onChainChange && (
              <NetworkSelectorDropdown
                selectedChain={selectedChain}
                onChainChange={onChainChange}
              />
            )}
            
            {/* Wallet Button */}
            {selectedChain === 0 ? (
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-indigo-600 !rounded-xl !px-4 !py-2 !text-sm" />
            ) : (
              <WalletButtonWithHistory />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
