import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';

const TokenRiskDisclaimer = ({ token, isOpen, onAccept, onReject }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md mx-4 shadow-2xl border-2 border-yellow-500 animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Warning Icon */}
          <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-yellow-600 animate-pulse" />
          </div>
          
          {/* Title */}
          <div>
            <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">
              ⚠️ Unbekannter Token
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Dieser Token wurde via Contract-Adresse gefunden
            </p>
          </div>

          {/* Token Info */}
          {token && (
            <div className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-left">
              <div className="flex items-center gap-3 mb-2">
                {token.logoURI ? (
                  <img src={token.logoURI} alt={token.symbol} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold">
                    {token.symbol?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <p className="font-bold">{token.symbol}</p>
                  <p className="text-xs text-gray-500">{token.name}</p>
                </div>
              </div>
              <p className="text-xs font-mono break-all text-gray-600 dark:text-gray-400">
                {token.address}
              </p>
            </div>
          )}

          {/* Warning Message */}
          <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-left">
            <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
              <li className="flex gap-2">
                <span className="flex-shrink-0">❌</span>
                <span>Dieser Token ist nicht verifiziert</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">❌</span>
                <span>Könnte ein Scam, Honeypot oder Rug Pull sein</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">❌</span>
                <span>Hohe Steuern oder Verkaufssperren möglich</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">❌</span>
                <span>Keine Garantie für Liquidität</span>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="w-full p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-300 dark:border-yellow-700">
            <p className="text-xs text-yellow-900 dark:text-yellow-100 font-medium">
              ⚠️ <strong>HANDEL AUF EIGENE GEFAHR!</strong><br />
              Sie könnten Ihr gesamtes Investment verlieren. SwapLaunch haftet nicht für Verluste durch unbekannte Tokens.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <Button
              onClick={onReject}
              variant="outline"
              className="flex-1 border-2 border-gray-300 hover:bg-gray-100"
            >
              <X className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>
            <Button
              onClick={onAccept}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
            >
              Ich verstehe die Risiken
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Nur fortfahren, wenn Sie die Risiken vollständig verstehen
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenRiskDisclaimer;
