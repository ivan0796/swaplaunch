import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButtonWithHistory from './WalletButtonWithHistory';
import NetworkSelectorDropdown from './NetworkSelectorDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import GasTracker from './GasTracker';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ChevronDown, Zap, TrendingUp, Rocket, Gift } from 'lucide-react';

const Navbar = ({ selectedChain, onChainChange }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { publicKey: solanaAddress, connected: solanaConnected } = useWallet();
  const [openMenu, setOpenMenu] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const navRef = useRef(null);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    if (openMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [openMenu]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && openMenu !== null) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openMenu]);

  const menuCategories = [
    {
      name: 'Trade',
      icon: <Zap className="w-4 h-4" />,
      items: [
        { path: '/', label: 'Swap' },
        { path: '/trade/pro-swap', label: 'Pro Swap', badge: 'Beta' },
        { path: '/trade/bridge', label: 'Bridge', badge: 'Beta' }
      ]
    },
    {
      name: 'Launchpad',
      icon: <Rocket className="w-4 h-4" />,
      items: [
        { path: '/launchpad/explore', label: 'Explore Projects' },
        { path: '/launchpad/create', label: 'Create Project' },
        { path: '/launchpad/nft-maker', label: 'NFT Maker', badge: 'Beta' },
        { path: '/launchpad/my-nft-collections', label: 'My NFT Collections', badge: 'Beta' },
        { path: '/launchpad/token-locker', label: 'Token Locker', badge: 'Beta' }
      ]
    },
    {
      name: 'Earn',
      icon: <Gift className="w-4 h-4" />,
      items: [
        { path: '/earn/referrals', label: 'Referral Dashboard', badge: '🔥' },
        { path: '/earn/referrals#leaderboard', label: 'Leaderboard' }
      ]
    },
    {
      name: 'Portfolio',
      icon: <TrendingUp className="w-4 h-4" />,
      items: [
        { path: '/portfolio', label: 'My Assets' },
        { path: '/portfolio#history', label: 'History', badge: 'Beta' },
        { path: '/portfolio#alerts', label: 'Price Alerts', badge: 'Beta' }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  // Handle menu interaction (hover for desktop, click for mobile)
  const handleMenuEnter = (idx) => {
    if (!isTouchDevice) {
      setOpenMenu(idx);
    }
  };

  const handleMenuClick = (idx) => {
    if (isTouchDevice) {
      setOpenMenu(openMenu === idx ? null : idx);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="mx-auto px-6 py-3">
        <div className="flex items-center justify-between" ref={navRef}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="SwapLaunch" 
              className="h-10 w-10 object-contain"
            />
            <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
              SwapLaunch v4.0
            </div>
          </Link>

          {/* Navigation - Categorized */}
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {menuCategories.map((category, idx) => (
              <div
                key={idx}
                className="relative"
                onMouseEnter={() => handleMenuEnter(idx)}
                onMouseLeave={handleMenuLeave}
              >
                <button 
                  onClick={() => handleMenuClick(idx)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {category.icon}
                  <span>{category.name}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === idx ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {openMenu === idx && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden z-50"
                    onMouseEnter={() => handleMenuEnter(idx)}
                    onMouseLeave={handleMenuLeave}
                  >
                    {category.items.map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        to={item.path}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          isActive(item.path) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => setOpenMenu(null)}
                      >
                        <span className="text-sm">{item.label}</span>
                        {item.badge && (
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            item.badge === 'Beta' 
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                              : 'bg-blue-600 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Gas Tracker */}
            {selectedChain !== 0 && <GasTracker chainId={selectedChain} />}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
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
