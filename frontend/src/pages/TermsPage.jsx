import React from 'react';
import { Shield, AlertTriangle, Lock, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold dark:text-white">Nutzungsbedingungen & Risikohinweis</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Durch die Nutzung der Plattform "SwapLaunch" stimmen Sie den folgenden Bedingungen zu.
          </p>

          {/* Non-Custodial Notice */}
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-green-900 dark:text-green-200 mb-2">1. Non-Custodial Grundsatz</h3>
                <p className="text-green-800 dark:text-green-300 mb-2">SwapLaunch:</p>
                <ul className="list-disc list-inside space-y-1 text-green-800 dark:text-green-300">
                  <li>verwahrt keine Vermögenswerte</li>
                  <li>speichert keine privaten Schlüssel</li>
                  <li>führt keine Konten oder Salden</li>
                  <li>kann keine Transaktionen ohne Ihre Wallet-Signatur ausführen</li>
                </ul>
                <p className="mt-3 font-bold text-green-900 dark:text-green-200">
                  Sie kontrollieren Ihre Gelder <strong>ausschließlich selbst</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 2 */}
            <div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">2. Keine Finanz- oder Anlageberatung</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Die Plattform stellt <strong>keine Anlageberatung</strong> dar.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Alle dargestellten Informationen sind ausschließlich zu Informationszwecken.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                SwapLaunch gibt <strong>keine Empfehlungen</strong> zu Token, Projekten oder Investitionen.
              </p>
            </div>

            {/* Section 3 */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-orange-900 dark:text-orange-200">3. Smart Contract Risiken</h3>
                  <p className="text-orange-800 dark:text-orange-300 mb-2">
                    Transaktionen werden über Drittanbieter-Smart-Contracts ausgeführt.
                  </p>
                  <p className="text-orange-800 dark:text-orange-300 mb-2">
                    Diese können Fehler enthalten oder Opfer von Angriffen werden.
                  </p>
                  <p className="text-orange-800 dark:text-orange-300 font-bold">
                    Sie akzeptieren, dass <strong>Verluste möglich sind</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">4. Markt- und Preisrisiken</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Digitale Assets können stark im Wert schwanken.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Sie handeln <strong>auf eigenes Risiko</strong>.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">5. Launchpad Inhalte</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Projekte, die das Launchpad nutzen, werden von Dritten bereitgestellt.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                SwapLaunch prüft diese Projekte <strong>nicht vollständig</strong>.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Nutzer müssen <strong>eigene Due Diligence</strong> durchführen.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">6. Gebühren</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                SwapLaunch kann eine <strong>Service-Gebühr pro Transaktion</strong> erheben, die <strong>vor Ausführung</strong> angezeigt wird.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Mit der Signatur der Transaktion akzeptieren Sie diese Gebühr.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">7. Haftungsbeschränkung</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">SwapLaunch haftet nicht für:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>Verluste durch Smart-Contract-Fehler</li>
                <li>Fehlgeschlagene oder verzögerte Transaktionen</li>
                <li>Wertveränderungen von Token</li>
                <li>Entscheidungen, die durch angezeigte Daten beeinflusst wurden</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3 text-blue-900 dark:text-blue-200">8. Zustimmung</h3>
              <p className="text-blue-800 dark:text-blue-300">
                Wenn Sie diese Bedingungen nicht akzeptieren, <strong>verlassen Sie bitte die Plattform.</strong>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 text-center">
              <Lock className="w-8 h-8 mx-auto mb-3 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
                Non-Custodial • Keine Verwahrung • Keine Konten
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Sie behalten jederzeit die volle Kontrolle über Ihre Wallet.
              </p>
            </div>
            
            <div className="flex justify-center gap-4 mt-6">
              <Link to="/privacy" className="text-blue-600 hover:underline text-sm">Datenschutz</Link>
              <Link to="/risk" className="text-blue-600 hover:underline text-sm">Risikohinweis</Link>
              <Link to="/getting-started" className="text-blue-600 hover:underline text-sm">Erste Schritte</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
