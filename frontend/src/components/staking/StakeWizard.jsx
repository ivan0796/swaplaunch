import React, { useState } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/button';

const StakeWizard = ({ mode, onClose }) => {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold dark:text-white">
            Stake {mode === 'sol' ? 'SOL' : 'SPL Tokens'}
          </h2>
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
            {[1, 2, 3, 4].map((s) => (
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
                {s < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > s ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            Step {step}/4: {['Select', 'Amount', 'Confirm', 'Success'][step - 1]}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-6">
            <p className="text-blue-900 dark:text-blue-200 font-semibold mb-2">
              🚀 Coming Soon
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              The staking wizard is currently in development. Once launched, you'll be able to 
              stake your {mode === 'sol' ? 'SOL' : 'SPL tokens'} directly from your wallet with 
              full non-custodial security.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StakeWizard;
