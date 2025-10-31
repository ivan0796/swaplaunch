# SwapLaunch v2.0 Deployment Checklist

## Pre-Deployment Security Audit

### Configuration Review
- [ ] **Review all .env files** - Ensure no real credentials committed
- [ ] **Regenerate all API keys** from the placeholders used in development
- [ ] **Create Gnosis Safe multisigs** for fee recipients on each chain:
  - [ ] Ethereum: `FEE_RECIPIENT_EVM`
  - [ ] Polygon: `FEE_RECIPIENT_POLY`  
  - [ ] Solana: `FEE_RECIPIENT_SOL`
- [ ] **Update WalletConnect Project ID** with production project
- [ ] **Configure Alchemy API keys** for all RPC endpoints
- [ ] **Obtain 0x API key** (production tier if high volume expected)

### Gnosis Safe Setup (Critical!)

**Why Multisig?**
- Prevents single point of failure
- Requires multiple approvals for fund withdrawals
- Industry best practice for treasury management

**Setup Steps:**
1. Go to https://app.safe.global
2. Create Safe on each chain (Ethereum, Polygon)
3. Add 3-5 trusted signers
4. Set threshold: 3 of 5 signatures (recommended)
5. Save Safe addresses to `.env`
6. **Test transaction** with small amount before going live

**Solana Multisig:**
- Use Squads Protocol: https://squads.so
- Or Serum multisig: https://github.com/project-serum/multisig

## Backend Deployment

### Environment Configuration
- [ ] Set `NODE_ENV=production`
- [ ] Restrict `CORS_ORIGINS` to your frontend domain only
- [ ] Enable MongoDB authentication
- [ ] Configure MongoDB backup strategy
- [ ] Set up log rotation
- [ ] Configure SSL/TLS certificates

### Dependencies & Updates
```bash
cd /app/backend
pip install -r requirements.txt
pip install --upgrade pip setuptools wheel
```

### Database Setup
```bash
# Create indexes for better performance
mongosh

use swaplaunch_db

db.swaps.createIndex({ "wallet_address": 1 })
db.swaps.createIndex({ "chain": 1 })
db.swaps.createIndex({ "timestamp": -1 })
db.swaps.createIndex({ "tx_hash": 1 }, { unique: true, sparse: true })
```

### Service Health Check
- [ ] Test `/api/health` endpoint
- [ ] Verify all 4 chains in `/api/chains`
- [ ] Test EVM quote endpoint (non-mainnet first!)
- [ ] Test Solana quote endpoint
- [ ] Monitor logs for errors

## Frontend Deployment

### Build Configuration
```bash
cd /app/frontend
yarn install
yarn build
```

### Environment Variables
- [ ] Set `REACT_APP_BACKEND_URL` to production backend
- [ ] Update `wagmiConfig.js` with production Project ID
- [ ] Remove development-only features
- [ ] Enable error tracking (e.g., Sentry)

### Performance Optimization
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Implement service worker for offline support
- [ ] Lazy load wallet adapters

## Smart Contract Deployment (Optional)

### Pre-Deployment
- [ ] **Contract audit** by reputable firm (critical!)
- [ ] Test extensively on testnets:
  - [ ] Sepolia (Ethereum)
  - [ ] Amoy (Polygon)
  - [ ] BSC Testnet
- [ ] Verify gas optimization
- [ ] Document all contract interactions

### Deployment Steps

**Testnet First:**
```bash
# Test on Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify contract
npx hardhat verify --network sepolia CONTRACT_ADDRESS FEE_RECIPIENT

# Test swap functionality
# Monitor for issues for 48-72 hours
```

**Mainnet Deployment:**
```bash
# Deploy to Ethereum
npx hardhat run scripts/deploy.js --network ethereum

# Deploy to Polygon
npx hardhat run scripts/deploy.js --network polygon

# Deploy to BSC
npx hardhat run scripts/deploy.js --network bsc
```

### Post-Deployment
- [ ] **Transfer ownership** to Gnosis Safe multisig
- [ ] **Whitelist DEX routers:**
  ```javascript
  // Ethereum
  await contract.setRouterAllowed("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", true); // Uniswap V2
  await contract.setRouterAllowed("0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", true); // Sushiswap
  
  // Polygon
  await contract.setRouterAllowed("0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", true); // Quickswap
  
  // BSC
  await contract.setRouterAllowed("0x10ED43C718714eb63d5aA57B78B54704E256024E", true); // PancakeSwap
  ```
- [ ] **Verify on block explorers**
- [ ] **Update frontend** with contract addresses
- [ ] **Monitor first 10 swaps** closely

## Security Hardening

### API Security
- [ ] Implement rate limiting (Redis-backed)
- [ ] Add request validation middleware
- [ ] Enable API key authentication for sensitive endpoints
- [ ] Set up DDoS protection (Cloudflare)
- [ ] Configure firewall rules

### Monitoring & Alerts
- [ ] Set up Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry)
- [ ] Set up log aggregation (Elasticsearch, Datadog)
- [ ] Create alerting rules:
  - API downtime
  - Unusual swap volumes
  - Failed transactions spike
  - Database errors
  - Low RPC endpoint balance

### Backup Strategy
- [ ] Automated daily MongoDB backups
- [ ] Off-site backup storage
- [ ] Test backup restoration procedure
- [ ] Document recovery process

## Testing in Production

### Smoke Tests (After Deployment)

**Backend:**
```bash
# Health check
curl https://your-domain.com/api/health

# Chains configuration
curl https://your-domain.com/api/chains

# Test EVM quote (Polygon - lower fees)
curl -X POST https://your-domain.com/api/evm/quote \
  -H "Content-Type: application/json" \
  -d '{
    "sellToken": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    "buyToken": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    "sellAmount": "1000000000000000000",
    "takerAddress": "0xYourTestAddress",
    "chain": "polygon"
  }'
```

**Frontend:**
1. Open browser console
2. Connect wallet
3. Attempt small swap on Polygon testnet
4. Verify quote displays correctly
5. Check fee calculation
6. Verify transaction execution
7. Check swap appears in history

### Load Testing
- [ ] Use Artillery or k6 for load testing
- [ ] Test with 100 concurrent users
- [ ] Monitor response times
- [ ] Check database performance
- [ ] Verify caching effectiveness

## Legal & Compliance

### Documentation
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Risk Disclosure accessible
- [ ] Cookie policy (if applicable)
- [ ] Contact information visible

### EU/Bosnia Compliance
- [ ] Review MiCA requirements
- [ ] Consult local legal counsel
- [ ] Determine if licensing required
- [ ] Document KYC/AML procedures (if applicable)
- [ ] Set up customer support channels

### Tax Reporting
- [ ] Document fee collection mechanism
- [ ] Set up accounting system
- [ ] Track swap volumes by jurisdiction
- [ ] Prepare for tax reporting obligations

## Go-Live Checklist

### T-24 Hours Before Launch
- [ ] Final code review
- [ ] Security audit results reviewed
- [ ] All tests passing
- [ ] Staging environment smoke tested
- [ ] Backup procedures tested
- [ ] Rollback plan documented
- [ ] Team briefed on launch procedure

### Launch Day
- [ ] Deploy backend (off-peak hours)
- [ ] Verify backend health
- [ ] Deploy frontend
- [ ] Verify frontend loads
- [ ] Execute test swap with small amount
- [ ] Monitor logs for 30 minutes
- [ ] Enable public access
- [ ] Announce launch (social media, blog)

### T+24 Hours After Launch
- [ ] Review all swap transactions
- [ ] Check error rates
- [ ] Verify fee collection
- [ ] Monitor user feedback
- [ ] Address any critical issues
- [ ] Document lessons learned

## Post-Launch Monitoring

### Daily Tasks (First Week)
- [ ] Review swap logs
- [ ] Check error rates
- [ ] Monitor fee collection
- [ ] Review user feedback
- [ ] Check system resources (CPU, memory, disk)
- [ ] Verify backup success

### Weekly Tasks
- [ ] Analyze swap volumes by chain
- [ ] Review and optimize slow queries
- [ ] Update dependencies (security patches only)
- [ ] Review and respond to user issues
- [ ] Financial reconciliation

### Monthly Tasks
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Dependency updates (major versions)
- [ ] Business metrics analysis
- [ ] Feature prioritization review

## Incident Response Plan

### Critical Issues (P0)
**Definition:** Service completely down or funds at risk

**Response:**
1. Immediately disable affected endpoints
2. Notify all users via banner/social media
3. Investigate root cause
4. Fix and test thoroughly
5. Deploy fix
6. Post-mortem within 48 hours

### High Priority (P1)
**Definition:** Partial service degradation

**Response:**
1. Assess impact and scope
2. Communicate ETA to users
3. Implement fix or workaround
4. Deploy during off-peak hours
5. Monitor closely

### Contact Information
```
Technical Lead: [Name] - [Email] - [Phone]
Operations: [Name] - [Email] - [Phone]
Legal Counsel: [Firm] - [Email] - [Phone]
```

## Success Metrics

### KPIs to Track
- Total swap volume (USD equivalent)
- Number of unique users
- Swaps per chain
- Average swap size
- Fee collection (USD)
- API response times
- Error rate
- User retention

### Goals (First 3 Months)
- [ ] 1,000 unique users
- [ ] $1M in swap volume
- [ ] <1% error rate
- [ ] 99.9% uptime
- [ ] Average response time <500ms

## Emergency Contacts

### Infrastructure
- Alchemy Support: support@alchemy.com
- MongoDB Atlas: support@mongodb.com
- Vercel Support: support@vercel.com

### Security
- Bug Bounty Program: security@your-domain.com
- Emergency Hotline: [Phone]

## Final Sign-Off

- [ ] CEO/Founder approval
- [ ] CTO/Technical Lead approval
- [ ] Legal counsel approval
- [ ] All team members briefed
- [ ] Disaster recovery plan in place
- [ ] Insurance coverage confirmed (if applicable)

---

**Remember**: It's better to delay launch than to rush with unresolved security issues. Users' funds are at stake.

**Date Completed**: _______________
**Signed By**: _______________
**Next Review**: _______________
