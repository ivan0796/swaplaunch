import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAccount } from 'wagmi';
import WalletButtonWithHistory from './WalletButtonWithHistory';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

const HeaderSlim = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const moreRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Primäre Navigation
  const primaryNav = [
    { path: '/', label: t('nav.swap') },
    { path: '/launch', label: t('nav.launch') },
    { path: '/launchpad/token-locker', label: t('nav.lock') },
    { path: '/bridge', label: t('nav.bridge') }
  ];

  // "Mehr" Dropdown
  const moreItems = [
    { path: '/trending', label: 'Trending' },
    { path: '/advertise', label: 'Advertise' },
    { path: '/terms', label: 'Terms' },
    { path: '/privacy', label: 'Privacy' },
    { path: '/risk', label: 'Security' }
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_9c53c1f9-10f1-41e7-a7c4-12afcbaf39e9/artifacts/q1ccyq6i_ChatGPT%20Image%204.%20Nov.%202025%2C%2009_26_52.png" 
                alt="LaunchSwap"
                className="h-12 w-12 object-contain"
              />
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LaunchSwap
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {primaryNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* More Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {t('nav.more')}
                  <ChevronDown className={`w-4 h-4 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {moreItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMoreDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              <div className="hidden md:block">
                <WalletButtonWithHistory />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 dark:text-gray-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="px-4 py-4 space-y-2">
              {primaryNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium ${
                    isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-2">
                  {t('nav.more').toUpperCase()}
                </div>
                {moreItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <WalletButtonWithHistory />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sticky Bottom Bar (nur wenn nicht verbunden) */}
      {!isConnected && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-2xl">
          <Link
            to="/launch"
            className="flex items-center justify-center gap-2 w-full bg-white text-blue-600 text-center font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            {t('cta.startToken')}
            <img 
              src="https://customer-assets.emergentagent.com/job_9c53c1f9-10f1-41e7-a7c4-12afcbaf39e9/artifacts/q1ccyq6i_ChatGPT%20Image%204.%20Nov.%202025%2C%2009_26_52.png"
              alt="Rocket"
              className="w-6 h-6 object-contain"
            />
          </Link>
        </div>
      )}
    </>
  );
};

export default HeaderSlim;
