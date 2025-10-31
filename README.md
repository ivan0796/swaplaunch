# SwapLaunch - Non-Custodial Multi-DEX Aggregator

SwapLaunch is a decentralized token swap platform that aggregates liquidity from multiple DEXes across Ethereum, Binance Smart Chain, and Polygon networks.

## Features

- **Non-Custodial**: Your keys, your crypto. We never take custody of your funds
- **Multi-Chain Support**: Trade on Ethereum, BSC, and Polygon
- **Best Rates**: Aggregates quotes from multiple DEXes via 0x Protocol
- **Transparent Fees**: 0.2% platform fee clearly displayed before every swap
- **Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **Swap History**: Track your transaction history

## Tech Stack

### Frontend
- React 19 with wagmi v2 and RainbowKit for wallet connectivity
- ethers.js v6 for Ethereum interactions
- Tailwind CSS + shadcn/ui components
- React Router for navigation

### Backend
- FastAPI (Python) with MongoDB for swap logging
- httpx for async 0x API integration
- In-memory caching (10s TTL) for quotes

### Blockchain Integration
- 0x Swap API for multi-DEX aggregation
- Supports Ethereum mainnet, BSC, and Polygon

## Setup Instructions

### Environment Variables

**Backend (.env):**
```env
FEE_RECIPIENT="0xYourFeeRecipientAddress"
ZEROX_API_KEY=""  # Optional for better rate limits
```

**Frontend (wagmiConfig.js):**
- Update `projectId` with your WalletConnect Project ID from https://cloud.walletconnect.com

### Start Services
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

## API Endpoints

- `GET /api/quote` - Get swap quote from 0x API
- `POST /api/swaps` - Log completed swap
- `GET /api/swaps?wallet_address=0x...` - Get swap history
- `GET /api/health` - Health check

## Security

- **Non-custodial**: Platform never stores private keys
- **Transparent fees**: 0.2% platform fee on output tokens
- **Direct execution**: All swaps execute via user's wallet signature
- **Risk disclosure**: Comprehensive risk page included

## Supported Networks

- Ethereum (Chain ID: 1)
- Binance Smart Chain (Chain ID: 56)  
- Polygon (Chain ID: 137)

## Disclaimer

This is experimental DeFi software. Use at your own risk. Always verify transactions before signing.
