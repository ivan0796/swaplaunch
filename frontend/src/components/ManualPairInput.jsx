import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle, Check } from 'lucide-react';

const ManualPairInput = ({ onSubmit, initialMint = '', initialPair = '' }) => {
  const [mint, setMint] = useState(initialMint);
  const [pair, setPair] = useState(initialPair);
  const [error, setError] = useState('');

  const validateAndSubmit = () => {
    // Basic Solana address validation (base58, 32-44 chars)
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    
    if (!mint || !solanaAddressRegex.test(mint)) {
      setError('Invalid token mint address');
      return;
    }
    
    if (!pair || !solanaAddressRegex.test(pair)) {
      setError('Invalid pair address');
      return;
    }
    
    setError('');
    onSubmit({ mint, pair });
  };

  return (
    <div className="rounded-2xl border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-2">
            Manual Override
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-4">
            If automatic detection is taking too long, you can manually enter your token and pair addresses.
          </p>

          {/* Mint Address */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
              Token Mint Address
            </label>
            <Input
              placeholder="e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
              value={mint}
              onChange={(e) => setMint(e.target.value)}
              className="font-mono text-xs dark:bg-gray-800"
            />
          </div>

          {/* Pair Address */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
              Raydium Pair Address
            </label>
            <Input
              placeholder="e.g., 4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="font-mono text-xs dark:bg-gray-800"
            />
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded text-xs text-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          <Button
            onClick={validateAndSubmit}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Continue with Manual Addresses
          </Button>

          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
            💡 Find your addresses on Solscan or DEXScreener
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualPairInput;
