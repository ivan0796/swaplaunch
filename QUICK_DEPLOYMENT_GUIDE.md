# 🚀 Quick Deployment Guide - Multi-Chain Referral System

## Überblick
Diese Anleitung zeigt dir, wie du das Referral System auf allen Chains deployst.

---

## ⚡ Schnellstart: Was brauchst du?

### Wallets & Guthaben
| Chain | Wallet | Guthaben für Deploy | Wo kaufen? |
|-------|--------|---------------------|------------|
| **Ethereum** | MetaMask | 0.5-1 ETH (~$3000) | Binance, Coinbase |
| **BSC** | MetaMask | 1-2 BNB (~$600) | Binance |
| **Polygon** | MetaMask | 500-1000 MATIC (~$300) | Binance, Coinbase |
| **Base** | MetaMask | 0.05-0.1 ETH (~$300) | Coinbase |
| **Solana** | Phantom | 5-10 SOL (~$1200) | Binance, Coinbase |
| **Tron** | TronLink | 500-1000 TRX (~$150) | Binance |
| **XRP** | Xaman | 50-100 XRP (~$150) | Binance, Coinbase |

**💡 Tipp:** Starte mit **BSC Testnet** (kostenlos!) zum Testen!

---

## 🎯 Deployment Strategie

### Option 1: Alles auf einmal (2-3 Tage Arbeit)
- Deploy alle Chains parallel
- Teuer aber schnell fertig

### Option 2: Schrittweise (Empfohlen! ✅)
1. **Tag 1**: Testnet (BSC Testnet) - Kostenlos testen
2. **Tag 2**: Mainnet Start (BSC + Polygon) - Günstig
3. **Tag 3**: Premium Chains (Ethereum, Solana) - Teuer
4. **Tag 4**: Exoten (Tron, XRP) - Optional

---

## 📋 Schritt-für-Schritt: EVM Chains (ETH, BSC, Polygon, Base)

### 1. Setup (10 Minuten)

```bash
# Terminal öffnen
cd /app/contracts

# Hardhat installieren
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts

# Projekt initialisieren
npx hardhat init
```

### 2. Konfiguration (5 Minuten)

Erstelle `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    // TESTNETS (zum Testen - KOSTENLOS!)
    bsc_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 97
    },
    
    // MAINNETS (echtes Geld!)
    bsc: {
      url: "https://bsc-dataseed.binance.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 56
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 137
    },
    ethereum: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1
    }
  }
};
```

Erstelle `.env`:
```bash
# WICHTIG: Diese Datei NIEMALS committen!
PRIVATE_KEY=dein_private_key_hier
FEE_RECIPIENT=dein_treasury_wallet_hier
ALCHEMY_KEY=optional_für_ethereum
```

### 3. Deployment Script (5 Minuten)

Erstelle `scripts/deploy.js`:
```javascript
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const feeRecipient = process.env.FEE_RECIPIENT;
  const FeeTakingRouterV2 = await ethers.getContractFactory("FeeTakingRouterV2");
  const router = await FeeTakingRouterV2.deploy(feeRecipient);
  await router.waitForDeployment();
  
  const address = await router.getAddress();
  console.log("✅ Contract deployed:", address);
  console.log("\n📝 Add to backend/.env:");
  console.log(`CONTRACT_ROUTER_V2_${network.name.toUpperCase()}=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

### 4. Deploy! (2 Minuten pro Chain)

```bash
# TEST auf BSC Testnet (KOSTENLOS!)
npx hardhat run scripts/deploy.js --network bsc_testnet

# PRODUCTION
npx hardhat run scripts/deploy.js --network bsc
npx hardhat run scripts/deploy.js --network polygon
npx hardhat run scripts/deploy.js --network ethereum
```

### 5. Backend konfigurieren (2 Minuten)

Öffne `/app/backend/.env` und füge hinzu:
```bash
# Contract Adressen (aus Deployment Output)
CONTRACT_ROUTER_V2_ETH=0x...
CONTRACT_ROUTER_V2_BSC=0x...
CONTRACT_ROUTER_V2_POLYGON=0x...

# Treasury Wallet
FEE_RECIPIENT_ADDRESS=0x...
```

```bash
# Backend neu starten
sudo supervisorctl restart backend
```

### 6. DEX Router whitelisten (5 Minuten)

Erstelle `scripts/whitelist-routers.js`:
```javascript
async function main() {
  const routerAddress = await ethers.getContractAt(
    "FeeTakingRouterV2",
    process.env.CONTRACT_ADDRESS
  );

  // BSC: PancakeSwap
  if (network.name === "bsc") {
    await routerAddress.setRouterAllowed(
      "0x10ED43C718714eb63d5aA57B78B54704E256024E",
      true
    );
    console.log("✅ PancakeSwap whitelisted");
  }

  // Polygon: QuickSwap
  if (network.name === "polygon") {
    await routerAddress.setRouterAllowed(
      "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
      true
    );
    console.log("✅ QuickSwap whitelisted");
  }

  // Ethereum: Uniswap V2
  if (network.name === "ethereum") {
    await routerAddress.setRouterAllowed(
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      true
    );
    console.log("✅ Uniswap V2 whitelisted");
  }
}

main();
```

```bash
CONTRACT_ADDRESS=0xDeinContract npx hardhat run scripts/whitelist-routers.js --network bsc
```

### 7. Fertig! ✅

Teste auf deiner Website:
1. Wallet verbinden
2. Referral Code sehen (Wallet Dropdown)
3. Code teilen mit Freund
4. Freund nutzt Code auf Swap
5. Freund swapt → Du bekommst 10% automatisch! 🎉

---

## 🟣 Solana Deployment (30 Minuten)

### 1. Vorbereitung
```bash
# Solana CLI installieren
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor CLI installieren
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.1
avm use 0.30.1
```

### 2. Wallet erstellen
```bash
# Neues Wallet
solana-keygen new --outfile ~/.config/solana/id.json

# Deine Adresse
solana address

# Testnet SOL holen (KOSTENLOS)
solana config set --url https://api.devnet.solana.com
solana airdrop 2
```

### 3. Projekt bauen
```bash
cd /app/contracts/solana-referral

# Dependencies
yarn install

# Build
anchor build

# Program ID
solana address -k target/deploy/swaplaunch_referral-keypair.json
```

### 4. Program ID updaten

Öffne `lib.rs` und `Anchor.toml`, ersetze:
```rust
declare_id!("DeinActualProgramID");
```

Rebuild:
```bash
anchor build
```

### 5. Deploy
```bash
# Testnet (KOSTENLOS)
anchor deploy --provider.cluster devnet

# Mainnet (5-10 SOL nötig)
solana config set --url https://api.mainnet-beta.solana.com
anchor deploy --provider.cluster mainnet
```

### 6. Backend konfigurieren
```bash
# /app/backend/.env
SOLANA_REFERRAL_PROGRAM_ID=DeinProgramID
SOLANA_FEE_RECIPIENT=DeinSolanaWallet
```

---

## 🔴 Tron Deployment (20 Minuten)

### 1. Setup
```bash
npm install -g tronbox
cd /app/contracts/tron
tronbox init
```

### 2. Wallet & TRX
1. TronLink installieren: https://www.tronlink.org
2. Wallet erstellen
3. Testnet TRX: https://www.trongrid.io/shasta

### 3. Deploy
```bash
# Testnet
tronbox migrate --network shasta

# Mainnet
tronbox migrate --network mainnet
```

### 4. Backend
```bash
# /app/backend/.env
CONTRACT_ROUTER_TRON=TDeinContractAddress
TRON_FEE_RECIPIENT=TDeinWallet
```

---

## 💎 XRP Deployment (15 Minuten)

### 1. Backend Setup (Keine Smart Contracts nötig!)
```bash
cd /app/backend
pip install xrpl-py
```

### 2. Wallet erstellen
```python
from xrpl.wallet import generate_faucet_wallet
from xrpl.clients import JsonRpcClient

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
wallet = generate_faucet_wallet(client)

print("Address:", wallet.classic_address)
print("Seed:", wallet.seed)  # Sicher speichern!
```

### 3. Backend konfigurieren
```bash
# /app/backend/.env
XRP_NETWORK=mainnet
XRP_PLATFORM_WALLET_SEED=dein_seed_hier
```

### 4. Backend neu starten
```bash
sudo supervisorctl restart backend
```

### 5. Fertig! XRP Rewards werden automatisch gesendet ✅

---

## ✅ Checkliste: Ist alles ready?

### EVM Chains (ETH, BSC, Polygon)
- [ ] Contract deployed auf Chain
- [ ] Contract Address in backend/.env
- [ ] DEX Router whitelisted
- [ ] Backend neu gestartet
- [ ] Testswap gemacht

### Solana
- [ ] Program deployed
- [ ] Program ID in backend/.env
- [ ] Backend neu gestartet
- [ ] Test transaction gemacht

### Tron
- [ ] Contract deployed
- [ ] Address in backend/.env
- [ ] JustSwap Router whitelisted
- [ ] Backend neu gestartet

### XRP
- [ ] Wallet erstellt
- [ ] Seed in backend/.env
- [ ] Backend neu gestartet
- [ ] Test payment gemacht

---

## 🎯 Testing: Funktioniert alles?

### Test 1: Referral Code generieren
```bash
# Browser: Wallet verbinden
# Erwartung: Code erscheint im Wallet Dropdown
```

### Test 2: Code nutzen
```bash
# Browser: Anderen User -> Code eingeben
# Erwartung: "Your first swap is FREE!" Message
```

### Test 3: Swap & Reward
```bash
# Browser: Swap machen
# Erwartung: Referrer sieht Reward in Wallet! 🎉
```

### Test 4: Backend API
```bash
# Terminal
curl http://localhost:8001/api/referral/code/0xDeinWallet

# Erwartung: {"code":"ABC12345","uses":0,...}
```

---

## 💰 Kosten Übersicht

| Chain | Deploy | Whitelist | Total | Pro Referral |
|-------|--------|-----------|-------|--------------|
| **BSC** | ~1 BNB | ~0.1 BNB | ~$330 | ~$0.02 |
| **Polygon** | ~500 MATIC | ~10 MATIC | ~$150 | ~$0.01 |
| **Ethereum** | ~0.3 ETH | ~0.05 ETH | ~$1050 | ~$0.50 |
| **Solana** | ~5 SOL | - | ~$1200 | ~$0.001 |
| **Tron** | ~600 TRX | ~50 TRX | ~$200 | ~$0.002 |
| **XRP** | Kostenlos! | - | $0 | ~$0.00001 |

**💡 Sparplan:** BSC + Polygon zuerst = ~$500 Total

---

## 🆘 Häufige Probleme

### "Insufficient funds for gas"
**Lösung:** Mehr ETH/BNB/MATIC in Wallet senden

### "Router not whitelisted"
**Lösung:** Router whitelisten via `setRouterAllowed()`

### "Cannot refer yourself"
**Lösung:** Normal! User kann sich nicht selbst referren

### Backend startet nicht
```bash
# Logs checken
tail -f /var/log/supervisor/backend.err.log

# Neu starten
sudo supervisorctl restart backend
```

---

## 📚 Vollständige Guides

Detaillierte Guides für jede Chain:
- EVM: `/app/contracts/DEPLOYMENT_GUIDE.md`
- Solana: `/app/contracts/solana-referral/SOLANA_DEPLOYMENT_GUIDE.md`
- Tron: `/app/contracts/tron/TRON_DEPLOYMENT_GUIDE.md`
- XRP: `/app/contracts/xrp/XRP_REFERRAL_GUIDE.md`

System-Übersicht: `/app/REFERRAL_SYSTEM_README.md`

---

## 🎉 Erfolg!

Wenn alles läuft:
1. User A teilt Code → User B nutzt Code
2. User B swapt → Contract splittet automatisch
3. User A bekommt 10% direkt in Wallet! 💰

**Fully non-custodial. Fully automatic. Fully awesome! 🚀**

---

## 💬 Support

Fragen? Schau in die detaillierten Guides oder melde dich!

**Viel Erfolg beim Deployment! 🎉**
