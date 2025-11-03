import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.trade": "Swap",
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
      "ad.sponsored": "Sponsored",
      
      // Launchpad
      "launchpad.title": "Non-Custodial Token Launchpad",
      "launchpad.subtitle": "Launch your own token in minutes. No coding required. Fully decentralized.",
      "launchpad.launchYourToken": "Launch Your Token",
      "launchpad.selectBlockchain": "Select Blockchain",
      "launchpad.tokenName": "Token Name",
      "launchpad.tokenSymbol": "Token Symbol",
      "launchpad.totalSupply": "Total Supply",
      "launchpad.decimals": "Decimals",
      "launchpad.description": "Description",
      "launchpad.optional": "Optional",
      "launchpad.tokenImage": "Token Image",
      "launchpad.advancedFeatures": "Advanced Features",
      "launchpad.antiBotProtection": "Anti-Bot Protection",
      "launchpad.liquidityLock": "Liquidity Lock",
      "launchpad.maxWalletLimit": "Max Wallet Limit",
      "launchpad.launchFee": "Total Launch Fee",
      "launchpad.baseFee": "Base Fee",
      "launchpad.launchToken": "Launch Token",
      "launchpad.launching": "Launching...",
      "launchpad.connectWallet": "Connect Wallet to Launch",
      "launchpad.howItWorks": "How It Works",
      "launchpad.fillDetails": "Fill in token details",
      "launchpad.payFee": "Pay launch fee",
      "launchpad.tokenDeployed": "Token is deployed",
      "launchpad.addLiquidity": "Add liquidity (optional)",
      "launchpad.startTrading": "Start trading",
      "launchpad.nonCustodial": "Non-Custodial",
      "launchpad.nonCustodialDesc": "You maintain full control. We never hold your tokens or funds.",
      "launchpad.lowFee": "Low Fee",
      "launchpad.lowFeeDesc": "Only {fee} ETH launch fee. No hidden costs.",
      "launchpad.instantTrading": "Instant Trading",
      "launchpad.instantTradingDesc": "Token is immediately tradable on all DEXs after launch.",
      "launchpad.tokenLaunched": "Token Launched Successfully!",
      "launchpad.tokenLive": "Your token is now live on the blockchain",
      "launchpad.launchAnother": "Launch Another Token",
      "launchpad.goToSwap": "Go to Swap",
      "launchpad.contractAddress": "Contract Address",
      "launchpad.txHash": "TX Hash",
      
      // NFT Maker
      "nft.title": "Create Unique NFT Collections",
      "nft.subtitle": "Turn your ideas into NFTs with AI. Non-custodial, stored on IPFS.",
      "nft.aiGenerator": "AI NFT Generator",
      "nft.collectionName": "Collection Name",
      "nft.describeCollection": "Describe Your Collection",
      "nft.describeYourCollection": "Describe your collection",
      "nft.style": "Style",
      "nft.colorMood": "Color Mood",
      "nft.background": "Background",
      "nft.uniqueTwist": "Unique Twist (Optional)",
      "nft.collectionSize": "Collection Size",
      "nft.generatePreview": "Generate Free Preview",
      "nft.generating": "Generating...",
      "nft.previewCollection": "Preview Your Collection",
      "nft.backToEdit": "Back to Edit",
      "nft.generateNFTs": "Generate {quantity} NFTs",
      "nft.nonCustodialNote": "Non-Custodial: You sign all transactions. We never hold your keys.",
      
      // Referrals
      "referrals.title": "Earn by Sharing",
      "referrals.subtitle": "Invite friends to SwapLaunch and earn a percentage of platform fees from every swap they make. The more you share, the more you earn!",
      "referrals.program": "Referral Program",
      "referrals.yourLink": "Your Referral Link",
      "referrals.copy": "Copy",
      "referrals.copied": "Copied!",
      "referrals.totalReferrals": "Referrals",
      "referrals.usersInvited": "Users invited",
      "referrals.totalEarned": "Total Earned",
      "referrals.lifetimeRewards": "Lifetime rewards",
      "referrals.available": "Available",
      "referrals.withdrawalsSoon": "Withdrawals coming soon — keep earning!",
      "referrals.howItWorks": "How It Works",
      "referrals.shareLink": "Share Your Link",
      "referrals.shareLinkDesc": "Copy your unique referral link and share it with friends",
      "referrals.friendsTrade": "Friends Trade",
      "referrals.friendsTradeDesc": "Your referrals connect wallet and start trading on SwapLaunch",
      "referrals.earnRewards": "Earn Rewards",
      "referrals.earnRewardsDesc": "You earn 10% of platform fees from every swap they make",
      "referrals.yourReferrals": "Your Referrals",
      "referrals.address": "Address",
      "referrals.joined": "Joined",
      "referrals.swaps": "Swaps",
      "referrals.volume": "Volume",
      "referrals.topReferrers": "Top Referrers",
      "referrals.connectWallet": "Connect Your Wallet",
      "referrals.connectWalletDesc": "Connect your wallet to access your referral dashboard and start earning rewards",
      
      // Portfolio
      "portfolio.title": "My Portfolio",
      "portfolio.connectWallet": "Connect Your Wallet",
      "portfolio.connectWalletDesc": "View your portfolio and track your crypto holdings",
      "portfolio.totalValue": "Total Value",
      "portfolio.totalPnL": "Total P&L",
      "portfolio.assets": "Assets",
      "portfolio.yourHoldings": "Your Holdings",
      "portfolio.nonCustodialNote": "Non-custodial - Read-only data from blockchain",
      
      // Bridge
      "bridge.title": "Cross-Chain Bridge",
      "bridge.comingSoon": "Bridge Integration Coming Soon",
      "bridge.comingSoonDesc": "Cross-chain asset transfers powered by LI.FI will be available here.",
      "bridge.bridgeAssets": "Bridge Assets (Coming Soon)",
      
      // Projects/Explore
      "projects.getFeatured": "Get Your Project Featured",
      "projects.reachTraders": "Reach thousands of traders and investors",
      "projects.basic": "Basic",
      "projects.premium": "Premium",
      "projects.enterprise": "Enterprise",
      "projects.applyNow": "Apply Now",
      "projects.search": "Search projects...",
      "projects.allCategories": "All Categories",
      "projects.featuredProjects": "Featured Projects",
      "projects.allProjects": "All Projects",
      "projects.noProjects": "No projects yet. Be the first to get featured!"
    }
  },
  de: {
    translation: {
      // Navigation
      "nav.trade": "Swap",
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
      "ad.sponsored": "Gesponsert",
      
      // Launchpad
      "launchpad.title": "Non-Custodial Token Launchpad",
      "launchpad.subtitle": "Starten Sie Ihren eigenen Token in Minuten. Keine Programmierung erforderlich. Vollständig dezentralisiert.",
      "launchpad.launchYourToken": "Starten Sie Ihren Token",
      "launchpad.selectBlockchain": "Blockchain auswählen",
      "launchpad.tokenName": "Token-Name",
      "launchpad.tokenSymbol": "Token-Symbol",
      "launchpad.totalSupply": "Gesamtangebot",
      "launchpad.decimals": "Dezimalstellen",
      "launchpad.description": "Beschreibung",
      "launchpad.optional": "Optional",
      "launchpad.tokenImage": "Token-Bild",
      "launchpad.advancedFeatures": "Erweiterte Funktionen",
      "launchpad.antiBotProtection": "Anti-Bot-Schutz",
      "launchpad.liquidityLock": "Liquiditätssperre",
      "launchpad.maxWalletLimit": "Max. Wallet-Limit",
      "launchpad.launchFee": "Gesamte Launch-Gebühr",
      "launchpad.baseFee": "Grundgebühr",
      "launchpad.launchToken": "Token starten",
      "launchpad.launching": "Wird gestartet...",
      "launchpad.connectWallet": "Wallet verbinden zum Starten",
      "launchpad.howItWorks": "So funktioniert's",
      "launchpad.fillDetails": "Token-Details ausfüllen",
      "launchpad.payFee": "Launch-Gebühr bezahlen",
      "launchpad.tokenDeployed": "Token wird bereitgestellt",
      "launchpad.addLiquidity": "Liquidität hinzufügen (optional)",
      "launchpad.startTrading": "Handel starten",
      "launchpad.nonCustodial": "Non-Custodial",
      "launchpad.nonCustodialDesc": "Sie behalten die volle Kontrolle. Wir halten niemals Ihre Token oder Gelder.",
      "launchpad.lowFee": "Niedrige Gebühr",
      "launchpad.lowFeeDesc": "Nur {fee} ETH Launch-Gebühr. Keine versteckten Kosten.",
      "launchpad.instantTrading": "Sofortiger Handel",
      "launchpad.instantTradingDesc": "Token ist sofort nach dem Launch auf allen DEXs handelbar.",
      "launchpad.tokenLaunched": "Token erfolgreich gestartet!",
      "launchpad.tokenLive": "Ihr Token ist jetzt live auf der Blockchain",
      "launchpad.launchAnother": "Weiteren Token starten",
      "launchpad.goToSwap": "Zum Swap",
      "launchpad.contractAddress": "Vertragsadresse",
      "launchpad.txHash": "TX Hash",
      
      // NFT Maker
      "nft.title": "Erstellen Sie einzigartige NFT-Kollektionen",
      "nft.subtitle": "Verwandeln Sie Ihre Ideen mit KI in NFTs. Non-custodial, gespeichert auf IPFS.",
      "nft.aiGenerator": "KI NFT Generator",
      "nft.collectionName": "Kollektionsname",
      "nft.describeCollection": "Beschreiben Sie Ihre Kollektion",
      "nft.describeYourCollection": "Beschreiben Sie Ihre Kollektion",
      "nft.style": "Stil",
      "nft.colorMood": "Farbstimmung",
      "nft.background": "Hintergrund",
      "nft.uniqueTwist": "Einzigartiger Touch (Optional)",
      "nft.collectionSize": "Kollektionsgröße",
      "nft.generatePreview": "Kostenlose Vorschau erstellen",
      "nft.generating": "Wird erstellt...",
      "nft.previewCollection": "Vorschau Ihrer Kollektion",
      "nft.backToEdit": "Zurück zum Bearbeiten",
      "nft.generateNFTs": "{quantity} NFTs erstellen",
      "nft.nonCustodialNote": "Non-Custodial: Sie signieren alle Transaktionen. Wir halten niemals Ihre Schlüssel.",
      
      // Referrals
      "referrals.title": "Verdienen durch Teilen",
      "referrals.subtitle": "Laden Sie Freunde zu SwapLaunch ein und verdienen Sie einen Prozentsatz der Plattformgebühren von jedem Swap, den sie durchführen. Je mehr Sie teilen, desto mehr verdienen Sie!",
      "referrals.program": "Empfehlungsprogramm",
      "referrals.yourLink": "Ihr Empfehlungslink",
      "referrals.copy": "Kopieren",
      "referrals.copied": "Kopiert!",
      "referrals.totalReferrals": "Empfehlungen",
      "referrals.usersInvited": "Eingeladene Benutzer",
      "referrals.totalEarned": "Gesamt verdient",
      "referrals.lifetimeRewards": "Lebenslange Belohnungen",
      "referrals.available": "Verfügbar",
      "referrals.withdrawalsSoon": "Auszahlungen kommen bald — verdienen Sie weiter!",
      "referrals.howItWorks": "So funktioniert's",
      "referrals.shareLink": "Teilen Sie Ihren Link",
      "referrals.shareLinkDesc": "Kopieren Sie Ihren einzigartigen Empfehlungslink und teilen Sie ihn mit Freunden",
      "referrals.friendsTrade": "Freunde handeln",
      "referrals.friendsTradeDesc": "Ihre Empfehlungen verbinden ihre Wallet und beginnen auf SwapLaunch zu handeln",
      "referrals.earnRewards": "Belohnungen verdienen",
      "referrals.earnRewardsDesc": "Sie verdienen 10% der Plattformgebühren von jedem Swap, den sie durchführen",
      "referrals.yourReferrals": "Ihre Empfehlungen",
      "referrals.address": "Adresse",
      "referrals.joined": "Beigetreten",
      "referrals.swaps": "Swaps",
      "referrals.volume": "Volumen",
      "referrals.topReferrers": "Top-Empfehler",
      "referrals.connectWallet": "Verbinden Sie Ihre Wallet",
      "referrals.connectWalletDesc": "Verbinden Sie Ihre Wallet, um auf Ihr Empfehlungs-Dashboard zuzugreifen und Belohnungen zu verdienen",
      
      // Portfolio
      "portfolio.title": "Mein Portfolio",
      "portfolio.connectWallet": "Verbinden Sie Ihre Wallet",
      "portfolio.connectWalletDesc": "Sehen Sie Ihr Portfolio ein und verfolgen Sie Ihre Krypto-Bestände",
      "portfolio.totalValue": "Gesamtwert",
      "portfolio.totalPnL": "Gesamt-P&L",
      "portfolio.assets": "Vermögenswerte",
      "portfolio.yourHoldings": "Ihre Bestände",
      "portfolio.nonCustodialNote": "Non-custodial - Nur-Lese-Daten von der Blockchain",
      
      // Bridge
      "bridge.title": "Cross-Chain Bridge",
      "bridge.comingSoon": "Bridge-Integration kommt bald",
      "bridge.comingSoonDesc": "Cross-Chain-Asset-Transfers powered by LI.FI werden hier verfügbar sein.",
      "bridge.bridgeAssets": "Assets überbrücken (Kommt bald)",
      
      // Projects/Explore
      "projects.getFeatured": "Lassen Sie Ihr Projekt featuren",
      "projects.reachTraders": "Erreichen Sie Tausende von Händlern und Investoren",
      "projects.basic": "Basic",
      "projects.premium": "Premium",
      "projects.enterprise": "Enterprise",
      "projects.applyNow": "Jetzt bewerben",
      "projects.search": "Projekte suchen...",
      "projects.allCategories": "Alle Kategorien",
      "projects.featuredProjects": "Featured-Projekte",
      "projects.allProjects": "Alle Projekte",
      "projects.noProjects": "Noch keine Projekte. Seien Sie der Erste, der gefeatured wird!"
    }
  },
  zh: {
    translation: {
      // Navigation
      "nav.trade": "兑换",
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