import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, AlertTriangle, Rocket } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-3 dark:text-white">SwapLaunch</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Non-custodial multi-chain DEX aggregator
            </p>
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Shield className="w-4 h-4" />
              <span>100% Non-Custodial</span>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3 dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Nutzungsbedingungen
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/risk" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risikohinweis
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3 dark:text-white">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/getting-started" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Erste Schritte
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:support@swaplaunch.app" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-3 dark:text-white">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Multi-Chain Swap
                </Link>
              </li>
              <li>
                <Link to="/launchpad/explore" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Launchpad
                </Link>
              </li>
              <li>
                <Link to="/earn/referrals" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Referral Program
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {/* Non-Custodial Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-green-900 dark:text-green-200">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium">
                Non-Custodial • Keine Verwahrung • Keine Konten
              </span>
            </div>
            <p className="text-center text-xs text-green-800 dark:text-green-300 mt-2">
              Sie behalten jederzeit die volle Kontrolle über Ihre Wallet.
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              © 2024 SwapLaunch. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Non-Custodial Protocol</span>
              <span>•</span>
              <span>On-Chain Execution</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
