import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Shield, Info } from 'lucide-react';
import { Button } from '../components/ui/button';

const RiskDisclosure = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link to="/">
          <Button data-testid="back-to-swap-button" variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Swap
          </Button>
        </Link>

        {/* Header */}
        <div className="glass-card rounded-3xl p-8 mb-6">
          <div className="flex items-center mb-4">
            <Shield className="w-10 h-10 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>
              Risk & Transparency Disclosure
            </h1>
          </div>
          <p className="text-gray-600">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                Important: Read Before Using SwapLaunch
              </h3>
              <p className="text-sm text-yellow-700">
                This platform provides access to decentralized exchange protocols. You are responsible for understanding the risks involved.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* What SwapLaunch Is */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <Info className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Space Grotesk' }}>
                What SwapLaunch Is
              </h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                SwapLaunch is a <strong>software interface</strong> that provides convenient access to decentralized exchange (DEX) protocols on Ethereum, Binance Smart Chain, and Polygon networks.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We aggregate swap quotes from multiple DEX protocols via the 0x API</li>
                <li>All transactions are executed directly from your wallet to on-chain smart contracts</li>
                <li>We never take custody of your funds or private keys</li>
                <li>A small fee (0.2%) is applied to facilitate the service</li>
              </ul>
            </div>
          </div>

          {/* What SwapLaunch Is NOT */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Space Grotesk' }}>
                What SwapLaunch Is NOT
              </h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>NOT a financial advisor:</strong> We do not provide investment advice</li>
                <li><strong>NOT a custodian:</strong> We never hold your funds or private keys</li>
                <li><strong>NOT a guarantee:</strong> We make no promises about profits or returns</li>
                <li><strong>NOT regulated:</strong> This is experimental DeFi software, not a regulated financial service</li>
              </ul>
            </div>
          </div>

          {/* Risks */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Key Risks You Accept
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">1. Smart Contract Risk</h3>
                <p className="text-sm">
                  DEX protocols rely on smart contracts which may contain bugs or vulnerabilities. Exploits could result in loss of funds.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">2. Price Volatility</h3>
                <p className="text-sm">
                  Cryptocurrency prices can change rapidly. Slippage may cause you to receive less than expected.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">3. Irreversible Transactions</h3>
                <p className="text-sm">
                  Blockchain transactions are irreversible. Mistakes cannot be undone. Always double-check before confirming.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">4. Regulatory Uncertainty</h3>
                <p className="text-sm">
                  Cryptocurrency regulations vary by jurisdiction and may change. You are responsible for compliance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">5. Network Congestion & Fees</h3>
                <p className="text-sm">
                  Gas fees can spike during network congestion. Failed transactions still consume gas fees.
                </p>
              </div>
            </div>
          </div>

          {/* Non-Custodial Nature */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Non-Custodial Platform
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                SwapLaunch operates as a <strong>non-custodial platform</strong>:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You retain full control of your private keys and funds at all times</li>
                <li>All swap transactions require your explicit signature</li>
                <li>We cannot access, freeze, or reverse your transactions</li>
                <li>You are solely responsible for the security of your wallet and private keys</li>
                <li>Loss of private keys means permanent loss of access to your funds</li>
              </ul>
            </div>
          </div>

          {/* Fee Structure */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Fee Structure
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                SwapLaunch charges a <strong>0.2% fee</strong> on the output tokens of each swap:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>This fee is deducted from the tokens you receive</li>
                <li>The fee is clearly displayed before you confirm any transaction</li>
                <li>Additional network gas fees apply (paid directly to blockchain validators)</li>
                <li>DEX protocol fees may also apply depending on the liquidity source</li>
              </ul>
            </div>
          </div>

          {/* User Responsibilities */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Your Responsibilities
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>By using SwapLaunch, you acknowledge that you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Understand the risks of cryptocurrency and DeFi protocols</li>
                <li>Have researched and understand the tokens you are trading</li>
                <li>Will verify all transaction details before signing</li>
                <li>Are responsible for your own tax obligations</li>
                <li>Will comply with all applicable laws in your jurisdiction</li>
                <li>Accept that there is no customer support for failed transactions</li>
                <li>Understand that past performance does not indicate future results</li>
              </ul>
            </div>
          </div>

          {/* No Investment Advice */}
          <div className="glass-card rounded-2xl p-6 bg-red-50 border-2 border-red-200">
            <h2 className="text-2xl font-semibold mb-4 text-red-900" style={{ fontFamily: 'Space Grotesk' }}>
              No Investment Advice
            </h2>
            <p className="text-red-800 font-medium">
              SwapLaunch does not provide investment, tax, or legal advice. Nothing on this platform should be construed as a recommendation to buy, sell, or hold any cryptocurrency. You should consult with qualified professionals before making any financial decisions.
            </p>
          </div>

          {/* Acceptance */}
          <div className="glass-card rounded-2xl p-6 bg-blue-50 border-2 border-blue-300">
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Acknowledgment
            </h2>
            <p className="text-gray-700 mb-4">
              By connecting your wallet and using SwapLaunch, you acknowledge that you have read, understood, and accept all risks and responsibilities outlined in this disclosure.
            </p>
            <Link to="/">
              <Button data-testid="acknowledge-button" className="w-full bg-blue-600 hover:bg-blue-700">
                I Understand and Accept
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclosure;