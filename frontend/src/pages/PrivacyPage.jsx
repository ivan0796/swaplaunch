import React from 'react';
import { Shield, Cookie, Database, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold dark:text-white">Datenschutzerklärung</h1>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Letzte Aktualisierung: November 2024</p>

          {/* Main Notice */}
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-green-900 dark:text-green-200 mb-2">1. Allgemeines</h3>
                <p className="text-green-800 dark:text-green-300 mb-2">
                  SwapLaunch ist eine <strong>non-custodial</strong> Plattform.
                </p>
                <p className="text-green-800 dark:text-green-300">
                  Wir speichern <strong>keine privaten Schlüssel</strong>, <strong>keine Wallet-Gelder</strong> und <strong>keine persönlichen Daten</strong>, die Sie eindeutig identifizieren könnten.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 2 */}
            <div>
              <h3 className="text-xl font-bold mb-4 dark:text-white">2. Welche Daten wir verarbeiten</h3>
              
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                  <h4 className="font-bold mb-2 text-blue-900 dark:text-blue-200">2.1 Lokale Wallet-Verbindung</h4>
                  <p className="text-blue-800 dark:text-blue-300 mb-2">
                    Wenn Sie Ihre Wallet verbinden, erfolgt dies ausschließlich lokal über:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300">
                    <li>WalletConnect</li>
                    <li>Browser-Wallet (z. B. MetaMask, Rabby, Trust, Phantom)</li>
                  </ul>
                  <p className="mt-2 font-bold text-blue-900 dark:text-blue-200">
                    SwapLaunch <strong>erhält keine Zugriffsdaten</strong> auf Ihre Schlüssel.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2 dark:text-white">2.2 Technische und analytische Daten</h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Wir können anonyme Nutzungsdaten erfassen, um die Plattform zu verbessern, wie z. B.:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Browsertyp und Version</li>
                    <li>Interaktionen innerhalb der App (z. B. "Swap ausgeführt", "Route angesehen")</li>
                    <li>Aggregierte Performance-Metriken</li>
                  </ul>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    Diese Daten sind <strong>nicht personenbezogen</strong> und werden <strong>nicht verkauft</strong>.
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
                  <h4 className="font-bold mb-2 text-red-900 dark:text-red-200">2.3 Keine Speicherung von:</h4>
                  <div className="grid grid-cols-2 gap-2 text-red-800 dark:text-red-300">
                    <div>• Namen</div>
                    <div>• E-Mail-Adressen</div>
                    <div>• Telefonnummern</div>
                    <div>• Adressdaten</div>
                    <div>• Zahlungsdaten</div>
                    <div>• Private Keys</div>
                    <div>• Passwortinformationen</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 - Cookies */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cookie className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold dark:text-white">3. Cookies</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Falls Cookies verwendet werden, dienen diese ausschließlich:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>zur Verbesserung der Nutzererfahrung</li>
                <li>zur Speicherung von UI-Einstellungen (z. B. Dark/Light Mode)</li>
              </ul>
              <p className="mt-2 font-bold text-gray-700 dark:text-gray-300">
                Keine Tracking-Cookies für Werbung oder Profiling.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold dark:text-white">4. Drittanbieter & Netzwerkinteraktionen</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Transaktionen und Daten können über:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>Blockchain-Netzwerke</li>
                <li>DEX-Aggregatoren</li>
                <li>Bridge-Protokolle</li>
              </ul>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                geleitet werden. Diese Systeme haben <strong>eigene Datenschutzrichtlinien</strong>, auf die SwapLaunch keinen Einfluss hat.
              </p>
            </div>

            {/* Section 5 */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-900 dark:text-green-200">5. Sicherheit</h3>
              </div>
              <ul className="list-disc list-inside space-y-2 text-green-800 dark:text-green-300">
                <li>Alle Transaktionen werden <strong>clientseitig signiert</strong></li>
                <li>SwapLaunch hat keinerlei Möglichkeit, Gelder zu bewegen</li>
                <li>Datenübertragung erfolgt verschlüsselt (HTTPS)</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">6. Kontakt</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Bei datenschutzbezogenen Fragen kontaktieren Sie uns unter:
              </p>
              <p className="text-blue-600 font-mono mt-2">support@swaplaunch.app</p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center gap-4">
              <Link to="/terms" className="text-blue-600 hover:underline text-sm">Nutzungsbedingungen</Link>
              <Link to="/risk" className="text-blue-600 hover:underline text-sm">Risikohinweis</Link>
              <Link to="/getting-started" className="text-blue-600 hover:underline text-sm">Erste Schritte</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
