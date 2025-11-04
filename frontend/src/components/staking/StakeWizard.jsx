import React, { useState } from 'react';
import { X, ArrowRight, Check, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';

const StakeWizard = ({ mode, onClose, onStakeComplete, testMode = true }) => {
  const [step, setStep] = useState(1);
  const [selectedValidator, setSelectedValidator] = useState('');
  const [amount, setAmount] = useState('');
  const [showBetaPopup, setShowBetaPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Devnet Validators (Demo Data)
  const devnetValidators = [
    { name: 'Validator A (Devnet)', vote: '7K8DVxtNJGnMtUY1CQJT5jcs8sFGSZTDiG7kowvFpECh', apy: '8.2%' },
    { name: 'Validator B (Devnet)', vote: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF', apy: '7.9%' },
    { name: 'Validator C (Devnet)', vote: 'J1to3PQfXidUUhprQWgdKkQAMWPJAEqSJ7amkBDE9qhF', apy: '8.5%' },
  ];

  const handleDelegate = () => {
    setShowBetaPopup(true);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">
              Stake {mode === 'sol' ? 'SOL' : 'SPL Tokens'}
            </h2>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              🧪 Beta Demo - No Real Transactions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      step > s ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            Step {step}/3: {['Select Validator', 'Enter Amount', 'Confirm'][step - 1]}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Validator */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg dark:text-white mb-4">
                Select a Validator (Devnet)
              </h3>
              
              {devnetValidators.map((validator) => (
                <div
                  key={validator.vote}
                  onClick={() => setSelectedValidator(validator.vote)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedValidator === validator.vote
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold dark:text-white">{validator.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {validator.vote.slice(0, 8)}...{validator.vote.slice(-6)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">APY</p>
                      <p className="text-lg font-bold text-green-600">{validator.apy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Enter Amount */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg dark:text-white">
                How much SOL to stake?
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Amount (SOL)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl h-16"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Available: 10.5 SOL (Demo)
                </p>
              </div>

              {/* Estimated Rewards */}
              {amount && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-green-900 dark:text-green-200">
                      Estimated Rewards
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ~{(parseFloat(amount) * 0.08).toFixed(4)} SOL/year
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Based on 8% APY (after 8% validator commission)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg dark:text-white mb-4">
                Confirm Delegation
              </h3>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Validator:</span>
                  <span className="font-semibold dark:text-white">
                    {devnetValidators.find(v => v.vote === selectedValidator)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-semibold dark:text-white">{amount} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Expected APY:</span>
                  <span className="font-semibold text-green-600">~8%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleDelegate}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  size="lg"
                >
                  Delegate (Wallet)
                </Button>

                <Button
                  onClick={() => setShowBetaPopup(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Deactivate (Wallet)
                </Button>

                <Button
                  onClick={() => setShowBetaPopup(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Withdraw (Wallet)
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-between gap-3">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <div className="flex gap-2">
            {step > 1 && (
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
            )}
            {step < 3 && (
              <Button
                onClick={handleNext}
                disabled={step === 1 ? !selectedValidator : !amount}
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Beta Popup */}
      {showBetaPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center dark:text-white mb-3">
              Beta-Feature
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Diese Funktion ist in der Beta-Phase. Transaktionen werden bald wallet-signiert 
              verfügbar sein. Aktuell ist dies nur eine UI-Vorschau ohne echte Blockchain-Interaktion.
            </p>
            <Button
              onClick={() => setShowBetaPopup(false)}
              className="w-full"
            >
              Verstanden
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeWizard;
