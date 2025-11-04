# Pump.fun Auto-Visibility Setup Guide

## Overview
This integration automatically tracks pump.fun tokens and guides users to add liquidity and make first trades to ensure visibility on Dexscreener and Axiom Pulse.

## Architecture (Non-Custodial)

### ✅ What We Do
- Track pump.fun token status via WebSocket
- Monitor Raydium migration events  
- Guide users through LP addition & first trade
- Display success links to Dexscreener/Axiom/Raydium

### ❌ What We DON'T Do
- Store private keys
- Execute transactions
- Hold user funds
- Automatic LP addition or trades

## Components

### Backend (`/app/backend/`)
1. **pump_watcher.py** - WebSocket listener for pump.fun events
   - Tracks token creation
   - Monitors bonding curve progress
   - Detects Raydium migration
   
2. **API Endpoints** (`server.py`)
   - `POST /api/pump/track?mint={address}` - Start tracking token
   - `GET /api/pump/status/{mint}` - Get current status
   - `POST /api/pump/mark-stage?mint={address}&stage={stage}` - Mark user action complete

### Frontend (`/app/frontend/src/`)
1. **Components**
   - `LaunchStatusBar.jsx` - Visual progress tracker
   - `LaunchSuccessLinks.jsx` - Platform links after success
   - `UserActionPrompt.jsx` - Guides user actions (LP, trade)

2. **Config**
   - `visibility.js` - Deep link configuration

3. **Integration**
   - `TokenCreatorPageV2.jsx` - Main launch page with tracking

## User Flow

### 1. Token Launch (Solana/pump.fun)
User creates token → System starts tracking

**Stage: `created`**
- Token on pump.fun bonding curve
- Status bar shows "Token Created" ✓

### 2. Bonding Progress
WebSocket tracks trades on bonding curve

**Stage: `bonding`**
- Progress: 0-100% towards migration threshold
- Status bar shows "Bonding Curve" (in progress)

### 3. Migration to Raydium
When bonding reaches 85 SOL, automatic migration occurs

**Stage: `migrated`**
- System detects pair address
- UserActionPrompt displays: "Add Liquidity" CTA
- Button links to Raydium pool

### 4. User Adds Liquidity (Manual)
User clicks "Add Liquidity on Raydium"
- Opens Raydium in new tab
- User connects wallet & adds LP
- Returns and clicks "I've Added Liquidity"

**Stage: `lp_added`**
- UserActionPrompt displays: "Make First Trade" CTA

### 5. User Makes First Trade (Manual)
User clicks "Trade on Raydium"
- Opens Raydium swap interface
- User performs small trade (0.01-0.1 SOL)
- Returns and clicks "First Trade Complete"

**Stage: `first_trade`**
- LaunchSuccessLinks component appears
- Shows links to:
  - Raydium (trade)
  - Dexscreener (token & pair)
  - Axiom Pulse

## Environment Variables

### Required (Backend)
```bash
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=swaplaunch

# Solana (Optional - for future RPC monitoring)
SOLANA_RPC_MAINNET=https://api.mainnet-beta.solana.com
```

### Optional (Backend)
```bash
# Pump.fun WebSocket (defaults to wss://pumpportal.fun/api/data)
PUMPPORTAL_WS=wss://pumpportal.fun/api/data
```

### Frontend
```bash
# Backend API URL
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

## MongoDB Collections

### `pump_tokens`
```json
{
  "mint": "string",
  "name": "string",
  "symbol": "string",
  "created_at": "ISODate",
  "stage": "created | bonding | migrated | lp_added | first_trade",
  "bonding_progress": 0.0-1.0,
  "migrated": boolean,
  "pair_address": "string | null",
  "migrated_at": "ISODate | null",
  "lp_added_at": "ISODate | null",
  "first_trade_at": "ISODate | null"
}
```

## Testing

### 1. Start Backend
```bash
cd /app/backend
sudo supervisorctl restart backend
```

### 2. Check WebSocket Connection
```bash
tail -f /var/log/supervisor/backend.out.log | grep "PumpPortal"
```

Should see:
```
INFO: Connecting to PumpPortal WebSocket...
INFO: ✅ Connected to PumpPortal
```

### 3. Test API Endpoints
```bash
# Track a token
curl -X POST "http://localhost:8001/api/pump/track?mint=EXAMPLE123"

# Get status
curl "http://localhost:8001/api/pump/status/EXAMPLE123"

# Mark stage complete
curl -X POST "http://localhost:8001/api/pump/mark-stage?mint=EXAMPLE123&stage=lp_added"
```

### 4. Frontend Testing
1. Go to http://localhost:3000/launch
2. Select Solana chain
3. Fill token details
4. Complete launch wizard
5. Verify LaunchStatusBar appears
6. Verify UserActionPrompt shows when migrated
7. Verify LaunchSuccessLinks appear after first_trade

## Security Notes

### Non-Custodial Design
- ✅ All transactions signed by user's wallet
- ✅ No server-side private keys
- ✅ No funds held by platform
- ✅ Users maintain full control

### Read-Only Operations
- WebSocket only receives data
- No transaction signing
- No token transfers
- No LP manipulation

## Troubleshooting

### WebSocket Not Connecting
Check backend logs:
```bash
tail -f /var/log/supervisor/backend.err.log
```

Possible issues:
- Firewall blocking wss:// connections
- PumpPortal API rate limits
- Network connectivity

### Status Not Updating
1. Check MongoDB connection
2. Verify token mint address is correct
3. Check frontend polling interval (10 seconds)

### Links Not Appearing
1. Verify `stage === 'first_trade'`
2. Check `mintAddress` and `pairAddress` are set
3. Inspect browser console for errors

## Future Enhancements

### Phase 2 (Optional)
- Raydium RPC log monitoring for migration detection
- Bonding progress percentage display
- Automatic status refresh without manual clicks
- WebSocket real-time updates to frontend
- Multi-token tracking dashboard

### Integration with Other Platforms
- Jupiter aggregator integration
- Birdeye API for price data
- Dexscreener API for liquidity data

## Support

For issues or questions:
- Check backend logs: `/var/log/supervisor/backend.*.log`
- Check frontend console
- Review MongoDB collections
- Test API endpoints manually

## License
Non-custodial, user-controlled token launch system
