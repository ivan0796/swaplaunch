import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';

const FAQPage = () => {
  const [selectedChain, setSelectedChain] = useState(1);
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'What is SwapLaunch?',
      a: 'SwapLaunch is a non-custodial multi-chain platform for swapping tokens, launching projects, and creating NFTs.'
    },
    {
      q: 'Is it safe?',
      a: 'Yes! SwapLaunch is 100% non-custodial. You always control your funds and sign transactions in your own wallet.'
    },
    {
      q: 'Which chains are supported?',
      a: 'We support Ethereum, BNB Chain, Polygon, Arbitrum, Base, Avalanche, and Solana.'
    },
    {
      q: 'What are the fees?',
      a: 'Platform fee is 0.2% per swap. Token launch fees vary by chain (~$2-5). Gas fees are paid directly to the network.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-4xl font-bold mb-2 dark:text-white">Frequently Asked Questions</h1>
          <p className="text-gray-600 dark:text-gray-300">Find answers to common questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <span className="font-semibold dark:text-white">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6 text-gray-600 dark:text-gray-300">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;