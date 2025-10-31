# SwapLaunch Setup & Configuration Guide

This guide walks you through setting up SwapLaunch from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [WalletConnect Configuration](#walletconnect-configuration)
4. [0x API Key Setup](#0x-api-key-setup)
5. [Fee Recipient Configuration](#fee-recipient-configuration)
6. [Testing the Application](#testing-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:
- Node.js 16+ and Yarn installed
- Python 3.11+ installed
- MongoDB running (local or remote)
- A modern web browser (Chrome, Firefox, Brave, etc.)

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project
cd /app

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
yarn install
```

### 2. Configure Environment Variables

#### Backend Configuration

Edit `/app/backend/.env`:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="swaplaunch_db"
CORS_ORIGINS="*"
FEE_RECIPIENT="0xYourFeeRecipientAddress"  # Update this!
ZEROX_API_KEY=""  # Optional, see section below
```

#### Frontend Configuration

Edit `/app/frontend/.env`:

```env
REACT_APP_BACKEND_URL=https://your-domain.com
WDS_SOCKET_PORT=443
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

## WalletConnect Configuration

**IMPORTANT**: WalletConnect is required for wallet connectivity features.

### Step 1: Get Your Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign up or log in with your GitHub account
3. Click "Create New Project"
4. Enter project details:
   - **Project Name**: SwapLaunch
   - **Description**: Non-custodial multi-DEX aggregator
   - **Project Homepage**: Your domain
5. Copy your **Project ID** (format: `abc123def456...`)

### Step 2: Update Configuration

Edit `/app/frontend/src/wagmiConfig.js`:

```javascript
export const config = getDefaultConfig({
  appName: 'SwapLaunch',
  projectId: 'YOUR_PROJECT_ID_HERE', // 👈 Replace with your actual Project ID
  chains: [mainnet, bsc, polygon],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
  },
});
```

**Replace `YOUR_PROJECT_ID_HERE`** with your actual WalletConnect Project ID.

### Step 3: Restart Frontend

```bash
sudo supervisorctl restart frontend
```

## 0x API Key Setup

### Why You Need It

Without an API key, you're limited to:
- **50 requests per hour** (public endpoint)
- Slower response times
- No priority support

With an API key:
- **1,000+ requests per hour** (depending on tier)
- Faster responses
- Better rate limiting
- Priority support

### How to Get Your API Key

1. Visit [0x Dashboard](https://0x.org/docs/introduction/getting-started)
2. Sign up for a free account
3. Navigate to "API Keys" section
4. Click "Create API Key"
5. Copy your API key

### Configure Your API Key

Edit `/app/backend/.env`:

```env
ZEROX_API_KEY="your_0x_api_key_here"
```

### Restart Backend

```bash
sudo supervisorctl restart backend
```

## Fee Recipient Configuration

The fee recipient is the Ethereum address that receives the 0.2% platform fee from each swap.

### Step 1: Choose Your Address

Options:
1. **Your Personal Wallet**: Use your MetaMask or hardware wallet address
2. **Gnosis Safe Multisig**: Recommended for production (requires multiple signatures)
3. **Smart Contract**: Custom treasury contract

**Recommended**: Use a Gnosis Safe multisig for security and governance.

### Step 2: Create a Gnosis Safe (Recommended)

1. Go to [Gnosis Safe](https://app.safe.global)
2. Connect your wallet
3. Click "Create New Safe"
4. Add owners (minimum 2 recommended)
5. Set threshold (e.g., 2 of 3 signatures required)
6. Deploy the Safe
7. Copy the Safe address

### Step 3: Update Configuration

Edit `/app/backend/.env`:

```env
FEE_RECIPIENT="0xYourSafeAddressHere"
```

### Step 4: Restart Backend

```bash
sudo supervisorctl restart backend
```

## Testing the Application

### 1. Backend Health Check

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-31T12:00:00Z",
  "cache_size": 0
}
```

### 2. Frontend Accessibility

Open your browser and navigate to:
- Main page: `https://your-domain.com`
- Risk disclosure: `https://your-domain.com/risk-disclosure`

### 3. Wallet Connection Test

1. Click "Connect Wallet" button
2. Choose your wallet (MetaMask, WalletConnect, etc.)
3. Approve connection
4. Verify your address appears in the header

### 4. Network Switching Test

1. Connect your wallet
2. Click on different network buttons (Ethereum, BSC, Polygon)
3. Approve network switch in your wallet
4. Verify active network indicator

### 5. Quote Fetch Test (Manual)

1. Connect wallet to Ethereum mainnet
2. Select tokens (e.g., ETH → USDC)
3. Enter amount (e.g., 0.1 ETH)
4. Click "Get Quote"
5. Verify quote displays with fee breakdown

**Note**: This requires actual mainnet connection and may incur gas fees.

## Troubleshooting

### Issue: "Invalid Project ID" Error

**Problem**: WalletConnect Project ID not configured correctly

**Solution**:
1. Verify you copied the entire Project ID from WalletConnect Cloud
2. Ensure no extra spaces or quotes in `wagmiConfig.js`
3. Restart frontend: `sudo supervisorctl restart frontend`

### Issue: 0x API Rate Limit Error

**Problem**: Too many requests without API key

**Solution**:
1. Sign up for a free 0x API key
2. Add it to `/app/backend/.env`
3. Restart backend: `sudo supervisorctl restart backend`

### Issue: "Cannot Connect Wallet"

**Problem**: Browser wallet extension not detected

**Solution**:
1. Install MetaMask or another supported wallet
2. Refresh the page
3. Ensure wallet is unlocked
4. Try WalletConnect option

### Issue: Quote Fetch Fails

**Problem**: Invalid token addresses or network issues

**Solution**:
1. Verify you're on the correct network
2. Check token addresses are valid for that network
3. Ensure you have sufficient balance for the swap
4. Check backend logs: `tail -f /var/log/supervisor/backend.err.log`

### Issue: Transaction Fails

**Problem**: Insufficient gas, slippage, or approval needed

**Solution**:
1. Ensure you have enough ETH/BNB/MATIC for gas
2. Check if token approval is needed (separate transaction)
3. Increase slippage tolerance if needed
4. Verify quote hasn't expired (10s cache)

### Issue: MongoDB Connection Error

**Problem**: MongoDB not running or wrong connection string

**Solution**:
1. Check MongoDB is running: `sudo systemctl status mongodb`
2. Verify `MONGO_URL` in `/app/backend/.env`
3. Test connection: `mongosh $MONGO_URL`

### Issue: Frontend Not Loading

**Problem**: Build errors or port conflicts

**Solution**:
1. Check frontend logs: `tail -f /var/log/supervisor/frontend.err.log`
2. Rebuild: `cd /app/frontend && yarn build`
3. Clear cache: `rm -rf node_modules/.cache`
4. Restart: `sudo supervisorctl restart frontend`

## Advanced Configuration

### Custom RPC Endpoints

For better reliability, use custom RPC endpoints in `wagmiConfig.js`:

```javascript
transports: {
  [mainnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY'),
  [bsc.id]: http('https://bsc-dataseed1.binance.org'),
  [polygon.id]: http('https://polygon-rpc.com'),
},
```

### Production Deployment Checklist

- [ ] WalletConnect Project ID configured
- [ ] 0x API key added
- [ ] Fee recipient set to Gnosis Safe multisig
- [ ] Custom RPC endpoints configured
- [ ] SSL certificate installed
- [ ] MongoDB secured with authentication
- [ ] CORS_ORIGINS restricted to your domain
- [ ] Environment variables secured
- [ ] Backup strategy for MongoDB
- [ ] Monitoring and alerting set up
- [ ] Rate limiting configured
- [ ] Error tracking enabled (e.g., Sentry)

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use Gnosis Safe multisig** for fee recipient
3. **Restrict CORS** to your domain only in production
4. **Monitor fee recipient balance** regularly
5. **Keep dependencies updated**: `yarn upgrade` and `pip install -U`
6. **Enable MongoDB authentication** in production
7. **Use HTTPS only** for production deployment
8. **Implement rate limiting** to prevent abuse
9. **Regular security audits** of smart contract integrations
10. **Keep private keys secure** and never share them

## Support & Resources

- **0x Protocol Docs**: https://0x.org/docs
- **WalletConnect Docs**: https://docs.walletconnect.com
- **wagmi Documentation**: https://wagmi.sh
- **Gnosis Safe**: https://help.safe.global

## Next Steps

After successful setup:

1. Test with small amounts on testnets first
2. Monitor swap logs in MongoDB
3. Analyze fee collection
4. Gather user feedback
5. Consider deploying custom smart contracts for additional features
6. Implement advanced features (limit orders, DCA, etc.)

---

**Questions or Issues?** Check the logs first, then review this guide carefully.
