import React, { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import SwapFormEnhanced from '../components/SwapFormEnhanced';
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
  const [selectedChain, setSelectedChain] = useState(1);

  useEffect(() => {
    if (evmConnected && chainId) {
      setSelectedChain(chainId);
    }
  }, [chainId, evmConnected]);

  const isConnected = evmConnected;
  const walletAddress = evmAddress;

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
            <p className="text-sm text-white/80 mt-1">Multi-Chain DEX Aggregator (ETH • BSC • Polygon • Solana)</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/risk-disclosure">
              <Button data-testid="risk-disclosure-link" variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                <Info className="w-4 h-4 mr-2" />
                Risk & Transparency
              </Button>
            </Link>
            {walletType === 'solana' ? (
              <WalletMultiButton data-testid="solana-connect-button" />
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
                  Trade crypto across 4 blockchains with the best rates
                </p>
              </div>

              {/* Network Selector */}
              <NetworkSelector
                selectedChain={selectedChain}
                onChainChange={handleChainChange}
                disabled={!isConnected}
                walletType={walletType}
              />

              {/* Wallet Type Switch Hint */}
              {selectedChain === 'solana' && !solanaConnected && evmConnected && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  ⚠️ Solana requires Phantom wallet. Please connect Phantom to swap on Solana.
                </div>
              )}
              {selectedChain !== 'solana' && solanaConnected && !evmConnected && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  ⚠️ EVM chains require MetaMask or WalletConnect. Please connect an EVM wallet.
                </div>
              )}

              {/* Swap Form */}
              <div className="mt-6">
                {isConnected ? (
                  <SwapForm
                    chainId={selectedChain}
                    walletAddress={walletAddress}
                    walletType={walletType}
                  />
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
                    <p className="text-gray-500 mb-4">Choose your blockchain and connect wallet to start swapping</p>
                    <div className="flex gap-3 justify-center">
                      <ConnectButton />
                      <WalletMultiButton />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
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
                  <span>4-Chain support: ETH, BSC, Polygon, Solana</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Transparent fee structure (0.2%)</span>
                </li>
              </ul>
            </div>

            {/* Swap History */}
            {isConnected && walletAddress && (
              <SwapHistory 
                walletAddress={walletAddress} 
                chain={selectedChain === 'solana' ? 'solana' : undefined}
              />
            )}
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