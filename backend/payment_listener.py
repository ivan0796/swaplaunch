"""
Payment Listener für automatische Promotion-Aktivierung
Monitort EVM (ETH, BSC, Polygon) und Solana Chains
"""
import asyncio
import os
from datetime import datetime, timezone, timedelta
from web3 import Web3
from motor.motor_asyncio import AsyncIOMotorClient
import requests

# MongoDB
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['swaplaunch']
promotions_collection = db['promotions']

# Platform wallets
PLATFORM_WALLETS = {
    'ethereum': os.getenv('PROMO_FEE_COLLECTOR_ETH', '').lower(),
    'bsc': os.getenv('PROMO_FEE_COLLECTOR_ETH', '').lower(),
    'polygon': os.getenv('PROMO_FEE_COLLECTOR_MATIC', '').lower(),
    'solana': os.getenv('PROMO_FEE_COLLECTOR_SOL', '')
}

# RPC URLs
RPC_URLS = {
    'ethereum': os.getenv('ETHEREUM_RPC_MAINNET'),
    'bsc': os.getenv('BSC_RPC_MAINNET', 'https://bsc-dataseed.binance.org'),
    'polygon': os.getenv('POLYGON_RPC_MAINNET')
}

# Promotion Plans mit EUR-Preisen
PROMOTION_PLANS = {
    29: {'type': 'trending_boost', 'duration_days': 7, 'auto_social': False},
    41: {'type': 'trending_boost', 'duration_days': 7, 'auto_social': True},  # 29 + 12
    9: {'type': 'featured_banner', 'duration_days': 1},
    39: {'type': 'featured_banner', 'duration_days': 7},
    119: {'type': 'featured_banner', 'duration_days': 30}
}

# USDC/USDT Contract Addresses (6 decimals)
STABLECOINS = {
    'ethereum': {
        'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    },
    'bsc': {
        'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        'USDT': '0x55d398326f99059fF775485246999027B3197955'
    },
    'polygon': {
        'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    }
}

# ERC20 Transfer Event Signature
TRANSFER_EVENT_SIGNATURE = Web3.keccak(text='Transfer(address,address,uint256)').hex()

class PaymentListener:
    def __init__(self, chain: str):
        self.chain = chain
        self.w3 = Web3(Web3.HTTPProvider(RPC_URLS[chain]))
        self.platform_wallet = PLATFORM_WALLETS[chain]
        
    async def scan_recent_blocks(self, blocks_back=10):
        """Scan recent blocks for payments"""
        try:
            latest_block = self.w3.eth.block_number
            from_block = latest_block - blocks_back
            
            for token_symbol, token_address in STABLECOINS[self.chain].items():
                # Get transfer events TO platform wallet
                filter_params = {
                    'fromBlock': from_block,
                    'toBlock': 'latest',
                    'address': token_address,
                    'topics': [
                        TRANSFER_EVENT_SIGNATURE,
                        None,  # from any address
                        '0x' + self.platform_wallet[2:].zfill(64)  # to platform wallet
                    ]
                }
                
                logs = self.w3.eth.get_logs(filter_params)
                
                for log in logs:
                    await self.process_payment(log, token_symbol)
                    
        except Exception as e:
            print(f'Error scanning {self.chain}: {e}')
    
    async def process_payment(self, log, token_symbol):
        """Process a payment and activate promotion"""
        try:
            # Decode transfer amount (6 decimals for USDC/USDT)
            amount_raw = int(log['data'], 16)
            amount = amount_raw / 1_000_000  # 6 decimals
            
            # Get sender address
            from_address = '0x' + log['topics'][1].hex()[26:]
            
            # Get transaction hash
            tx_hash = log['transactionHash'].hex()
            
            # Check if already processed
            existing = await promotions_collection.find_one({'tx_hash': tx_hash})
            if existing:
                print(f'✅ Payment already processed: {tx_hash}')
                return
            
            # Match amount to plan
            # Allow ±2 EUR tolerance for price fluctuations
            plan = None
            for expected_amount, plan_details in PROMOTION_PLANS.items():
                if abs(amount - expected_amount) <= 2:
                    plan = plan_details
                    break
            
            if not plan:
                print(f'⚠️ Unknown payment amount: {amount} EUR from {from_address}')
                return
            
            # Calculate expiry
            duration = timedelta(days=plan['duration_days'])
            start_time = datetime.now(timezone.utc)
            end_time = start_time + duration
            
            # Create promotion entry
            promotion_data = {
                'chain': self.chain,
                'token_address': from_address,  # Assuming sender is token creator
                'type': plan['type'],
                'auto_social': plan.get('auto_social', False),
                'paid_amount': amount,
                'payment_token': token_symbol,
                'tx_hash': tx_hash,
                'payer_address': from_address,
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'status': 'active',
                'created_at': start_time.isoformat()
            }
            
            await promotions_collection.insert_one(promotion_data)
            
            print(f'🎉 Promotion activated! {plan["type"]} for {plan["duration_days"]} days')
            print(f'   TX: {tx_hash}')
            print(f'   Amount: {amount} {token_symbol}')
            
            # TODO: Trigger auto social boost if enabled
            if plan.get('auto_social'):
                await self.trigger_social_boost(promotion_data)
                
        except Exception as e:
            print(f'Error processing payment: {e}')
    
    async def trigger_social_boost(self, promotion):
        """Trigger automatic social media announcement"""
        # TODO: Post to Telegram/Twitter bot
        print(f'📢 Auto Social Boost triggered for {promotion["token_address"]}')

async def start_listeners():
    """Start all chain listeners"""
    chains = ['ethereum', 'bsc', 'polygon']
    
    while True:
        try:
            for chain in chains:
                if not PLATFORM_WALLETS.get(chain):
                    continue
                    
                listener = PaymentListener(chain)
                await listener.scan_recent_blocks(blocks_back=20)
            
            # Wait 30 seconds before next scan
            await asyncio.sleep(30)
            
        except Exception as e:
            print(f'Listener error: {e}')
            await asyncio.sleep(60)

if __name__ == '__main__':
    print('🚀 Starting Payment Listeners...')
    asyncio.run(start_listeners())
