import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';
import StakeWizard from '../components/staking/StakeWizard';
import StakePositions from '../components/staking/StakePositions';
import RewardPanel from '../components/staking/RewardPanel';
import StakingFAQ from '../components/staking/StakingFAQ';
import NonCustodialDisclaimer from '../components/NonCustodialDisclaimer';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Sparkles, TrendingUp, Shield, Info } from 'lucide-react';

const StakingPage = () => {
  const { t } = useTranslation();
  const [selectedMode, setSelectedMode] = useState('sol'); // 'sol' or 'spl'
  const [showWizard, setShowWizard] = useState(false);
  const [testMode, setTestMode] = useState(true); // Test mode enabled by default
  const [stakePositions, setStakePositions] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
      <HeaderSlim />

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Mode Badge & Toggle */}
          <div className="flex justify-center items-center gap-4 mb-4">
            <Badge className={`px-4 py-2 text-sm font-bold ${
              testMode 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
            }`}>
              {testMode ? '🧪 TEST MODE' : '🔴 BETA - LIVE'}
            </Badge>
            
            {/* Test Mode Toggle */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                id="staking-test-mode"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="staking-test-mode" className="text-sm font-medium dark:text-white cursor-pointer">
                Test Mode (No Real Transactions)
              </label>
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {t('staking.hero.title', 'Earn Rewards, Stay in Control')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('staking.hero.subtitle', 'Non-custodial staking on Solana. You sign, you earn. We never hold your funds.')}
          </p>

          {/* Mode Selector */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setSelectedMode('sol')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedMode === 'sol'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                SOL Staking
              </div>
              <p className="text-xs mt-1 opacity-80">Validator Delegation</p>
            </button>

            <button
              onClick={() => setSelectedMode('spl')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedMode === 'spl'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                SPL Token Staking
              </div>
              <p className="text-xs mt-1 opacity-80">Phase 2</p>
            </button>
          </div>

          {/* Primary CTA */}
          <Button
            onClick={() => setShowWizard(true)}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            {testMode ? 'Start Staking Demo' : 'Stake SOL (Beta)'}
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            {testMode 
              ? '🧪 Test Mode: Complete demo flow • No wallet needed' 
              : '🔴 Beta: Real transactions • Wallet signature required'}
          </p>
        </div>
      </section>

      {/* Non-Custodial Disclaimer */}
      <section className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <NonCustodialDisclaimer />
        </div>
      </section>

      {/* Reward Panel */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <RewardPanel mode={selectedMode} />
        </div>
      </section>

      {/* Beta Info */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 p-8">
            <div className="flex items-start gap-4">
              <Info className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-200 mb-3">
                  🧪 Beta-Version: UI Demo
                </h3>
                <div className="text-orange-800 dark:text-orange-300 space-y-3">
                  <p>
                    <strong>Dies ist eine Vorschau:</strong> Diese Seite demonstriert den Staking-Flow, 
                    führt aber noch keine echten Transaktionen aus. Du kannst die UI testen und den 
                    Ablauf kennenlernen.
                  </p>
                  <p>
                    <strong>Was funktioniert:</strong> Validator-Auswahl, Betragseingabe, UI-Flow
                  </p>
                  <p>
                    <strong>Was noch kommt:</strong> Wallet-Signierung, echte Delegation auf Devnet/Mainnet, 
                    Live-Rewards-Tracking
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      ✅ Non-Custodial Garantie:
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Keine Private Keys auf unseren Servern</li>
                      <li>Du signierst alle Transaktionen selbst (später)</li>
                      <li>Keine Verwahrung von SOL oder Tokens</li>
                      <li>Alle Gelder bleiben in deiner Wallet</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stake Positions */}
      <section className="py-12 px-4 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold dark:text-white">
              {t('staking.positions.title', 'Your Stake Positions')}
            </h2>
            {stakePositions.length > 0 && (
              <Badge className="bg-green-600 text-white">
                {stakePositions.length} Active
              </Badge>
            )}
          </div>
          <StakePositions mode={selectedMode} positions={stakePositions} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 dark:text-white text-center">
            {t('staking.faq.title', 'Frequently Asked Questions')}
          </h2>
          <StakingFAQ mode={selectedMode} />
        </div>
      </section>

      {/* Wizard Modal (if active) */}
      {showWizard && (
        <StakeWizard
          mode={selectedMode}
          onClose={() => setShowWizard(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default StakingPage;
