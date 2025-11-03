from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
import asyncio
from datetime import datetime, timezone
import os
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

nft_router = APIRouter(prefix="/nft", tags=["NFT"])

# Models
class NFTPreviewRequest(BaseModel):
    prompt: str
    style: str
    colorMood: str
    background: str
    uniqueTwist: Optional[str] = ""
    count: int = 12

class NFTBatchRequest(BaseModel):
    walletAddress: str
    collectionName: str
    prompt: str
    style: str
    colorMood: str
    background: str
    uniqueTwist: Optional[str] = ""
    quantity: int
    standard: str  # ERC721, ERC1155, Solana
    chainId: int

class NFTRegenerateRequest(BaseModel):
    prompt: str
    style: str
    colorMood: str
    background: str
    uniqueTwist: Optional[str] = ""
    seed: int

# In-memory job storage (in production, use Redis or DB)
generation_jobs = {}

@nft_router.post("/generate-preview")
async def generate_preview(request: NFTPreviewRequest):
    """
    Generate preview images for NFT collection (12 samples)
    This is free and quick for users to validate their concept
    """
    try:
        # TODO: Integrate with actual AI image generation service
        # For now, return placeholder data
        
        # Construct full prompt with style modifiers
        full_prompt = f"{request.prompt}, {request.style} style, {request.colorMood} colors, {request.background} background"
        if request.uniqueTwist:
            full_prompt += f", {request.uniqueTwist}"
        
        # Mock preview images (replace with actual generation)
        preview_images = []
        for i in range(request.count):
            preview_images.append({
                "id": str(uuid.uuid4()),
                "url": f"https://picsum.photos/seed/{uuid.uuid4()}/400/400",  # Placeholder
                "seed": i * 1000,
                "prompt": full_prompt
            })
        
        logger.info(f"Generated {request.count} preview images for prompt: {request.prompt}")
        
        return {
            "status": "success",
            "images": preview_images,
            "prompt": full_prompt
        }
    
    except Exception as e:
        logger.error(f"Error generating preview: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate preview")

@nft_router.post("/regenerate-single")
async def regenerate_single(request: NFTRegenerateRequest):
    """
    Regenerate a single image with new seed
    """
    try:
        full_prompt = f"{request.prompt}, {request.style} style, {request.colorMood} colors, {request.background} background"
        if request.uniqueTwist:
            full_prompt += f", {request.uniqueTwist}"
        
        # Mock regenerated image
        regenerated_image = {
            "id": str(uuid.uuid4()),
            "url": f"https://picsum.photos/seed/{uuid.uuid4()}/400/400",  # Placeholder
            "seed": request.seed,
            "prompt": full_prompt
        }
        
        return {
            "status": "success",
            "image": regenerated_image
        }
    
    except Exception as e:
        logger.error(f"Error regenerating image: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to regenerate image")

async def process_batch_generation(job_id: str, request: NFTBatchRequest):
    """
    Background task to generate full NFT collection
    """
    try:
        generation_jobs[job_id]["status"] = "processing"
        generation_jobs[job_id]["progress"] = 0
        
        full_prompt = f"{request.prompt}, {request.style} style, {request.colorMood} colors, {request.background} background"
        if request.uniqueTwist:
            full_prompt += f", {request.uniqueTwist}"
        
        generated_images = []
        ipfs_cids = []
        
        # Generate images in batches
        for i in range(request.quantity):
            # Simulate generation (replace with actual AI generation)
            await asyncio.sleep(0.1)  # Simulate API call
            
            # Generate unique seed for each NFT
            seed = i * 12345 + hash(request.walletAddress) % 10000
            
            # TODO: Actual image generation with AI service
            # image_data = await generate_image_with_ai(full_prompt, seed)
            
            # TODO: Upload to IPFS
            # ipfs_cid = await upload_to_ipfs(image_data)
            
            # Mock data
            image_id = str(uuid.uuid4())
            ipfs_cid = f"Qm{uuid.uuid4().hex[:44]}"  # Mock CID
            
            generated_images.append({
                "id": image_id,
                "url": f"https://picsum.photos/seed/{seed}/800/800",
                "ipfs_cid": ipfs_cid,
                "seed": seed,
                "metadata": {
                    "name": f"{request.collectionName} #{i + 1}",
                    "description": request.prompt,
                    "image": f"ipfs://{ipfs_cid}",
                    "attributes": [
                        {"trait_type": "Style", "value": request.style},
                        {"trait_type": "Color Mood", "value": request.colorMood},
                        {"trait_type": "Background", "value": request.background}
                    ]
                }
            })
            
            ipfs_cids.append(ipfs_cid)
            
            # Update progress
            progress = int(((i + 1) / request.quantity) * 100)
            generation_jobs[job_id]["progress"] = progress
        
        # Calculate provenance hash
        sorted_cids = sorted(ipfs_cids)
        provenance_hash = hash("".join(sorted_cids))  # Simple hash (use proper crypto hash in production)
        
        # Store collection in database
        collection_doc = {
            "job_id": job_id,
            "wallet_address": request.walletAddress,
            "collection_name": request.collectionName,
            "prompt": request.prompt,
            "style": request.style,
            "quantity": request.quantity,
            "standard": request.standard,
            "chain_id": request.chainId,
            "images": generated_images,
            "ipfs_cids": ipfs_cids,
            "provenance_hash": str(provenance_hash),
            "status": "completed",
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.nft_collections.insert_one(collection_doc)
        
        # Update job status
        generation_jobs[job_id]["status"] = "completed"
        generation_jobs[job_id]["progress"] = 100
        generation_jobs[job_id]["collection_id"] = str(collection_doc["_id"])
        generation_jobs[job_id]["provenance_hash"] = str(provenance_hash)
        
        logger.info(f"Batch generation completed for job: {job_id}")
        
    except Exception as e:
        logger.error(f"Error in batch generation: {str(e)}")
        generation_jobs[job_id]["status"] = "failed"
        generation_jobs[job_id]["error"] = str(e)

@nft_router.post("/generate-batch")
async def generate_batch(request: NFTBatchRequest, background_tasks: BackgroundTasks):
    """
    Start batch generation of NFT collection
    Returns job_id for tracking progress
    """
    try:
        job_id = str(uuid.uuid4())
        
        # Initialize job tracking
        generation_jobs[job_id] = {
            "status": "queued",
            "progress": 0,
            "wallet_address": request.walletAddress,
            "collection_name": request.collectionName,
            "quantity": request.quantity,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Start background generation
        background_tasks.add_task(process_batch_generation, job_id, request)
        
        logger.info(f"Started batch generation job: {job_id} for {request.quantity} NFTs")
        
        return {
            "status": "success",
            "jobId": job_id,
            "message": f"Generation started for {request.quantity} NFTs"
        }
    
    except Exception as e:
        logger.error(f"Error starting batch generation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start generation")

@nft_router.get("/generation-status/{job_id}")
async def get_generation_status(job_id: str):
    """
    Get status of batch generation job
    """
    try:
        if job_id not in generation_jobs:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job = generation_jobs[job_id]
        
        return {
            "jobId": job_id,
            "status": job["status"],
            "progress": job["progress"],
            "collection_name": job.get("collection_name"),
            "quantity": job.get("quantity"),
            "provenance_hash": job.get("provenance_hash"),
            "collection_id": job.get("collection_id"),
            "error": job.get("error")
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching generation status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch status")

@nft_router.get("/collection/{collection_id}")
async def get_collection(collection_id: str, wallet_address: Optional[str] = None):
    """
    Get NFT collection details
    """
    try:
        from bson import ObjectId
        
        collection = await db.nft_collections.find_one({"_id": ObjectId(collection_id)})
        
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        # Verify ownership if wallet_address provided
        if wallet_address and collection["wallet_address"].lower() != wallet_address.lower():
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Remove MongoDB _id for JSON serialization
        collection["_id"] = str(collection["_id"])
        collection["created_at"] = collection["created_at"].isoformat()
        
        return collection
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching collection: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch collection")
