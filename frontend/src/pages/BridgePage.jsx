import React, { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Zap, Globe } from 'lucide-react';

const BridgePage = () => {
  const { address, isConnected } = useAccount();
  const widgetContainerRef = useRef(null);

  useEffect(() => {
    if (!isConnected || !widgetContainerRef.current) return;

    // Clear any existing widget
    widgetContainerRef.current.innerHTML = '';

    // Create widget container
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'lifi-widget-container';
    widgetContainerRef.current.appendChild(widgetDiv);

    // Load LI.FI widget script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@lifi/widget@latest/dist/widget.umd.js';
    script.async = true;
    
    script.onload = () => {
      if (window.LiFi && window.LiFi.Widget) {
        try {
          new window.LiFi.Widget({
            el: '#lifi-widget-container',
            integrator: 'SwapLaunch',
            variant: 'wide',
            appearance: 'light',
            theme: {
              palette: {
                primary: { main: '#6366f1' },
                secondary: { main: '#10b981' },
              },
            },
            chains: {
              allow: [1, 10, 56, 100, 137, 250, 8453, 42161, 43114],
            },
          });
        } catch (error) {
          console.error('Failed to initialize LI.FI widget:', error);
        }
      }
    };

    script.onerror = () => {
      console.error('Failed to load LI.FI widget script');
      if (widgetContainerRef.current) {
        widgetContainerRef.current.innerHTML = `
          <div class="text-center py-12">
            <p class="text-red-600 mb-4">Failed to load bridge widget</p>
            <p class="text-sm text-gray-600">Please try refreshing the page</p>
          </div>
        `;
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (widgetContainerRef.current) {
        widgetContainerRef.current.innerHTML = '';
      }
    };
  }, [isConnected, address]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(129,140,248,.25),transparent),radial-gradient(800px_500px_at_80%_0%,rgba(16,185,129,.18),transparent)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 opacity-80 hover:opacity-100">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Swap</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 text-white text-lg">
              🌉
            </div>
            <div className="text-sm font-semibold tracking-tight">Bridge</div>
          </div>
          <div className="flex items-center gap-2">
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cross-Chain Bridge</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bridge your assets across multiple blockchains with the best rates
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-black/5 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold">Non-Custodial</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your keys, your crypto. We never have access to your funds.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Best Routes</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically finds the fastest and cheapest bridge route.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold">9+ Chains</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche & more.
            </p>
          </div>
        </div>

        {/* Bridge Widget Container */}
        <div className="rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
          {isConnected ? (
            <div ref={widgetContainerRef} className="w-full min-h-[600px]"></div>
          ) : (
            <div className="text-center py-20">
              <div className="mb-6">
                <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Connect your wallet to start bridging assets across chains
                </p>
              </div>
              <ConnectButton />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 rounded-2xl border border-black/5 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
          <h3 className="font-semibold mb-3">ℹ️ How it works</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. Select the source and destination chains</p>
            <p>2. Choose the token you want to bridge</p>
            <p>3. Enter the amount and review the route</p>
            <p>4. Confirm the transaction in your wallet</p>
            <p>5. Wait for the bridge to complete (usually 2-30 minutes)</p>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              ⚠️ Always verify the destination address before bridging. Bridge transactions cannot be reversed.
            </p>
          </div>
        </div>

        {/* Powered By */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <a
              href="https://li.fi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              LI.FI
            </a>
            {' '}- Cross-chain infrastructure
          </p>
        </div>
      </main>
    </div>
  );
};

export default BridgePage;
