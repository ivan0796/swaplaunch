import React from 'react';
import { AlertTriangle, TrendingDown, Lock, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const RiskDisclosurePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold dark:text-white">Risikohinweis</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Die Nutzung von SwapLaunch und der damit verbundenen Blockchain-Protokolle ist mit Risiken verbunden.
          </p>

          {/* Main Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-3">Wichtige Warnung</h3>
                <p className="text-red-800 dark:text-red-300 text-lg font-medium">
                  Blockchain-Transaktionen sind <strong>unwiderruflich</strong>. Verluste können nicht rückgängig gemacht werden.
                </p>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6 dark:text-white">Haupt-Risikofaktoren</h3>
            
            <div className="space-y-4">
              {/* Price Volatility */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">Preisvolatilität</h4>
                    <p className="text-orange-800 dark:text-orange-300">
                      Token können stark an Wert verlieren. Extreme Preisschwankungen innerhalb kurzer Zeit sind möglich.
                    </p>
                  </div>
                </div>
              </div>

              {/* Smart Contract Risk */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">Smart-Contract-Risiko</h4>
                    <p className="text-red-800 dark:text-red-300">
                      Protokolle können Fehler enthalten oder angegriffen werden. Audits bieten keine 100%ige Sicherheit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Irreversibility */}
              <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Lock className="w-6 h-6 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-200 mb-2">Unwiderruflichkeit</h4>
                    <p className="text-gray-800 dark:text-gray-300">
                      Blockchain-Transaktionen können nicht rückgängig gemacht werden. Falsche Adressen oder Betrag führen zu endgültigem Verlust.
                    </p>
                  </div>
                </div>
              </div>

              {/* Liquidity Risk */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">Liquiditätsrisiko</h4>
                    <p className="text-yellow-800 dark:text-yellow-300">
                      Manche Token können schwer zu handeln sein. Geringe Liquidität kann zu hohem Slippage führen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Risk */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">Projekt-Risiko (Launchpad)</h4>
                    <p className="text-purple-800 dark:text-purple-300">
                      Neue Token können scheitern, sich schlecht entwickeln oder betrügerisch sein. Führen Sie eigene Recherchen durch (DYOR).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Your Responsibility */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-3">Ihre Verantwortung</h3>
                <div className="space-y-2 text-blue-800 dark:text-blue-300">
                  <p>Sie handeln <strong>auf eigenes Risiko</strong>.</p>
                  <p>Sie sollten nur Gelder verwenden, deren Verlust Sie verkraften können.</p>
                  <p className="font-bold mt-4">
                    SwapLaunch <strong>bietet keine Finanz-, Steuer- oder Anlageberatung.</strong>
                  </p>
                  <p className="mt-2">
                    Wenn Sie unsicher sind, ziehen Sie professionellen Rat hinzu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Risks */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h4 className="font-bold mb-3 dark:text-white">Weitere Risiken</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Regulatorisches Risiko:</strong> Gesetzliche Änderungen können Token oder Protokolle betreffen</li>
              <li><strong>Technisches Risiko:</strong> Wallet-Verlust, Phishing, Hacks</li>
              <li><strong>Netzwerk-Risiko:</strong> Blockchain-Überlastung, hohe Gas-Fees</li>
              <li><strong>Gegenpartei-Risiko:</strong> Abhängigkeit von Drittanbietern (DEXs, Bridges)</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-xl p-4 text-center mb-6">
              <p className="text-red-900 dark:text-red-200 font-bold">
                ⚠️ Investieren Sie nur, was Sie bereit sind zu verlieren ⚠️
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Link to="/terms" className="text-blue-600 hover:underline text-sm">Nutzungsbedingungen</Link>
              <Link to="/privacy" className="text-blue-600 hover:underline text-sm">Datenschutz</Link>
              <Link to="/getting-started" className="text-blue-600 hover:underline text-sm">Erste Schritte</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclosurePage;
