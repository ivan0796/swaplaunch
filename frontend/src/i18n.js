import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.trade": "Trade",
      "nav.projects": "Projects",
      "nav.launchpad": "Launchpad",
      "nav.tokenLocker": "Token Locker",
      "nav.limitDCA": "Limit/DCA",
      "nav.bridge": "Bridge",
      "nav.advertise": "Advertise",
      "nav.faq": "FAQ",
      
      // Swap Page
      "swap.title": "Swap Tokens",
      "swap.subtitle": "Trade crypto across multiple blockchains with advanced security",
      "swap.youPay": "You Pay",
      "swap.youReceive": "You Receive",
      "swap.selectToken": "Select Token",
      "swap.connectWallet": "Connect Wallet",
      "swap.swap": "Swap",
      "swap.swapNotAvailable": "Swap not available",
      "swap.selectTradingPair": "Select Trading Pair",
      
      // Features
      "features.title": "Why SwapLaunch v2.0?",
      "features.subtitle": "Best-in-class features",
      "features.nonCustodial": "Non-custodial - You control your keys",
      "features.bestRates": "Best rates across multiple DEXs",
      "features.multiChain": "13+ Chain support: ETH, BSC, Polygon, Solana, XRP, Tron & more",
      "features.tokenSearch": "🔍 Advanced token search & security scanner",
      "features.transparentFees": "Transparent fee structure (0.2%)",
      "features.referral": "Referral program - Invite & earn",
      
      // Trending
      "trending.title": "Trending",
      "trending.top": "Top",
      "trending.gainers": "Gainers",
      "trending.losers": "Losers",
      "trending.poweredBy": "Powered by CoinGecko",
      
      // New Listings
      "newListings.title": "New on DEX",
      "newListings.noListings": "No new listings found",
      "newListings.poweredBy": "Powered by Dexscreener",
      
      // MEV & Slippage
      "mev.protection": "MEV Protection",
      "mev.protected": "Protected: Your transaction is routed through private RPC to prevent front-running.",
      "mev.notProtected": "Not protected: Standard public RPC routing.",
      "slippage.title": "Slippage",
      "slippage.auto": "Auto",
      "slippage.custom": "Custom",
      "slippage.autoDesc": "Automatically adjusted based on market volatility (0.1-0.5%)",
      "slippage.customDesc": "Set your own slippage tolerance",
      
      // Fee Breakdown
      "fees.breakdown": "Fee Breakdown",
      "fees.dex": "DEX Fee",
      "fees.platform": "Platform Fee",
      "fees.priceImpact": "Price Impact",
      "fees.gas": "Estimated Gas",
      "fees.highImpactWarning": "High price impact! Consider reducing swap amount.",
      
      // Ad Banner
      "ad.advertiseHere": "Advertise Here",
      "ad.premiumSpace": "Premium ad space available",
      "ad.sponsored": "Sponsored"
    }
  },
  de: {
    translation: {
      // Navigation
      "nav.trade": "Handeln",
      "nav.projects": "Projekte",
      "nav.launchpad": "Launchpad",
      "nav.tokenLocker": "Token-Locker",
      "nav.limitDCA": "Limit/DCA",
      "nav.bridge": "Bridge",
      "nav.advertise": "Werben",
      "nav.faq": "FAQ",
      
      // Swap Page
      "swap.title": "Token tauschen",
      "swap.subtitle": "Handel Krypto über mehrere Blockchains mit erweiterten Sicherheitsfunktionen",
      "swap.youPay": "Sie zahlen",
      "swap.youReceive": "Sie erhalten",
      "swap.selectToken": "Token auswählen",
      "swap.connectWallet": "Wallet verbinden",
      "swap.swap": "Tauschen",
      "swap.swapNotAvailable": "Tausch nicht verfügbar",
      "swap.selectTradingPair": "Handelspaar auswählen",
      
      // Features
      "features.title": "Warum SwapLaunch v2.0?",
      "features.subtitle": "Erstklassige Funktionen",
      "features.nonCustodial": "Non-custodial - Sie kontrollieren Ihre Schlüssel",
      "features.bestRates": "Beste Kurse über mehrere DEXs",
      "features.multiChain": "13+ Chain-Unterstützung: ETH, BSC, Polygon, Solana, XRP, Tron & mehr",
      "features.tokenSearch": "🔍 Erweiterte Token-Suche & Sicherheitsscanner",
      "features.transparentFees": "Transparente Gebührenstruktur (0,2%)",
      "features.referral": "Empfehlungsprogramm - Einladen & verdienen",
      
      // Trending
      "trending.title": "Trending",
      "trending.top": "Top",
      "trending.gainers": "Gewinner",
      "trending.losers": "Verlierer",
      "trending.poweredBy": "Powered by CoinGecko",
      
      // New Listings
      "newListings.title": "Neu auf DEX",
      "newListings.noListings": "Keine neuen Listings gefunden",
      "newListings.poweredBy": "Powered by Dexscreener",
      
      // MEV & Slippage
      "mev.protection": "MEV-Schutz",
      "mev.protected": "Geschützt: Ihre Transaktion wird über private RPC geleitet, um Front-Running zu verhindern.",
      "mev.notProtected": "Nicht geschützt: Standard öffentliches RPC-Routing.",
      "slippage.title": "Slippage",
      "slippage.auto": "Auto",
      "slippage.custom": "Benutzerdefiniert",
      "slippage.autoDesc": "Automatisch angepasst basierend auf Marktvolatilität (0,1-0,5%)",
      "slippage.customDesc": "Setzen Sie Ihre eigene Slippage-Toleranz",
      
      // Fee Breakdown
      "fees.breakdown": "Gebührenaufschlüsselung",
      "fees.dex": "DEX-Gebühr",
      "fees.platform": "Plattformgebühr",
      "fees.priceImpact": "Preisauswirkung",
      "fees.gas": "Geschätztes Gas",
      "fees.highImpactWarning": "Hohe Preisauswirkung! Erwägen Sie, den Tauschbetrag zu reduzieren.",
      
      // Ad Banner
      "ad.advertiseHere": "Hier werben",
      "ad.premiumSpace": "Premium-Werbefläche verfügbar",
      "ad.sponsored": "Gesponsert"
    }
  },
  zh: {
    translation: {
      // Navigation
      "nav.trade": "交易",
      "nav.projects": "项目",
      "nav.launchpad": "启动台",
      "nav.tokenLocker": "代币锁定",
      "nav.limitDCA": "限价/DCA",
      "nav.bridge": "跨链桥",
      "nav.advertise": "广告",
      "nav.faq": "常见问题",
      
      // Swap Page
      "swap.title": "代币交换",
      "swap.subtitle": "在多个区块链上交易加密货币，具有高级安全功能",
      "swap.youPay": "您支付",
      "swap.youReceive": "您收到",
      "swap.selectToken": "选择代币",
      "swap.connectWallet": "连接钱包",
      "swap.swap": "交换",
      "swap.swapNotAvailable": "交换不可用",
      "swap.selectTradingPair": "选择交易对",
      
      // Features
      "features.title": "为什么选择 SwapLaunch v2.0？",
      "features.subtitle": "一流的功能",
      "features.nonCustodial": "非托管 - 您控制您的密钥",
      "features.bestRates": "跨多个DEX的最佳汇率",
      "features.multiChain": "支持13+条链：ETH、BSC、Polygon、Solana、XRP、Tron等",
      "features.tokenSearch": "🔍 高级代币搜索和安全扫描器",
      "features.transparentFees": "透明的费用结构 (0.2%)",
      "features.referral": "推荐计划 - 邀请并赚取",
      
      // Trending
      "trending.title": "热门",
      "trending.top": "排行榜",
      "trending.gainers": "涨幅榜",
      "trending.losers": "跌幅榜",
      "trending.poweredBy": "由 CoinGecko 提供支持",
      
      // New Listings
      "newListings.title": "DEX新币",
      "newListings.noListings": "未找到新上市代币",
      "newListings.poweredBy": "由 Dexscreener 提供支持",
      
      // MEV & Slippage
      "mev.protection": "MEV保护",
      "mev.protected": "已保护：您的交易通过私有RPC路由，以防止抢先交易。",
      "mev.notProtected": "未保护：标准公共RPC路由。",
      "slippage.title": "滑点",
      "slippage.auto": "自动",
      "slippage.custom": "自定义",
      "slippage.autoDesc": "根据市场波动自动调整 (0.1-0.5%)",
      "slippage.customDesc": "设置您自己的滑点容差",
      
      // Fee Breakdown
      "fees.breakdown": "费用明细",
      "fees.dex": "DEX费用",
      "fees.platform": "平台费用",
      "fees.priceImpact": "价格影响",
      "fees.gas": "预估Gas",
      "fees.highImpactWarning": "价格影响很高！考虑减少交换金额。",
      
      // Ad Banner
      "ad.advertiseHere": "在此投放广告",
      "ad.premiumSpace": "高级广告位可用",
      "ad.sponsored": "赞助"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;