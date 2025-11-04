import React from 'react';
import { Shield, Lock, Eye, AlertTriangle, ExternalLink, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';

const SecurityPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <HeaderSlim />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold dark:text-white">Security</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            SwapLaunch is committed to providing a secure, non-custodial platform. Your funds are always under your control.
          </p>

          {/* Smart Contracts & Verification */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold dark:text-white">Smart Contracts & Verification</h2>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                All smart contracts deployed through SwapLaunch are automatically verified on blockchain explorers.
              </p>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  What We Verify:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-green-800 dark:text-green-300 text-sm">
                  <li>ERC-20/BEP-20/SPL token contracts</li>
                  <li>Liquidity locker contracts</li>
                  <li>All deployed source code</li>
                  <li>Contract ownership and permissions</li>
                </ul>
              </div>

              <p className="text-sm">
                <strong>Explorers:</strong> Etherscan, BscScan, PolygonScan, Arbiscan, BaseScan, SnowTrace, Solscan
              </p>
            </div>
          </section>

          {/* Non-Custodial Architecture */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold dark:text-white">Non-Custodial Architecture</h2>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                SwapLaunch <strong>never</strong> holds your funds. Every transaction requires your wallet signature.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">✅ We Do:</h4>
                  <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-300">
                    <li>• Route transactions through DEXs</li>
                    <li>• Provide best price aggregation</li>
                    <li>• Display transparent fees</li>
                    <li>• Verify smart contracts</li>
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">❌ We Don't:</h4>
                  <ul className="text-sm space-y-1 text-red-800 dark:text-red-300">
                    <li>• Store private keys</li>
                    <li>• Hold your funds</li>
                    <li>• Execute trades without permission</li>
                    <li>• Access your wallet</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm italic">
                Your wallet (MetaMask, Trust Wallet, Phantom) always prompts for signature before any transaction.
              </p>
            </div>
          </section>

          {/* Risks */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold dark:text-white">Risks</h2>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                While we implement best security practices, decentralized finance carries inherent risks:
              </p>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4">
                <ul className="space-y-2 text-sm text-orange-900 dark:text-orange-200">
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">•</span>
                    <div>
                      <strong>Smart Contract Risk:</strong> Third-party DEX protocols may have bugs or vulnerabilities
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">•</span>
                    <div>
                      <strong>Market Risk:</strong> Token prices can be highly volatile
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">•</span>
                    <div>
                      <strong>Phishing Risk:</strong> Always verify you're on the official SwapLaunch domain
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">•</span>
                    <div>
                      <strong>User Error:</strong> Transactions on blockchain are irreversible
                    </div>
                  </li>
                </ul>
              </div>

              <p>
                <strong>Recommendation:</strong> Only trade with funds you can afford to lose. Always double-check transaction details before signing.
              </p>

              <div className="flex gap-4">
                <Link
                  to="/risk"
                  className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                >
                  Read Full Risk Disclosure
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </section>

          {/* Audits & Transparency */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold dark:text-white">Audits & Transparency</h2>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                SwapLaunch is committed to transparency and ongoing security improvements.
              </p>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="font-semibold mb-3 dark:text-white">Contract Addresses:</h4>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Fee Router (ETH)</span>
                    <a
                      href="https://etherscan.io/address/0x..."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View on Etherscan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Token Factory (BSC)</span>
                    <a
                      href="https://bscscan.com/address/0x..."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View on BscScan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    All contracts verified and open-source. Audit reports coming Q1 2025.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Responsible Disclosure */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold dark:text-white">Responsible Disclosure</h2>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                If you discover a security vulnerability, please report it responsibly.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200 mb-3">
                  <strong>Security Contact:</strong>
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-white dark:bg-gray-800 px-3 py-1 rounded">
                      security@swaplaunch.app
                    </span>
                  </div>
                  <p className="text-blue-800 dark:text-blue-300 text-xs">
                    Please include: Description, reproduction steps, and potential impact. We'll respond within 48 hours.
                  </p>
                </div>
              </div>

              <p className="text-sm">
                <strong>Bug Bounty:</strong> We offer rewards for valid security findings. Details coming soon.
              </p>
            </div>
          </section>

          {/* Footer Links */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/terms" className="text-blue-600 hover:underline text-sm">Terms of Service</Link>
              <Link to="/privacy" className="text-blue-600 hover:underline text-sm">Privacy Policy</Link>
              <Link to="/risk" className="text-blue-600 hover:underline text-sm">Risk Disclosure</Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SecurityPage;
