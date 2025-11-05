import React from 'react';
import { useTranslation } from 'react-i18next';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';
import { ChevronDown } from 'lucide-react';

const FAQPage = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqs = [
    {
      question: 'What is SwapLaunch?',
      answer: 'SwapLaunch is a non-custodial multi-chain platform for token swaps and launches. We support Ethereum, BSC, Polygon, Solana, and more. You maintain full control of your assets at all times.'
    },
    {
      question: 'Is SwapLaunch custodial?',
      answer: 'No! SwapLaunch is 100% non-custodial. We never hold your funds. All transactions are executed directly on-chain through smart contracts. Your keys = your crypto.'
    },
    {
      question: 'What are the token launch fees?',
      answer: `Token launch fees vary by blockchain:\n\n• Ethereum: 0.03 ETH (~$93-124)\n• BNB Chain: 0.1 BNB (~$62)\n• Polygon: 50 MATIC (~$30)\n• Solana: 0.5 SOL (~$85)\n\nThese fees include smart contract deployment, liquidity pool creation, and platform service fees. Gas fees are additional and depend on network congestion.`
    },
    {
      question: 'What are the swap fees?',
      answer: 'Swap fees are 0.25% (25 basis points) plus DEX fees and gas. We aggregate liquidity from multiple DEXs to get you the best rates.'
    },
    {
      question: 'How does MEV protection work?',
      answer: 'MEV (Maximal Extractable Value) protection routes your transactions through private mempools to prevent frontrunning and sandwich attacks. Enable it in Settings > Interface > MEV Protection.'
    },
    {
      question: 'Can I use SwapLaunch without connecting a wallet?',
      answer: 'You can browse and explore tokens without a wallet. However, to swap or launch tokens, you need to connect a Web3 wallet like MetaMask, WalletConnect, or Phantom (for Solana).'
    },
    {
      question: 'Which chains are supported?',
      answer: 'We currently support:\n• Ethereum (ETH)\n• BNB Chain (BSC)\n• Polygon (MATIC)\n• Solana (SOL)\n• Arbitrum\n• Base\n• Avalanche\n\nMore chains coming soon!'
    },
    {
      question: 'How do I launch a token?',
      answer: 'Go to Launch → Enter token details (name, symbol, supply) → Select blockchain → Pay launch fee → Your token is deployed! Optionally add liquidity and lock it for trust.'
    },
    {
      question: 'What is the referral program?',
      answer: 'Each wallet gets a unique referral code. Share your code with friends. When they use it for their first swap, they get it for free! You earn rewards for successful referrals. Check your wallet dropdown for your code.'
    },
    {
      question: 'Is my data private?',
      answer: 'Yes! We do not store personal information. Wallet addresses are used only for transactions. See our Privacy Policy for full details.'
    },
    {
      question: 'How can I promote my token?',
      answer: 'Go to Promote → Select your token → Choose promotion package (Featured, Hero Banner, Trending) → Pay with crypto → Your token appears on the homepage! Promotions are on-chain and verifiable.'
    },
    {
      question: 'What is TWAP and Limit orders?',
      answer: 'TWAP (Time-Weighted Average Price) splits your order into smaller parts over time to reduce price impact. Limit orders execute when your target price is reached. Both features help you get better prices for large trades.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <HeaderSlim />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">Frequently Asked Questions</h1>
          <p className="text-gray-600 dark:text-gray-400">Everything you need to know about SwapLaunch</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-semibold dark:text-white">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Still have questions?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Join our community or contact support:
          </p>
          <div className="flex gap-3">
            <a href="https://twitter.com/swaplaunch" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Twitter
            </a>
            <a href="https://t.me/swaplaunch" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Telegram
            </a>
            <a href="https://discord.gg/swaplaunch" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Discord
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
