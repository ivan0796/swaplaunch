import React from 'react';
import { Rocket, Wallet, ArrowRight, Users, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const GettingStartedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold dark:text-white">Erste Schritte mit SwapLaunch</h1>
          </div>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Alles, was Sie benötigen, um loszulegen, ist eine <strong>Krypto-Wallet</strong>.
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-6 mb-12">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-green-900 dark:text-green-200 font-bold text-lg">
                  Keine Registrierung • Keine Konten • Keine persönlichen Daten
                </p>
                <p className="text-green-800 dark:text-green-300 mt-1">
                  100% Non-Custodial – Sie behalten die volle Kontrolle
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 dark:text-white">Wallet installieren</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Wenn Sie noch keine Wallet haben, empfehlen wir:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      <span className="font-bold dark:text-white">MetaMask</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ethereum / BSC / Polygon</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      <span className="font-bold dark:text-white">Trust Wallet</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Multi-Chain</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-5 h-5 text-purple-600" />
                      <span className="font-bold dark:text-white">Phantom</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Solana</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 dark:text-white">Wallet verbinden</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Klicken Sie oben rechts auf <strong>"Connect Wallet"</strong>.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
                  <p className="text-green-800 dark:text-green-300 text-sm">
                    ✅ Sie behalten jederzeit volle Kontrolle — SwapLaunch speichert <strong>niemals</strong> private Schlüssel.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 dark:text-white">Token auswählen</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">Wählen Sie:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">Token unter <strong>You Pay</strong></span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">Token unter <strong>You Receive</strong></span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mt-4">
                  SwapLaunch findet automatisch die <strong>beste Route</strong> über alle verfügbaren DEXs.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 dark:text-white">Transaktion bestätigen</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Klicken Sie <strong>Swap</strong>, überprüfen Sie in Ihrer Wallet die Details und bestätigen Sie.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    🔒 Ihre Transaktion wird direkt <strong>on-chain</strong> ausgeführt. SwapLaunch hat keinen Zugriff auf Ihre Gelder.
                  </p>
                </div>
              </div>
            </div>

            {/* Optional - Referrals */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                💰
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 dark:text-white">Optional — Freunde einladen & verdienen</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Jeder Nutzer erhält automatisch einen Referral-Link.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div className="text-yellow-800 dark:text-yellow-300">
                      <p className="font-bold mb-1">Wenn Ihre Freunde Swaps durchführen → Sie verdienen einen Anteil der Gebühren.</p>
                      <p className="text-sm">Keine Registrierung erforderlich.</p>
                    </div>
                  </div>
                </div>
                <Link 
                  to="/earn/referrals" 
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  <Users className="w-5 h-5" />
                  Zum Referral Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <Rocket className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-3">Fertig 🎉</h3>
            <p className="text-xl mb-6">Sie sind startklar.</p>
            <p className="text-lg opacity-90 mb-6">
              Willkommen bei SwapLaunch — <strong>non-custodial, transparent, fair.</strong>
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-shadow"
            >
              Jetzt Swappen
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center gap-4">
              <Link to="/terms" className="text-blue-600 hover:underline text-sm">Nutzungsbedingungen</Link>
              <Link to="/privacy" className="text-blue-600 hover:underline text-sm">Datenschutz</Link>
              <Link to="/risk" className="text-blue-600 hover:underline text-sm">Risikohinweis</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedPage;
