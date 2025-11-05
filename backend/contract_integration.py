"""
EVM Smart Contract Integration for Referral System
Handles interaction with FeeTakingRouterV2 contract
"""
import os
from web3 import Web3
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Contract ABI for FeeTakingRouterV2 - key functions only
ROUTER_V2_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "referrer", "type": "address"}],
        "name": "registerReferral",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
        "name": "getReferralInfo",
        "outputs": [
            {"internalType": "address", "name": "referrer", "type": "address"},
            {"internalType": "bool", "name": "hasReferrer", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "referrer", "type": "address"}],
        "name": "getReferrerStats",
        "outputs": [
            {"internalType": "uint256", "name": "count", "type": "uint256"},
            {"internalType": "uint256", "name": "totalRewards", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": True, "internalType": "address", "name": "referrer", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "ReferralRegistered",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "referrer", "type": "address"},
            {"indexed": True, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": False, "internalType": "address", "name": "token", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "ReferralRewardPaid",
        "type": "event"
    }
]

# Chain configurations with contract addresses
# NOTE: These need to be deployed and configured in .env
CHAIN_CONTRACTS = {
    1: {  # Ethereum Mainnet
        "name": "ethereum",
        "rpc": os.environ.get('RPC_ETH', 'https://eth.llamarpc.com'),
        "router_v2": os.environ.get('CONTRACT_ROUTER_V2_ETH', ''),
    },
    56: {  # BSC
        "name": "bsc",
        "rpc": os.environ.get('RPC_BSC', 'https://bsc-dataseed.binance.org'),
        "router_v2": os.environ.get('CONTRACT_ROUTER_V2_BSC', ''),
    },
    137: {  # Polygon
        "name": "polygon",
        "rpc": os.environ.get('RPC_POLYGON', 'https://polygon-rpc.com'),
        "router_v2": os.environ.get('CONTRACT_ROUTER_V2_POLYGON', ''),
    },
    42161: {  # Arbitrum
        "name": "arbitrum",
        "rpc": os.environ.get('RPC_ARBITRUM', 'https://arb1.arbitrum.io/rpc'),
        "router_v2": os.environ.get('CONTRACT_ROUTER_V2_ARBITRUM', ''),
    },
    10: {  # Optimism
        "name": "optimism",
        "rpc": os.environ.get('RPC_OPTIMISM', 'https://mainnet.optimism.io'),
        "router_v2": os.environ.get('CONTRACT_ROUTER_V2_OPTIMISM', ''),
    },
    8453: {  # Base
        "name": "base",
        "rpc": os.environ.get('RPC_BASE', 'https://mainnet.base.org'),
        "router_v2": os.environ.get('CONTRACT_ROUTER_V2_BASE', ''),
    },
}

def get_web3_instance(chain_id: int) -> Optional[Web3]:
    """Get Web3 instance for a specific chain"""
    config = CHAIN_CONTRACTS.get(chain_id)
    if not config or not config['rpc']:
        logger.warning(f"No RPC configured for chain {chain_id}")
        return None
    
    try:
        w3 = Web3(Web3.HTTPProvider(config['rpc']))
        if not w3.is_connected():
            logger.error(f"Failed to connect to {config['name']} RPC")
            return None
        return w3
    except Exception as e:
        logger.error(f"Error creating Web3 instance for chain {chain_id}: {e}")
        return None

def get_router_contract(chain_id: int, w3: Web3 = None):
    """Get router contract instance"""
    if w3 is None:
        w3 = get_web3_instance(chain_id)
        if not w3:
            return None
    
    config = CHAIN_CONTRACTS.get(chain_id)
    if not config or not config.get('router_v2'):
        logger.warning(f"No router contract configured for chain {chain_id}")
        return None
    
    contract_address = config['router_v2']
    if not Web3.is_address(contract_address):
        logger.error(f"Invalid contract address for chain {chain_id}: {contract_address}")
        return None
    
    try:
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=ROUTER_V2_ABI
        )
        return contract
    except Exception as e:
        logger.error(f"Error creating contract instance for chain {chain_id}: {e}")
        return None

async def check_referral_on_chain(wallet_address: str, chain_id: int) -> Dict[str, Any]:
    """
    Check if wallet has a referrer registered on-chain
    
    Returns:
        {
            'has_referrer': bool,
            'referrer': str (address or None),
            'chain': str
        }
    """
    try:
        w3 = get_web3_instance(chain_id)
        if not w3:
            return {'has_referrer': False, 'referrer': None, 'chain': CHAIN_CONTRACTS.get(chain_id, {}).get('name', 'unknown')}
        
        contract = get_router_contract(chain_id, w3)
        if not contract:
            return {'has_referrer': False, 'referrer': None, 'chain': CHAIN_CONTRACTS.get(chain_id, {}).get('name', 'unknown')}
        
        # Call getReferralInfo
        checksum_address = Web3.to_checksum_address(wallet_address)
        referrer, has_referrer = contract.functions.getReferralInfo(checksum_address).call()
        
        return {
            'has_referrer': has_referrer,
            'referrer': referrer if has_referrer else None,
            'chain': CHAIN_CONTRACTS.get(chain_id, {}).get('name', 'unknown')
        }
    except Exception as e:
        logger.error(f"Error checking on-chain referral for {wallet_address} on chain {chain_id}: {e}")
        return {'has_referrer': False, 'referrer': None, 'chain': CHAIN_CONTRACTS.get(chain_id, {}).get('name', 'unknown'), 'error': str(e)}

async def get_referrer_stats_on_chain(wallet_address: str, chain_id: int) -> Dict[str, Any]:
    """
    Get referrer statistics from on-chain data
    
    Returns:
        {
            'referral_count': int,
            'total_rewards': float (in native token),
            'chain': str
        }
    """
    try:
        w3 = get_web3_instance(chain_id)
        if not w3:
            return {'referral_count': 0, 'total_rewards': 0, 'chain': CHAIN_CONTRACTS.get(chain_id, {}).get('name', 'unknown')}
        
        contract = get_router_contract(chain_id, w3)
        if not contract:
            return {'referral_count': 0, 'total_rewards': 0, 'chain': CHAIN_CONTRACTS.get(chain_id, {}).get('name', 'unknown')}
        
        # Call getReferrerStats
        checksum_address = Web3.to_checksum_address(wallet_address)
        count, total_rewards = contract.functions.getReferrerStats(checksum_address).call()
        
        # Convert wei to ETH/BNB/MATIC
        total_rewards_native = w3.from_wei(total_rewards, 'ether')
        
        return {
            'referral_count': count,
            'total_rewards': float(total_rewards_native),
            'total_rewards_wei': total_rewards,
            'chain': CHAIN_CONTRACTS.get(chain_id, {}).get('name', 'unknown')
        }
    except Exception as e:
        logger.error(f"Error getting referrer stats for {wallet_address} on chain {chain_id}: {e}")
        return {'referral_count': 0, 'total_rewards': 0, 'chain': CHAIN_CONTRACTS.get(chain_id, {}).get('name', 'unknown'), 'error': str(e)}

async def get_all_chain_referrer_stats(wallet_address: str) -> Dict[str, Any]:
    """
    Aggregate referrer stats across all supported EVM chains
    
    Returns:
        {
            'total_referrals': int,
            'total_rewards_usd': float,
            'by_chain': [...]
        }
    """
    results = []
    total_referrals = 0
    
    for chain_id in CHAIN_CONTRACTS.keys():
        stats = await get_referrer_stats_on_chain(wallet_address, chain_id)
        if stats.get('referral_count', 0) > 0 or stats.get('total_rewards', 0) > 0:
            results.append(stats)
            total_referrals += stats.get('referral_count', 0)
    
    return {
        'wallet': wallet_address,
        'total_referrals': total_referrals,
        'by_chain': results,
        'note': 'Rewards shown in native token (ETH/BNB/MATIC). USD conversion not included.'
    }

def prepare_register_referral_tx(
    user_wallet: str,
    referrer_wallet: str,
    chain_id: int
) -> Optional[Dict[str, Any]]:
    """
    Prepare transaction data for registerReferral function
    Frontend will sign and send this transaction
    
    Returns transaction data dict or None if error
    """
    try:
        w3 = get_web3_instance(chain_id)
        if not w3:
            return None
        
        contract = get_router_contract(chain_id, w3)
        if not contract:
            return None
        
        user_checksum = Web3.to_checksum_address(user_wallet)
        referrer_checksum = Web3.to_checksum_address(referrer_wallet)
        
        # Build transaction
        tx_data = contract.functions.registerReferral(referrer_checksum).build_transaction({
            'from': user_checksum,
            'nonce': w3.eth.get_transaction_count(user_checksum),
            'gas': 100000,  # Estimate, will be replaced by frontend
            'gasPrice': w3.eth.gas_price,
        })
        
        return {
            'to': contract.address,
            'data': tx_data['data'],
            'value': '0x0',
            'gas': hex(100000),
            'chain_id': chain_id,
            'chain': CHAIN_CONTRACTS.get(chain_id, {}).get('name', 'unknown')
        }
    except Exception as e:
        logger.error(f"Error preparing registerReferral tx: {e}")
        return None
