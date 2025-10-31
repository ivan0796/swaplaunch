import React, { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import SwapFormV2 from '../components/SwapFormV2';
import SolanaSwapForm from '../components/SolanaSwapForm';
import NetworkSelector from '../components/NetworkSelector';
import TrendingTokens from '../components/TrendingTokens';
import SwapHistoryModal from '../components/SwapHistoryModal';
import ReferralWidget from '../components/ReferralWidget';
import { Link } from 'react-router-dom';

const SwapPageV2 = () => {
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
            <a className="opacity-80 hover:opacity-100 cursor-pointer" href="#">Trade</a>
            <a className="opacity-80 hover:opacity-100 cursor-pointer" href="#">Earn</a>
            <a className="opacity-80 hover:opacity-100 cursor-pointer" href="#">Bridge</a>
            <Link className="opacity-80 hover:opacity-100" to="/risk-disclosure">Info</Link>
          </nav>
          <div className="flex items-center gap-2">
            <SwapHistoryModal />
            {isConnected && <ReferralWidget walletAddress={walletAddress} />}
            {selectedChain === 0 ? (
              <WalletMultiButton />
            ) : (
              <ConnectButton />
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
                <h2 className="text-lg font-bold tracking-tight">Swap Tokens</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Trade crypto across 4 blockchains with advanced security
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
              {/* Network Selector */}
              <NetworkSelector
                selectedChain={selectedChain}
                onChainChange={setSelectedChain}
                disabled={!isConnected}
              />

              {/* Swap Form */}
              <div className="mt-6">
                {isConnected ? (
                  selectedChain === 0 ? (
                    <SolanaSwapForm />
                  ) : (
                    <SwapFormV2
                      chainId={selectedChain}
                      walletAddress={walletAddress}
                    />
                  )
                ) : (
                  <div className="text-center py-12 bg-gray-50/60 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 dark:bg-gray-800/50">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                      />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {selectedChain === 0 
                        ? 'Connect Solana wallet to start swapping'
                        : 'Connect EVM wallet to start swapping'
                      }
                    </p>
                    {selectedChain === 0 ? (
                      <WalletMultiButton />
                    ) : (
                      <ConnectButton />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Trending Tokens */}
          <TrendingTokens onTokenSelect={(coin) => {
            console.log('Selected trending token:', coin);
          }} />

          {/* Features Card */}
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Why SwapLaunch v2.0?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Best-in-class features</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>Non-custodial - You control your keys</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>Best rates across multiple DEXs</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>4-Chain support: ETH, BSC, Polygon, Solana</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>🔍 Advanced token search & security scanner</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>Transparent fee structure (0.2%)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    ✓
                  </div>
                  <span>Referral program - Invite & earn</span>
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
