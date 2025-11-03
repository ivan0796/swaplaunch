"""
Weekly Revenue Report Generator
================================

Generates aggregated revenue reports from swap transactions.
NO PII - Only aggregated metrics. Non-custodial compliant.

Security:
- All secrets loaded from ENV variables only
- No cleartext emails or API keys in code
- Wallets hashed/pseudonymized only
- Recipient email from REPORT_RECIPIENT env var
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from motor.motor_asyncio import AsyncIOMotorClient
import os
import hashlib
import logging
from decimal import Decimal

logger = logging.getLogger(__name__)

# Security: All configuration from ENV only
MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'swaplaunch_db')
REPORT_TIMEZONE = os.getenv('REPORT_TIMEZONE', 'UTC')
REPORT_CURRENCY = os.getenv('REPORT_CURRENCY', 'USD')
REPORT_LOCALE = os.getenv('REPORT_LOCALE', 'de-DE')


class RevenueReportGenerator:
    """Generates aggregated revenue reports from swap data."""
    
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db = db_client[DB_NAME]
        self.swaps_collection = self.db['swaps']
        self.reports_collection = self.db['reports_weekly']
    
    async def generate_report(self, days: int = 7, dry_run: bool = False) -> Dict[str, Any]:
        """
        Generate aggregated revenue report for the last N days.
        
        Args:
            days: Number of days to include (default: 7)
            dry_run: If True, generate but don't persist
            
        Returns:
            Dict with aggregated metrics (NO PII)
        """
        # Calculate date range
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        logger.info(f"Generating report for {start_date.date()} to {end_date.date()}")
        
        # Aggregate data from swaps (only successful swaps with fee data)
        pipeline = [
            {
                '$match': {
                    'timestamp': {
                        '$gte': start_date,
                        '$lt': end_date
                    },
                    'status': 'completed',
                    # Only include swaps with tiered fee data
                    '$or': [
                        {'fee_usd': {'$exists': True, '$ne': None}},
                        {'amount_in_usd': {'$exists': True}}
                    ]
                }
            },
            {
                '$group': {
                    '_id': None,
                    'total_swaps': {'$sum': 1},
                    'total_revenue': {'$sum': {'$ifNull': ['$fee_usd', 0]}},
                    'total_volume': {'$sum': {'$ifNull': ['$amount_in_usd', 0]}},
                    'fee_percents': {'$push': '$fee_percent'},
                    'chains': {'$push': '$chain'},
                    'tiers': {'$push': '$fee_tier'},
                    'pairs': {'$push': {
                        'chain': '$chain',
                        'token_in': '$token_in_symbol',
                        'token_out': '$token_out_symbol',
                        'fee_usd': {'$ifNull': ['$fee_usd', 0]}
                    }}
                }
            }
        ]
        
        result = await self.swaps_collection.aggregate(pipeline).to_list(length=1)
        
        if not result:
            # No data for period
            return {
                'period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'days': days
                },
                'kpis': {
                    'revenue': 0,
                    'volume': 0,
                    'executed_swaps': 0,
                    'avg_fee_percent': 0
                },
                'chain_breakdown': [],
                'tier_breakdown': [],
                'top_pairs': []
            }
        
        data = result[0]
        
        # Calculate KPIs
        total_revenue = float(data.get('total_revenue', 0))
        total_volume = float(data.get('total_volume', 0))
        total_swaps = data.get('total_swaps', 0)
        
        # Calculate weighted average fee
        fee_percents = [f for f in data.get('fee_percents', []) if f is not None]
        avg_fee_percent = sum(fee_percents) / len(fee_percents) if fee_percents else 0
        
        # Chain breakdown
        chain_breakdown = await self._aggregate_by_chain(start_date, end_date)
        
        # Tier breakdown
        tier_breakdown = await self._aggregate_by_tier(start_date, end_date)
        
        # Top pairs by revenue
        top_pairs = await self._aggregate_top_pairs(start_date, end_date, limit=5)
        
        report = {
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': days,
                'timezone': REPORT_TIMEZONE
            },
            'kpis': {
                'revenue': round(total_revenue, 2),
                'volume': round(total_volume, 2),
                'executed_swaps': total_swaps,
                'avg_fee_percent': round(avg_fee_percent, 3)
            },
            'chain_breakdown': chain_breakdown,
            'tier_breakdown': tier_breakdown,
            'top_pairs': top_pairs,
            'currency': REPORT_CURRENCY,
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Persist report snapshot (NO PII)
        if not dry_run:
            await self._persist_report(report)
        
        return report
    
    async def _aggregate_by_chain(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Aggregate metrics by chain."""
        pipeline = [
            {
                '$match': {
                    'timestamp': {'$gte': start_date, '$lt': end_date},
                    'status': 'completed',
                    'chain': {'$exists': True}
                }
            },
            {
                '$group': {
                    '_id': '$chain',
                    'revenue': {'$sum': {'$ifNull': ['$fee_usd', 0]}},
                    'volume': {'$sum': {'$ifNull': ['$amount_in_usd', 0]}},
                    'count': {'$sum': 1}
                }
            },
            {'$sort': {'revenue': -1}}
        ]
        
        results = await self.swaps_collection.aggregate(pipeline).to_list(length=None)
        
        return [
            {
                'chain': r['_id'],
                'revenue': round(float(r['revenue']), 2),
                'volume': round(float(r['volume']), 2),
                'count': r['count']
            }
            for r in results
        ]
    
    async def _aggregate_by_tier(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Aggregate metrics by fee tier."""
        pipeline = [
            {
                '$match': {
                    'timestamp': {'$gte': start_date, '$lt': end_date},
                    'status': 'completed',
                    'fee_tier': {'$exists': True, '$ne': None}
                }
            },
            {
                '$group': {
                    '_id': '$fee_tier',
                    'revenue': {'$sum': {'$ifNull': ['$fee_usd', 0]}},
                    'count': {'$sum': 1},
                    'avg_fee_percent': {'$avg': '$fee_percent'}
                }
            },
            {'$sort': {'revenue': -1}}
        ]
        
        results = await self.swaps_collection.aggregate(pipeline).to_list(length=None)
        
        return [
            {
                'tier': r['_id'],
                'revenue': round(float(r['revenue']), 2),
                'count': r['count'],
                'avg_fee_percent': round(float(r.get('avg_fee_percent', 0)), 3)
            }
            for r in results
        ]
    
    async def _aggregate_top_pairs(self, start_date: datetime, end_date: datetime, limit: int = 5) -> List[Dict]:
        """Get top trading pairs by revenue."""
        pipeline = [
            {
                '$match': {
                    'timestamp': {'$gte': start_date, '$lt': end_date},
                    'status': 'completed',
                    'token_in_symbol': {'$exists': True},
                    'token_out_symbol': {'$exists': True}
                }
            },
            {
                '$group': {
                    '_id': {
                        'chain': '$chain',
                        'pair': {
                            '$concat': [
                                {'$ifNull': ['$token_in_symbol', 'UNKNOWN']},
                                '/',
                                {'$ifNull': ['$token_out_symbol', 'UNKNOWN']}
                            ]
                        }
                    },
                    'revenue': {'$sum': {'$ifNull': ['$fee_usd', 0]}},
                    'volume': {'$sum': {'$ifNull': ['$amount_in_usd', 0]}},
                    'count': {'$sum': 1}
                }
            },
            {'$sort': {'revenue': -1}},
            {'$limit': limit}
        ]
        
        results = await self.swaps_collection.aggregate(pipeline).to_list(length=None)
        
        return [
            {
                'chain': r['_id']['chain'],
                'pair': r['_id']['pair'],
                'revenue': round(float(r['revenue']), 2),
                'volume': round(float(r['volume']), 2),
                'count': r['count']
            }
            for r in results
        ]
    
    async def _persist_report(self, report: Dict[str, Any]):
        """
        Persist report snapshot to database.
        
        Security: NO PII stored. Recipient hashed only.
        """
        # Hash recipient for audit trail (never store cleartext email)
        recipient = os.getenv('REPORT_RECIPIENT', '')
        salt = os.getenv('RECIPIENT_HASH_SALT', 'default_salt_change_in_production')
        recipient_hash = hashlib.sha256(f"{recipient}{salt}".encode()).hexdigest()[:16]
        
        snapshot = {
            'report_type': 'weekly_revenue',
            'period_start': report['period']['start'],
            'period_end': report['period']['end'],
            'generated_at': report['generated_at'],
            'kpi_summary': report['kpis'],
            'recipient_hash': recipient_hash,  # NEVER cleartext email
            'status': 'generated'
        }
        
        await self.reports_collection.insert_one(snapshot)
        logger.info(f"Report snapshot persisted (recipient_hash: {recipient_hash})")


def format_number_locale(value: float, locale: str = 'de-DE') -> str:
    """Format number according to locale."""
    if locale == 'de-DE':
        return f"{value:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    else:
        return f"{value:,.2f}"


def format_currency(value: float, currency: str = 'USD', locale: str = 'de-DE') -> str:
    """Format currency value."""
    formatted = format_number_locale(value, locale)
    if currency == 'USD':
        return f"${formatted}"
    elif currency == 'EUR':
        return f"{formatted} €"
    else:
        return f"{formatted} {currency}"
