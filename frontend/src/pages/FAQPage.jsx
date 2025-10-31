import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors px-4"
      >
        <span className="font-semibold text-lg pr-8">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "Was ist SwapLaunch und wie funktioniert es?",
      answer: "SwapLaunch ist eine dezentrale Multi-DEX-Aggregator-Plattform, die Ihnen ermöglicht, Kryptowährungen über mehrere Blockchains (Ethereum, BSC, Polygon, Solana) zu tauschen. Wir durchsuchen mehrere dezentrale Börsen gleichzeitig, um Ihnen die besten Preise und niedrigsten Gebühren zu bieten. Sie behalten jederzeit die vollständige Kontrolle über Ihre Wallet – wir verwahren niemals Ihre Gelder."
    },
    {
      question: "Welche Netzwerke und Blockchains werden unterstützt?",
      answer: "SwapLaunch unterstützt derzeit vier Haupt-Blockchains: Ethereum (ETH), Binance Smart Chain (BSC), Polygon (MATIC) und Solana (SOL). Sie können Tokens auf jedem dieser Netzwerke tauschen. Für Cross-Chain-Transfers (zwischen verschiedenen Netzwerken) bieten wir eine Bridge-Funktionalität über Partner wie Synapse, Stargate, Across und Wormhole an."
    },
    {
      question: "Wie sicher ist SwapLaunch? Sind meine Gelder sicher?",
      answer: "Ja, SwapLaunch ist vollständig non-custodial, das heißt, wir haben niemals Zugriff auf Ihre privaten Schlüssel oder Gelder. Alle Swaps werden direkt über Smart Contracts auf der Blockchain ausgeführt. Zusätzlich bieten wir eine Token-Sicherheitsanalyse über GoPlus Security API an, die vor potenziellen Honeypots, Scam-Tokens und hohen Steuern warnt. Überprüfen Sie immer die Transaktionsdetails in Ihrer Wallet, bevor Sie signieren."
    },
    {
      question: "Was sind die Gebühren für Swaps?",
      answer: "SwapLaunch erhebt eine kleine Plattformgebühr von 0,2% auf jeden Swap. Zusätzlich fallen die normalen Netzwerkgebühren (Gas Fees) der jeweiligen Blockchain an. Diese variieren je nach Netzwerkauslastung. Wir zeigen Ihnen vor jedem Swap eine detaillierte Übersicht aller Gebühren an, sodass Sie genau wissen, was Sie bezahlen."
    },
    {
      question: "Was ist Auto-Slippage und sollte ich es verwenden?",
      answer: "Auto-Slippage berechnet automatisch die optimale Slippage-Toleranz basierend auf dem Token-Typ und der aktuellen Marktliquidität. Für Stablecoins (USDC, USDT) wird eine niedrige Slippage (~0,1%) verwendet, während für volatile oder illiquide Tokens eine höhere Toleranz (bis 2%) gesetzt wird. Wir empfehlen, Auto-Slippage aktiviert zu lassen, es sei denn, Sie möchten die Slippage manuell kontrollieren."
    },
    {
      question: "Wie finde ich einen bestimmten Token zum Tauschen?",
      answer: "Nutzen Sie unsere leistungsstarke Token-Suchfunktion: Geben Sie einfach den Token-Namen (z.B. 'PEPE'), das Symbol (z.B. 'UNI') oder die Contract-Adresse ein. Die Suche durchsucht automatisch mehrere Quellen wie Dexscreener, CoinGecko und Jupiter Token Registry. Sie können auch Trading-Paare direkt über den 'Select Trading Pair' Button auswählen, um beide Tokens gleichzeitig zu setzen."
    },
    {
      question: "Was bedeuten die Sicherheitswarnungen (Critical, High, Medium)?",
      answer: "Unsere Sicherheitsanalyse bewertet Tokens auf potenzielle Risiken: \n\n• CRITICAL: Honeypot oder Blacklisted – Nicht handeln! \n• HIGH: Hohe Risiken wie Mintable, Proxy Contract – Extreme Vorsicht \n• MEDIUM: Moderate Risiken wie nicht Open Source, Hidden Owner \n• HIGH (Grün): Niedriges Risiko, sicherer Token \n\nWenn ein Token-Paar eine Warnung anzeigt, sollten Sie die Details überprüfen, bevor Sie fortfahren."
    },
    {
      question: "Warum wird 'Swap not available for this pair' angezeigt?",
      answer: "Diese Meldung erscheint, wenn keine Liquidität für das gewählte Token-Paar gefunden wurde oder der Swap auf dieser Chain nicht unterstützt wird. Mögliche Gründe: \n\n• Keine DEX hat Liquidität für dieses Paar \n• Tokens sind auf verschiedenen Chains (nutzen Sie die Bridge) \n• Der Token ist sehr neu oder illiquide \n\nVersuchen Sie, ein anderes Token-Paar zu wählen oder nutzen Sie die Bridge-Funktion für Cross-Chain-Swaps."
    },
    {
      question: "Wie kann ich meine Swap-Historie einsehen?",
      answer: "Klicken Sie auf den 'Connect Wallet' Button oben rechts und dann auf 'History' im Dropdown-Menü. Dort sehen Sie alle Ihre bisherigen Swaps mit Transaktions-Hashes, die Sie direkt zum Block Explorer führen. Die Historie wird lokal in Ihrem Browser gespeichert."
    },
    {
      question: "Was ist der Unterschied zwischen Swap und Bridge?",
      answer: "• Swap: Tauscht Tokens innerhalb derselben Blockchain (z.B. ETH → USDC auf Ethereum) \n• Bridge: Überträgt Assets zwischen verschiedenen Blockchains (z.B. ETH von Ethereum → BSC) \n\nFür Swaps nutzen Sie die Hauptseite, für Bridging navigieren Sie zur Bridge-Seite und wählen einen unserer Partner-Bridges."
    },
    {
      question: "Mein Swap ist fehlgeschlagen. Was soll ich tun?",
      answer: "Häufige Gründe für fehlgeschlagene Swaps: \n\n1. Unzureichende Gas Fees – Erhöhen Sie die Gas-Gebühr in Ihrer Wallet \n2. Slippage zu niedrig – Erhöhen Sie die Slippage-Toleranz \n3. Token mit Transfer-Tax – Manche Tokens haben versteckte Gebühren \n4. Netzwerküberlastung – Warten Sie und versuchen Sie es erneut \n\nÜberprüfen Sie die Fehlermeldung in Ihrer Wallet und passen Sie die Parameter an. Kontaktieren Sie bei anhaltenden Problemen den Support."
    },
    {
      question: "Unterstützt SwapLaunch Hardware-Wallets?",
      answer: "Ja! SwapLaunch ist kompatibel mit allen Wallets, die WalletConnect unterstützen, einschließlich Hardware-Wallets wie Ledger und Trezor. Verbinden Sie einfach Ihre Hardware-Wallet über MetaMask oder eine andere kompatible Wallet-App, und Sie können sicher swappen."
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(129,140,248,.25),transparent),radial-gradient(800px_500px_at_80%_0%,rgba(16,185,129,.18),transparent)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 opacity-80 hover:opacity-100">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Swap</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 text-white text-lg">
              ❓
            </div>
            <div className="text-sm font-semibold tracking-tight">FAQ</div>
          </div>
          <div className="w-[100px]" /> {/* Spacer for symmetry */}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Häufig gestellte Fragen</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Alles, was Sie über SwapLaunch wissen müssen
          </p>
        </div>

        {/* FAQ Items */}
        <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-gray-900/60 overflow-hidden">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-8 rounded-2xl border border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-gray-900/60 p-8 text-center">
          <h3 className="text-xl font-bold mb-3">Frage nicht beantwortet?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Wenn Sie weitere Fragen haben, kontaktieren Sie uns über unsere Community-Kanäle.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://twitter.com/swaplaunch"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://t.me/swaplaunch"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Telegram
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQPage;
