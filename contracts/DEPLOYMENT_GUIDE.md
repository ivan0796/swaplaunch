# FeeTakingRouterV2 Deployment Guide

## Overview
This guide explains how to deploy the FeeTakingRouterV2 smart contract on EVM chains (Ethereum, BSC, Polygon, Base, Arbitrum, Optimism, etc.).

## Prerequisites

1. **Node.js & Hardhat/Foundry** installed
2. **Deployer wallet** with native tokens (ETH/BNB/MATIC) for gas
3. **Fee recipient wallet** address (should be a multisig like Gnosis Safe)

## Deployment Steps

### Option 1: Using Hardhat

#### 1. Install Dependencies
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
```

#### 2. Initialize Hardhat Project
```bash
cd contracts
npx hardhat init
```

#### 3. Configure hardhat.config.js
```javascript
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    ethereum: {
      url: process.env.RPC_ETH || "https://eth.llamarpc.com",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 1
    },
    bsc: {
      url: process.env.RPC_BSC || "https://bsc-dataseed.binance.org",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 56
    },
    polygon: {
      url: process.env.RPC_POLYGON || "https://polygon-rpc.com",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 137
    },
    base: {
      url: process.env.RPC_BASE || "https://mainnet.base.org",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 8453
    },
    arbitrum: {
      url: process.env.RPC_ARBITRUM || "https://arb1.arbitrum.io/rpc",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 42161
    },
    optimism: {
      url: process.env.RPC_OPTIMISM || "https://mainnet.optimism.io",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 10
    },
    // Testnets
    sepolia: {
      url: "https://rpc.sepolia.org",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      base: process.env.BASESCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      optimisticEthereum: process.env.OPTIMISM_API_KEY
    }
  }
};
```

#### 4. Create Deployment Script
Create `scripts/deploy-router-v2.js`:
```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying FeeTakingRouterV2...");
  
  // Fee recipient address (should be your multisig or treasury wallet)
  const FEE_RECIPIENT = process.env.FEE_RECIPIENT_ADDRESS;
  
  if (!FEE_RECIPIENT) {
    throw new Error("FEE_RECIPIENT_ADDRESS not set in .env");
  }
  
  console.log("Fee Recipient:", FEE_RECIPIENT);
  
  // Deploy contract
  const RouterV2 = await hre.ethers.getContractFactory("FeeTakingRouterV2");
  const router = await RouterV2.deploy(FEE_RECIPIENT);
  
  await router.waitForDeployment();
  const address = await router.getAddress();
  
  console.log("FeeTakingRouterV2 deployed to:", address);
  console.log("\n✅ IMPORTANT: Add this to your backend/.env file:");
  console.log(`CONTRACT_ROUTER_V2_${hre.network.name.toUpperCase()}=${address}`);
  
  // Wait for block confirmations before verification
  console.log("\nWaiting for 5 block confirmations...");
  await router.deploymentTransaction().wait(5);
  
  // Verify contract on block explorer
  console.log("\nVerifying contract on block explorer...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [FEE_RECIPIENT]
    });
    console.log("✅ Contract verified successfully");
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### 5. Deploy to Networks

**Test on Sepolia first:**
```bash
npx hardhat run scripts/deploy-router-v2.js --network sepolia
```

**Deploy to Mainnet:**
```bash
# Ethereum
npx hardhat run scripts/deploy-router-v2.js --network ethereum

# BSC
npx hardhat run scripts/deploy-router-v2.js --network bsc

# Polygon
npx hardhat run scripts/deploy-router-v2.js --network polygon

# Base
npx hardhat run scripts/deploy-router-v2.js --network base

# Arbitrum
npx hardhat run scripts/deploy-router-v2.js --network arbitrum

# Optimism
npx hardhat run scripts/deploy-router-v2.js --network optimism
```

### Option 2: Using Remix (Manual Deployment)

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create new file `FeeTakingRouterV2.sol` and paste the contract code
3. Install OpenZeppelin contracts via Remix plugin
4. Compile contract (Compiler: 0.8.20, Optimization: enabled)
5. Connect MetaMask to desired network
6. Deploy with constructor parameter: `_feeRecipient` (your treasury address)
7. Copy deployed contract address

## Post-Deployment Configuration

### 1. Update Backend .env
Add contract addresses to `/app/backend/.env`:
```bash
# FeeTakingRouterV2 Contract Addresses
CONTRACT_ROUTER_V2_ETH=0x...
CONTRACT_ROUTER_V2_BSC=0x...
CONTRACT_ROUTER_V2_POLYGON=0x...
CONTRACT_ROUTER_V2_BASE=0x...
CONTRACT_ROUTER_V2_ARBITRUM=0x...
CONTRACT_ROUTER_V2_OPTIMISM=0x...

# Fee Recipient (your treasury wallet)
FEE_RECIPIENT_ADDRESS=0x...
```

### 2. Whitelist DEX Routers
You need to whitelist DEX routers that users can swap through:

```javascript
// Example: Whitelist Uniswap V2 Router on Ethereum
await routerContract.setRouterAllowed(
  "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2 Router
  true
);

// Common DEX Routers:
// Ethereum: Uniswap V2/V3, SushiSwap
// BSC: PancakeSwap
// Polygon: QuickSwap, SushiSwap
```

### 3. Transfer Ownership (Recommended)
Transfer contract ownership to a multisig wallet (Gnosis Safe):

```javascript
await routerContract.transferOwnership("0x...MultisigAddress");
```

## Testing the Contract

### Test Referral Registration
```javascript
// User registers a referral
await routerContract.connect(user).registerReferral(referrerAddress);

// Check registration
const [referrer, hasReferrer] = await routerContract.getReferralInfo(userAddress);
console.log("Has referrer:", hasReferrer);
console.log("Referrer address:", referrer);
```

### Test Swap with Referral
```javascript
// Execute swap (referral fee split happens automatically)
await tokenIn.approve(routerContract.address, amountIn);
await routerContract.swapViaRouter(
  dexRouterAddress,
  tokenInAddress,
  tokenOutAddress,
  amountIn,
  amountOutMin,
  [tokenInAddress, tokenOutAddress],
  deadline
);

// Check referrer rewards
const [count, totalRewards] = await routerContract.getReferrerStats(referrerAddress);
console.log("Referral count:", count.toString());
console.log("Total rewards:", ethers.utils.formatEther(totalRewards));
```

## Security Considerations

1. **Multisig Ownership**: Use Gnosis Safe for contract ownership
2. **Router Whitelisting**: Only whitelist audited DEX routers
3. **Fee Limits**: Contract enforces max 1% fee (MAX_FEE_BPS = 100)
4. **Reentrancy Protection**: Built-in with ReentrancyGuard
5. **Emergency Recovery**: Owner can recover stuck tokens

## Contract Verification

Verify on block explorers for transparency:
- **Etherscan**: https://etherscan.io/verifyContract
- **BSCScan**: https://bscscan.com/verifyContract
- **PolygonScan**: https://polygonscan.com/verifyContract

## Gas Estimates

- **Deployment**: ~2,000,000 gas
- **Register Referral**: ~50,000 gas
- **Swap with Referral**: ~150,000-250,000 gas (depends on DEX)
- **Swap without Referral**: ~120,000-200,000 gas

## Troubleshooting

### "Router not whitelisted" Error
Solution: Call `setRouterAllowed(routerAddress, true)` as contract owner

### "Referral already registered" Error
Solution: User can only register referral once. Check with `getReferralInfo()`

### "Cannot refer yourself" Error
Solution: User and referrer must be different addresses

## Support

For issues or questions:
- GitHub: [Your Repository]
- Email: dev@swaplaunch.app
- Discord: [Your Discord]

## License
MIT License - See LICENSE file
