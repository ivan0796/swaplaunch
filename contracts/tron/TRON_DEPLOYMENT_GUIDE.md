# Tron Referral Contract - Deployment Guide

## Overview
Complete guide for deploying the SwapLaunch referral contract on TRON blockchain with automatic fee splitting.

---

## Prerequisites

### 1. Install TronBox
```bash
npm install -g tronbox
```

### 2. Install TronWeb
```bash
npm install tronweb
```

### 3. Create TRON Wallet
- Download **TronLink** wallet extension
- Create new wallet and save seed phrase securely
- Get your wallet address (starts with 'T')

---

## Get TRX for Deployment

### Mainnet
1. Buy TRX on exchange (Binance, KuCoin, etc.)
2. Withdraw to your TronLink address
3. Need ~500-1000 TRX for deployment + energy

### Shasta Testnet (Recommended for testing)
1. Visit: https://www.trongrid.io/shasta/#/
2. Enter your address
3. Click "Get 10,000 TRX"
4. Wait 1 minute, repeat if needed

---

## Project Setup

### 1. Initialize TronBox Project
```bash
mkdir tron-referral-contract
cd tron-referral-contract
tronbox init
```

### 2. Add Contract
Copy `FeeTakingRouterTron.sol` to `contracts/` folder

### 3. Configure tronbox.js
```javascript
module.exports = {
  networks: {
    development: {
      privateKey: process.env.PRIVATE_KEY_DEV,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'http://127.0.0.1:9090',
      network_id: '9'
    },
    shasta: {
      privateKey: process.env.PRIVATE_KEY_SHASTA,
      userFeePercentage: 50,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    },
    mainnet: {
      privateKey: process.env.PRIVATE_KEY_MAINNET,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '1'
    }
  },
  solc: {
    version: '0.8.6'
  }
};
```

### 4. Create .env File
```bash
# Never commit this file!
PRIVATE_KEY_SHASTA=your_private_key_here
PRIVATE_KEY_MAINNET=your_private_key_here
FEE_RECIPIENT_ADDRESS=TYourFeeRecipientAddress
```

---

## Compile Contract

```bash
tronbox compile
```

Expected output:
```
Compiling ./contracts/FeeTakingRouterTron.sol...
✓ Compiled successfully
```

---

## Create Migration Script

Create `migrations/2_deploy_contracts.js`:

```javascript
const FeeTakingRouterTron = artifacts.require("FeeTakingRouterTron");

module.exports = function(deployer, network) {
  // Fee recipient address (your treasury wallet)
  const feeRecipient = process.env.FEE_RECIPIENT_ADDRESS;
  
  if (!feeRecipient) {
    throw new Error("FEE_RECIPIENT_ADDRESS not set in .env");
  }
  
  console.log("Deploying to:", network);
  console.log("Fee Recipient:", feeRecipient);
  
  deployer.deploy(FeeTakingRouterTron, feeRecipient).then(() => {
    console.log("\n✅ Contract deployed!");
    console.log("Contract address:", FeeTakingRouterTron.address);
    console.log("\nAdd this to your backend/.env:");
    console.log(`CONTRACT_ROUTER_TRON=${FeeTakingRouterTron.address}`);
  });
};
```

---

## Deploy

### Test on Shasta Testnet
```bash
tronbox migrate --network shasta --reset
```

### Deploy to Mainnet
```bash
# Make sure you have enough TRX!
tronbox migrate --network mainnet --reset
```

Expected output:
```
Running migration: 2_deploy_contracts.js
  Deploying FeeTakingRouterTron...
  ... 0xabc123...
  ✅ Contract deployed at: TXyz789...
  Block number: 12345678
  Gas used: 5,234,567 energy units
```

---

## Verify Contract on TRONSCAN

### 1. Go to TRONSCAN
- Mainnet: https://tronscan.org
- Shasta: https://shasta.tronscan.org

### 2. Search Contract Address
Enter your deployed contract address

### 3. Click "Contract" Tab → "Verify and Publish"

### 4. Fill Form
- **Compiler Version**: 0.8.6
- **Optimization**: Yes
- **Contract Code**: Paste entire `.sol` file
- **Constructor Arguments**: ABI-encoded fee recipient address

### 5. Verify
Click "Verify and Publish"

---

## Post-Deployment Setup

### 1. Update Backend .env
```bash
# Add to /app/backend/.env
CONTRACT_ROUTER_TRON=TYourContractAddress
TRON_RPC_URL=https://api.trongrid.io
TRON_FEE_RECIPIENT=TYourTreasuryAddress
```

### 2. Whitelist DEX Routers

**JustSwap Router:**
```javascript
const TronWeb = require('tronweb');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: 'your_private_key'
});

const contract = await tronWeb.contract().at('TYourContractAddress');

// JustSwap Router V2
await contract.setRouterAllowed(
  'TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax',
  true
).send();

console.log("✅ JustSwap router whitelisted!");
```

**SunSwap Router:**
```javascript
// SunSwap V2 Router
await contract.setRouterAllowed(
  'TRGXHwPWVQBRpqe8jUNy6GZBgGg5K1QwW2',
  true
).send();
```

### 3. Transfer Ownership (Recommended)
Transfer to multisig for security:

```javascript
// Transfer to multisig address
await contract.transferOwnership('TMultisigAddress').send();
```

---

## Testing the Contract

### 1. Register Referral
```javascript
const TronWeb = require('tronweb');
const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: 'user_private_key'
});

const contract = await tronWeb.contract().at('TContractAddress');

// User registers a referral
await contract.registerReferral('TReferrerAddress').send();

console.log("✅ Referral registered!");
```

### 2. Check Referral Info
```javascript
const info = await contract.getReferralInfo('TUserAddress').call();
console.log("Has referrer:", info.hasReferrer);
console.log("Referrer address:", info.referrer);
```

### 3. Get Referrer Stats
```javascript
const stats = await contract.getReferrerStats('TReferrerAddress').call();
console.log("Referral count:", stats.count.toString());
console.log("Total rewards:", stats.totalRewards.toString());
```

---

## Energy & Bandwidth Costs

### Deployment Costs (Approximate)
- **Energy**: ~30,000,000 energy units
- **Bandwidth**: ~5,000 bandwidth points
- **Cost**: ~500-800 TRX (depending on energy price)

### Transaction Costs
| Operation | Energy | Bandwidth | TRX Cost |
|-----------|--------|-----------|----------|
| Register Referral | ~100,000 | 300 | ~1 TRX |
| Execute Swap | ~200,000 | 500 | ~2 TRX |
| Check Stats (free) | 0 | 0 | Free |

### Energy Optimization Tips
1. **Rent Energy**: Use TRON energy rental services (cheaper than burning TRX)
2. **Batch Operations**: Group multiple transactions
3. **Optimize Code**: Minimize storage writes

---

## Common DEX Router Addresses

### Mainnet
```javascript
const ROUTERS = {
  justswap_v2: 'TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax',
  sunswap_v2: 'TRGXHwPWVQBRpqe8jUNy6GZBgGg5K1QwW2',
  sunswap_v3: 'TFKPy5qKpqvN4jqzJqZCjfXcWKrZJ3VDHt'
};
```

### Shasta Testnet
```javascript
const ROUTERS_TESTNET = {
  justswap_testnet: 'TTestnetRouterAddress1',
  sunswap_testnet: 'TTestnetRouterAddress2'
};
```

---

## Integration with Backend

### 1. Install TronWeb in Backend
```bash
cd /app/backend
pip install tronpy
```

### 2. Create Tron Integration Module
Create `/app/backend/tron_integration.py`:

```python
from tronpy import Tron
from tronpy.keys import PrivateKey
import os

# Initialize Tron client
client = Tron(network='mainnet')  # or 'shasta' for testnet

CONTRACT_ADDRESS = os.environ.get('CONTRACT_ROUTER_TRON')

def get_referral_info(user_address: str):
    """Check if user has referrer on-chain"""
    contract = client.get_contract(CONTRACT_ADDRESS)
    result = contract.functions.getReferralInfo(user_address)
    
    return {
        'referrer': result[0],
        'has_referrer': result[1]
    }

def get_referrer_stats(referrer_address: str):
    """Get referrer statistics"""
    contract = client.get_contract(CONTRACT_ADDRESS)
    result = contract.functions.getReferrerStats(referrer_address)
    
    return {
        'referral_count': result[0],
        'total_rewards': result[1] / 1e6  # Convert SUN to TRX
    }
```

### 3. Add API Endpoints to server.py
```python
from tron_integration import get_referral_info, get_referrer_stats

@api_router.get("/referral/tron/stats/{wallet}")
async def get_tron_referral_stats(wallet: str):
    stats = get_referrer_stats(wallet)
    return stats
```

---

## Frontend Integration

### 1. Install TronWeb
```bash
cd /app/frontend
yarn add tronweb
```

### 2. Connect to Contract
```typescript
import TronWeb from 'tronweb';

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io'
});

const contract = await tronWeb.contract().at('TYourContractAddress');
```

### 3. Register Referral
```typescript
// User connects TronLink wallet
if (window.tronWeb && window.tronWeb.ready) {
  const tronWeb = window.tronWeb;
  const userAddress = tronWeb.defaultAddress.base58;
  
  const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
  
  // Register referral
  const tx = await contract.registerReferral(referrerAddress).send();
  
  console.log("TX Hash:", tx);
}
```

---

## Monitoring & Analytics

### Listen to Events
```javascript
// Monitor ReferralRegistered events
contract.ReferralRegistered().watch((err, event) => {
  if (err) return console.error(err);
  
  console.log("New Referral:", {
    user: event.result.user,
    referrer: event.result.referrer,
    timestamp: event.result.timestamp
  });
});

// Monitor SwapExecuted events
contract.SwapExecuted().watch((err, event) => {
  if (err) return console.error(err);
  
  console.log("Swap:", {
    user: event.result.user,
    platformFee: event.result.platformFee,
    referralReward: event.result.referralReward
  });
});
```

---

## Security Best Practices

1. **Use Multisig**: Transfer ownership to Gnosis Safe equivalent on TRON
2. **Audit Contract**: Get professional audit before mainnet
3. **Test Thoroughly**: Test all functions on Shasta testnet
4. **Monitor Events**: Set up event monitoring for unusual activity
5. **Energy Management**: Keep energy buffer for emergency operations

---

## Troubleshooting

### "Insufficient Energy"
- Solution: Freeze TRX for energy or rent energy

### "Contract Execution Failed"
- Check TronScan for exact error
- Verify router is whitelisted
- Ensure user has approved tokens

### "Invalid Address"
- TRON addresses start with 'T'
- Must be base58 encoded
- Check address on TronScan

---

## Resources

- **TronBox Docs**: https://tronbox.io
- **TronScan**: https://tronscan.org
- **TronGrid API**: https://www.trongrid.io
- **TronLink Wallet**: https://www.tronlink.org
- **TRON Developer Hub**: https://developers.tron.network

---

## Support

For issues:
- TRON Discord: https://discord.gg/tron
- TronBox GitHub: https://github.com/tronprotocol/tronbox
- Stack Overflow: Tag `tron`

---

## License
MIT License
