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
import { Info } from 'lucide-react';
import { Button } from '../components/ui/button';

const SwapPage = () => {
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
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
    }}>
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-md bg-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              SwapLaunch v2.0
            </h1>
            <p className="text-sm text-white/80 mt-1">Multi-Chain DEX Aggregator</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/risk-disclosure">
              <Button data-testid="risk-disclosure-link" variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                <Info className="w-4 h-4 mr-2" />
                Risk & Transparency
              </Button>
            </Link>
            <SwapHistoryModal />
            {isConnected && <ReferralWidget walletAddress={walletAddress} />}
            {selectedChain === 0 ? (
              <WalletMultiButton />
            ) : (
              <ConnectButton data-testid="connect-wallet-button" />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Swap Interface */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-3xl p-8 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                  Swap Tokens
                </h2>
                <p className="text-gray-600 text-sm">
                  Trade crypto across multiple blockchains with advanced token search & security
                </p>
              </div>

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
                  <div data-testid="connect-wallet-prompt" className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
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
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-500 mb-4">Connect wallet to start swapping tokens</p>
                    <ConnectButton />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Tokens */}
            <TrendingTokens onTokenSelect={(coin) => {
              console.log('Selected trending token:', coin);
              // Token selection logic can be added here
            }} />

            {/* Features Card */}
            <div className="glass-card rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
                Why SwapLaunch v2.0?
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Non-custodial - You control your keys</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Best rates across multiple DEXs</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>3-Chain support: ETH, BSC, Polygon</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>🔍 Advanced token search & security scanner</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Transparent fee structure (0.2%)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Referral program - Invite & earn</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-white/20 backdrop-blur-md bg-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/80 text-sm">
            SwapLaunch v2.0 is a non-custodial platform. Always verify transactions before signing.
          </p>
          <p className="text-white/60 text-xs mt-2">
            © 2025 SwapLaunch. Powered by 0x Protocol & Jupiter.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SwapPage;