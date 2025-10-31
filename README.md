# SwapLaunch v2.0 - Multi-Chain Non-Custodial DEX Aggregator

SwapLaunch is a comprehensive decentralized token swap platform that aggregates liquidity across **4 major blockchains**: Ethereum, BSC, Polygon, and Solana.

## 🚀 Features

- **4-Chain Support**: Ethereum, BNB Chain (BSC), Polygon, Solana
- **Non-Custodial**: Your keys, your crypto - we never have access to your funds
- **Best Rates**: Aggregates quotes from multiple DEXs via 0x Protocol (EVM) and Jupiter (Solana)
- **Transparent Fees**: 0.2% platform fee clearly displayed before every swap
- **Universal Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, Phantom (Solana)
- **Smart Contracts**: Optional FeeTakingRouter.sol for custom routing
- **Swap History**: Complete transaction tracking across all chains
- **Production Ready**: Secure architecture with multisig support

## 📊 Architecture

### Tech Stack

**Frontend:**
- React 19 with TypeScript support
- wagmi v2 + RainbowKit (EVM chains)
- @solana/web3.js + Phantom adapter (Solana)
- ethers.js v6 for blockchain interactions
- Tailwind CSS + shadcn/ui components

**Backend:**
- FastAPI (Python) with async/await
- MongoDB for swap logging
- httpx for API integrations
- In-memory caching (10s TTL)
- Multi-chain RPC management

**Smart Contracts (Optional):**
- Solidity 0.8.20
- Hardhat development framework
- OpenZeppelin contracts
- FeeTakingRouter for custom DEX routing

**Integrations:**
- 0x Protocol API (Ethereum, BSC, Polygon)
- Jupiter API (Solana)
- Alchemy RPC providers
- WalletConnect v2

## 🎯 Quick Start

### Prerequisites
- Node.js 16+ with Yarn
- Python 3.11+
- MongoDB (local or remote)
- WalletConnect Project ID
- Alchemy API key (recommended)

### 1. Configure Environment Variables

**Important**: See `.env.example` for detailed configuration. The repository contains PLACEHOLDER credentials used in development. You MUST replace them with your own.

```bash
# Copy example files
cp .env.example backend/.env

# Edit backend/.env with your credentials:
# - Fee recipient addresses (use Gnosis Safe multisig!)
# - RPC endpoints (Alchemy API key)
# - 0x API key
# - WalletConnect Project ID
```

**Critical Security Notes:**
- All credentials in the repo are PLACEHOLDERS
- Generate your own keys and addresses
- Use Gnosis Safe multisig for fee recipients
- Never commit real credentials to git

### 2. Update WalletConnect Configuration

Edit `/app/frontend/src/wagmiConfig.js`:
```javascript
projectId: 'YOUR_WALLETCONNECT_PROJECT_ID'
```

Get your Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)

### 3. Start Services

```bash
# Backend
cd /app/backend
pip install -r requirements.txt
sudo supervisorctl restart backend

# Frontend  
cd /app/frontend
yarn install
sudo supervisorctl restart frontend
```

## 📡 API Documentation

### Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:8001/api
```

### Endpoints

#### GET /api/
Health check and API information
```json
{
  "message": "SwapLaunch API v2.0",
  "status": "operational",
  "supported_chains": ["ethereum", "bsc", "polygon", "solana"]
}
```

#### POST /api/evm/quote
Get swap quote for EVM chains (Ethereum, BSC, Polygon)

**Request:**
```json
{
  "sellToken": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "buyToken": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "sellAmount": "1000000000000000000",
  "takerAddress": "0x...",
  "chain": "ethereum"
}
```

**Response:**
```json
{
  "to": "0x...",
  "data": "0x...",
  "value": "0",
  "buyAmount": "2500000000",
  "platformFee": "0.2",
  "feeRecipient": "0x790C38b310339003154d9A987e0cf1C74d978100"
}
```

#### POST /api/solana/quote
Get swap quote for Solana via Jupiter

**Request:**
```json
{
  "inputMint": "So11111111111111111111111111111111111111112",
  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "amount": "1000000000",
  "slippageBps": 50,
  "takerPublicKey": "..."
}
```

**Response:**
```json
{
  "chain": "solana",
  "quote": {...},
  "platformFee": {
    "percentage": "0.2",
    "amount": "5000000",
    "recipient": "3U1LsnQK4KDvPdSgBcPPi7o6XNRs1EWm6jqJxpjw7CqV"
  },
  "netOutputAmount": "2495000000"
}
```

#### POST /api/swaps
Log completed swap transaction

#### GET /api/swaps?wallet_address=0x...&chain=ethereum
Get swap history with filters

#### GET /api/chains
List all supported chains and their configuration

## 🔐 Security & Best Practices

### Non-Custodial Architecture
- ✅ Platform never stores or accesses private keys
- ✅ All transactions require explicit user signature
- ✅ No custody of funds at any point
- ✅ Direct interaction with DEX protocols

### Fee Recipient Configuration

**Development/Testing:**
```env
FEE_RECIPIENT_EVM="0x790C38b310339003154d9A987e0cf1C74d978100"
```

**Production (REQUIRED):**
1. Deploy Gnosis Safe multisig on each chain
2. Add 3-5 trusted signers
3. Set threshold (e.g., 3 of 5 signatures required)
4. Update `.env` with Safe addresses:

```env
FEE_RECIPIENT_EVM="0xYourGnosisSafeAddress"
FEE_RECIPIENT_SOL="YourSolanMultisigAddress"
FEE_RECIPIENT_POLY="0xYourPolygonGnosisSafeAddress"
```

### Smart Contract Security

The optional FeeTakingRouter.sol contract includes:
- ✅ ReentrancyGuard protection
- ✅ Ownable with transferOwnership
- ✅ Router whitelisting
- ✅ Fee cap (max 1%)
- ✅ Emergency token recovery

**Production Checklist:**
- [ ] Audit contracts before mainnet deployment
- [ ] Test thoroughly on testnets
- [ ] Transfer ownership to Gnosis Safe
- [ ] Whitelist only verified DEX routers
- [ ] Set up monitoring and alerts

## 🏗️ Smart Contract Deployment

### Setup

```bash
# Install Hardhat dependencies
yarn install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

### Deploy to Testnet

```bash
# Sepolia (Ethereum testnet)
npx hardhat run scripts/deploy.js --network sepolia

# Polygon Amoy (Polygon testnet)
npx hardhat run scripts/deploy.js --network amoy

# BSC Testnet
npx hardhat run scripts/deploy.js --network bscTestnet
```

### Deploy to Mainnet

```bash
# !!! CAUTION: Real money involved !!!
npx hardhat run scripts/deploy.js --network ethereum
```

### Verify Contract

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS FEE_RECIPIENT_ADDRESS
```

### Post-Deployment Steps

1. **Transfer ownership to multisig:**
```javascript
await contract.transferOwnership(GNOSIS_SAFE_ADDRESS);
```

2. **Whitelist DEX routers:**
```javascript
await contract.setRouterAllowed(UNISWAP_V2_ROUTER, true);
await contract.setRouterAllowed(SUSHISWAP_ROUTER, true);
```

3. **Update frontend** with contract address

## 🌍 Supported Chains & DEXs

### Ethereum (Chain ID: 1)
- **DEXs**: Uniswap, Sushiswap, Curve, Balancer
- **API**: 0x Protocol
- **RPC**: Alchemy recommended

### BSC (Chain ID: 56)
- **DEXs**: PancakeSwap, Biswap, ApeSwap
- **API**: 0x Protocol (BSC endpoint)
- **RPC**: Binance public or private

### Polygon (Chain ID: 137)
- **DEXs**: Quickswap, Sushiswap, Curve
- **API**: 0x Protocol (Polygon endpoint)
- **RPC**: Alchemy recommended

### Solana
- **DEXs**: Raydium, Orca, Jupiter aggregator
- **API**: Jupiter V6
- **RPC**: Alchemy or Helius
- **Note**: Ensure fee recipient ATA exists for output tokens

## 📱 Frontend Usage

### EVM Chains Flow

1. User connects wallet (MetaMask, WalletConnect, etc.)
2. Selects network and tokens
3. Frontend requests quote from `/api/evm/quote`
4. Displays quote with breakdown (amount, fees, price impact)
5. User approves (if needed) and signs transaction
6. Transaction executed on-chain
7. Swap logged to database

### Solana Flow

1. User connects Phantom wallet
2. Selects Solana network
3. Frontend requests quote from `/api/solana/quote`
4. Frontend assembles transaction with fee transfer instruction
5. User signs transaction in Phantom
6. Transaction submitted to Solana network
7. Swap logged to database

## 🧪 Testing

### Backend Tests

```bash
cd /app/backend
python -m pytest tests/
```

### Smart Contract Tests

```bash
npx hardhat test
npx hardhat coverage
```

### Frontend Testing

```bash
cd /app/frontend
yarn test
```

### Integration Testing

Use the provided test script:
```bash
cd /app
python backend_test.py
```

## 📈 Monitoring & Analytics

### Swap Metrics

Monitor swaps via MongoDB:
```javascript
db.swaps.aggregate([
  { $group: {
    _id: "$chain",
    total_swaps: { $sum: 1 },
    total_volume: { $sum: { $toDouble: "$amount_in" } }
  }}
])
```

### Fee Collection

Track fees by chain:
```javascript
db.swaps.aggregate([
  { $group: {
    _id: "$chain",
    total_fees: { $sum: { $toDouble: "$fee_amount" } }
  }}
])
```

## 🛠️ Troubleshooting

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed troubleshooting.

Common issues:
- **Wallet won't connect**: Check WalletConnect Project ID
- **0x API errors**: Verify API key and rate limits
- **Solana swaps fail**: Ensure ATA exists for fee recipient
- **MongoDB errors**: Check connection string and permissions

## 📄 Legal & Compliance

### Important Disclaimers

1. **No Investment Advice**: SwapLaunch is software, not financial advice
2. **Experimental Software**: Use at your own risk
3. **No Warranties**: Provided "as is" without guarantees
4. **User Responsibility**: You are responsible for:
   - Understanding risks
   - Tax obligations
   - Legal compliance in your jurisdiction

### Risk Disclosure

Users must acknowledge risks before trading:
- Smart contract vulnerabilities
- Price volatility and slippage
- Irreversible transactions
- Network congestion
- Regulatory uncertainty

See full disclosure at `/risk-disclosure`

### Regulatory Considerations

**Bosnia/EU Operations:**
- Consult legal counsel for MiCA compliance
- Consider registration requirements
- Implement KYC/AML if required
- Document operational procedures

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## 📞 Support & Resources

- **Documentation**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **0x Protocol**: https://0x.org/docs
- **Jupiter**: https://docs.jup.ag
- **wagmi**: https://wagmi.sh
- **Solana**: https://docs.solana.com

## 📜 License

MIT License - See LICENSE file for details

**Disclaimer**: This software is provided "as is" without warranty. The authors are not responsible for any losses incurred. Cryptocurrency trading involves substantial risk.

---

## 🎯 Roadmap

### Phase 1 (Current) ✅
- [x] 4-chain support (ETH, BSC, Polygon, Solana)
- [x] 0x and Jupiter integration
- [x] Non-custodial architecture
- [x] FeeTakingRouter smart contract
- [x] Swap logging and history

### Phase 2 (Planned)
- [ ] Limit orders
- [ ] DCA (Dollar Cost Averaging)
- [ ] Portfolio tracking
- [ ] Price alerts
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### Phase 3 (Future)
- [ ] Additional chains (Arbitrum, Optimism, Base)
- [ ] Cross-chain swaps
- [ ] Liquidity provision interface
- [ ] Governance token
- [ ] DAO structure

---

**Built with ❤️ for the DeFi community**

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

## Quick Start

### Prerequisites
- Node.js 16+ and Yarn
- Python 3.11+
- MongoDB running
- WalletConnect Project ID (get from https://cloud.walletconnect.com)

### Configuration Steps

1. **Update WalletConnect Project ID** (Required for wallet connectivity)
   - Edit `/app/frontend/src/wagmiConfig.js`
   - Replace `YOUR_PROJECT_ID_HERE` with your actual Project ID

2. **Configure Fee Recipient** (Optional - placeholder provided)
   - Edit `/app/backend/.env`
   - Update `FEE_RECIPIENT` with your Ethereum address

3. **Add 0x API Key** (Optional - improves rate limits)
   - Edit `/app/backend/.env`
   - Add your `ZEROX_API_KEY`

4. **Start Services**
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

📖 **For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

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
