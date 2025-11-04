"""
Pump.fun Token Watcher (Non-Custodial)
Only tracks token status - no private keys, no transactions
With resilient reconnect & health checks
"""
import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import websockets
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

PUMPPORTAL_WS = "wss://pumpportal.fun/api/data"
MAX_RECONNECT_ATTEMPTS = 5
RECONNECT_BASE_DELAY = 2  # seconds

class PumpWatcher:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.ws = None
        self.running = False
        self.tracked_tokens = {}  # mint -> status
        
    async def start(self):
        """Start watching pump.fun WebSocket"""
        self.running = True
        while self.running:
            try:
                logger.info("Connecting to PumpPortal WebSocket...")
                async with websockets.connect(PUMPPORTAL_WS) as ws:
                    self.ws = ws
                    
                    # Subscribe to events
                    await ws.send(json.dumps({"method": "subscribeNewToken"}))
                    await ws.send(json.dumps({"method": "subscribeTokenTrade"}))
                    logger.info("✅ Connected to PumpPortal")
                    
                    # Listen for messages
                    async for message in ws:
                        try:
                            data = json.loads(message)
                            await self._handle_event(data)
                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to parse message: {e}")
                        except Exception as e:
                            logger.error(f"Error handling event: {e}")
                            
            except websockets.exceptions.WebSocketException as e:
                logger.error(f"WebSocket error: {e}")
                await asyncio.sleep(5)  # Retry after 5 seconds
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                await asyncio.sleep(5)
    
    async def _handle_event(self, data: Dict[str, Any]):
        """Handle incoming pump.fun events"""
        event_type = data.get("type")
        
        if event_type == "newToken":
            await self._handle_new_token(data)
        elif event_type == "trade":
            await self._handle_trade(data)
        elif event_type == "migration":  # Custom event if available
            await self._handle_migration(data)
    
    async def _handle_new_token(self, data: Dict[str, Any]):
        """Track new token creation"""
        mint = data.get("mint")
        if not mint:
            return
            
        logger.info(f"📢 New token detected: {mint}")
        
        # Store in database
        token_doc = {
            "mint": mint,
            "name": data.get("name"),
            "symbol": data.get("symbol"),
            "created_at": datetime.now(timezone.utc),
            "stage": "created",
            "bonding_progress": 0,
            "migrated": False,
            "pair_address": None,
            "metadata": data
        }
        
        await self.db.pump_tokens.update_one(
            {"mint": mint},
            {"$set": token_doc},
            upsert=True
        )
        
        self.tracked_tokens[mint] = "created"
    
    async def _handle_trade(self, data: Dict[str, Any]):
        """Track bonding curve progress"""
        mint = data.get("mint")
        if not mint:
            return
            
        # Update bonding progress
        bonding_progress = data.get("marketCapSol", 0) / 85.0  # pump.fun bonding target
        
        await self.db.pump_tokens.update_one(
            {"mint": mint},
            {
                "$set": {
                    "stage": "bonding",
                    "bonding_progress": min(bonding_progress, 1.0),
                    "last_trade": datetime.now(timezone.utc)
                }
            }
        )
        
        logger.debug(f"Trade on {mint}: {bonding_progress*100:.1f}% bonding progress")
    
    async def _handle_migration(self, data: Dict[str, Any]):
        """Handle migration to Raydium"""
        mint = data.get("mint")
        pair = data.get("pair")
        
        if not mint or not pair:
            return
            
        logger.info(f"🚀 Token migrated to Raydium: {mint} -> {pair}")
        
        await self.db.pump_tokens.update_one(
            {"mint": mint},
            {
                "$set": {
                    "stage": "migrated",
                    "migrated": True,
                    "pair_address": pair,
                    "migrated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        self.tracked_tokens[mint] = "migrated"
    
    async def stop(self):
        """Stop the watcher"""
        self.running = False
        if self.ws:
            await self.ws.close()
    
    async def get_token_status(self, mint: str) -> Optional[Dict[str, Any]]:
        """Get current status of a token"""
        token = await self.db.pump_tokens.find_one({"mint": mint})
        if not token:
            return None
            
        return {
            "mint": token["mint"],
            "stage": token.get("stage", "unknown"),
            "bonding_progress": token.get("bonding_progress", 0),
            "migrated": token.get("migrated", False),
            "pair_address": token.get("pair_address"),
            "created_at": token.get("created_at").isoformat() if token.get("created_at") else None
        }


# Singleton instance
_watcher_instance: Optional[PumpWatcher] = None

async def get_watcher(db: AsyncIOMotorDatabase) -> PumpWatcher:
    """Get or create watcher instance"""
    global _watcher_instance
    if _watcher_instance is None:
        _watcher_instance = PumpWatcher(db)
        # Start watcher in background
        asyncio.create_task(_watcher_instance.start())
    return _watcher_instance
