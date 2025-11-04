import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const StakingFAQ = ({ mode }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = {
    sol: [
      {
        q: 'What is SOL staking?',
        a: 'SOL staking allows you to delegate your SOL tokens to a validator to help secure the Solana network. In return, you earn staking rewards (typically 7-9% APY). Your SOL remains in your wallet - we never hold or custody your funds.',
      },
      {
        q: 'Is this non-custodial?',
        a: 'Yes, 100% non-custodial. You sign all transactions in your own wallet (Phantom, Solflare, etc.). We never have access to your private keys or funds. All staking happens on-chain through native Solana delegation.',
      },
      {
        q: 'How do you earn fees?',
        a: 'Our revenue comes from validator commission (8%), which is standard for Solana validators. This commission is deducted from staking rewards by the validator itself, not by our app. No additional fees are charged.',
      },
      {
        q: 'Can I unstake anytime?',
        a: 'You can initiate unstaking (deactivate) at any time. However, Solana has a cooldown period of 1-2 epochs (~2-4 days) before your SOL becomes withdrawable. This is a protocol-level requirement, not our restriction.',
      },
      {
        q: 'What are the risks?',
        a: 'Staking risks include: (1) Validator performance - if your chosen validator has downtime, you earn fewer rewards. (2) Slashing (very rare on Solana). (3) Smart contract risks (minimal for native staking). Always DYOR before staking.',
      },
    ],
    spl: [
      {
        q: 'What is SPL token staking?',
        a: 'SPL token staking allows you to lock your tokens in a staking contract to earn rewards. This is typically higher APY (12-18%) than SOL staking, but comes with smart contract risk. All transactions are signed by you.',
      },
      {
        q: 'Is this non-custodial?',
        a: 'Yes, completely non-custodial. Your tokens are locked in an on-chain staking contract, not held by us. You sign all stake/unstake/claim transactions. We only provide the UI and read-only data.',
      },
      {
        q: 'What fees do you charge?',
        a: 'We charge 5% on rewards (not principal). This is transparent and collected on-chain via the reward distributor contract. If you earn 100 tokens, you receive 95 tokens and 5 tokens go to the fee collector.',
      },
      {
        q: 'How are rewards distributed?',
        a: 'Rewards are emitted linearly per epoch and distributed to stakers proportionally. You can claim rewards at any time by signing a claim transaction. Unclaimed rewards continue to accumulate on-chain.',
      },
      {
        q: 'What are the risks?',
        a: 'SPL staking risks include: (1) Smart contract bugs (audit status shown below). (2) Token price volatility. (3) Unbonding periods (varies by token). (4) Reward rate changes. Always verify the staking contract address and DYOR.',
      },
    ],
  };

  const faqs = faqData[mode];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-semibold text-gray-900 dark:text-white">
              {faq.q}
            </span>
            {openIndex === index ? (
              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}
          </button>

          {openIndex === index && (
            <div className="px-6 pb-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {faq.a}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Additional Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 mt-6">
        <p className="text-sm text-yellow-900 dark:text-yellow-200">
          <strong>⚠️ Important:</strong> Staking involves risks including smart contract vulnerabilities, 
          validator performance issues, and potential loss of funds. APY is variable and not guaranteed. 
          This is not financial advice. Always do your own research (DYOR) before staking any assets.
        </p>
      </div>
    </div>
  );
};

export default StakingFAQ;
