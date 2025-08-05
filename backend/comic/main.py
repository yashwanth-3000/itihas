from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import asyncio
import logging
import uvicorn
from datetime import datetime

from config import Config
from comic_crew import comic_crew

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Validate configuration on startup
try:
    Config.validate_config()
    logger.info("Configuration validated successfully")
except ValueError as e:
    logger.error(f"Configuration error: {e}")
    raise

# Initialize FastAPI app
app = FastAPI(
    title="Cultural Comics API",
    description="AI-powered educational comic generation with advanced semantic search capabilities, focusing on culture and nature conservation",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ComicRequest(BaseModel):
    topic: str
    additional_notes: Optional[str] = None

class ComicResponse(BaseModel):
    success: bool
    topic: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str

class CrewInfoResponse(BaseModel):
    agents: list
    process: str
    features: list

# In-memory storage for demo purposes (in production, use proper database)
comic_results = {}
generation_status = {}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Cultural Comics API",
        "description": "AI-powered educational comic generation with semantic search",
        "version": "1.0.0",
        "endpoints": {
            "create_comic": "/comic/create",
            "get_result": "/comic/result/{task_id}",
            "crew_info": "/crew/info",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "config_valid": True
    }

@app.get("/crew/info", response_model=CrewInfoResponse)
async def get_crew_info():
    """Get information about the CrewAI setup"""
    try:
        info = comic_crew.get_crew_info()
        return CrewInfoResponse(**info)
    except Exception as e:
        logger.error(f"Error getting crew info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting crew info: {str(e)}")

@app.post("/comic/create", response_model=ComicResponse)
async def create_comic(request: ComicRequest, background_tasks: BackgroundTasks):
    """
    Create a new comic based on the provided topic
    This endpoint starts the comic generation process
    """
    try:
        logger.info(f"Received comic creation request for topic: {request.topic}")
        
        # Generate a simple task ID (in production, use proper UUID)
        task_id = f"comic_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{request.topic.replace(' ', '_')[:20]}"
        
        # Initialize status tracking
        generation_status[task_id] = {
            "status": "started",
            "topic": request.topic,
            "started_at": datetime.now().isoformat()
        }
        
        # Start comic creation in background
        background_tasks.add_task(generate_comic_background, task_id, request.topic)
        
        return ComicResponse(
            success=True,
            topic=request.topic,
            result={
                "task_id": task_id,
                "status": "started",
                "message": "Comic generation started. Use /comic/result/{task_id} to check progress."
            },
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error starting comic creation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting comic creation: {str(e)}")

@app.get("/comic/result/{task_id}")
async def get_comic_result(task_id: str):
    """Get the result of a comic generation task"""
    try:
        # Check if task exists
        if task_id not in generation_status:
            raise HTTPException(status_code=404, detail="Task not found")
        
        status = generation_status[task_id]
        
        # If task is completed, return the result
        if task_id in comic_results:
            result = comic_results[task_id]
            return ComicResponse(
                success=result["success"],
                topic=result["topic"],
                result=result["result"],
                error=result.get("error"),
                timestamp=datetime.now().isoformat()
            )
        
        # If task is still in progress
        return ComicResponse(
            success=True,
            topic=status["topic"],
            result={
                "task_id": task_id,
                "status": status["status"],
                "started_at": status["started_at"]
            },
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting comic result: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting result: {str(e)}")

@app.post("/comic/create-sync", response_model=ComicResponse)
async def create_comic_sync(request: ComicRequest):
    """
    Create a comic synchronously (for testing purposes)
    Warning: This may take several minutes to complete
    """
    try:
        logger.info(f"Starting synchronous comic creation for topic: {request.topic}")
        
        # Run the comic creation (this will block)
        result = comic_crew.create_comic(request.topic)
        
        return ComicResponse(
            success=result["success"],
            topic=result["topic"],
            result=result["result"],
            error=result.get("error"),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in synchronous comic creation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating comic: {str(e)}")

async def generate_comic_background(task_id: str, topic: str):
    """Background task for comic generation"""
    try:
        logger.info(f"Starting background comic generation for task {task_id}")
        
        # Update status
        generation_status[task_id]["status"] = "processing"
        
        # Generate the comic
        result = comic_crew.create_comic(topic)
        
        # Store the result
        comic_results[task_id] = result
        
        # Update status
        generation_status[task_id]["status"] = "completed"
        generation_status[task_id]["completed_at"] = datetime.now().isoformat()
        
        logger.info(f"Background comic generation completed for task {task_id}")
        
    except Exception as e:
        logger.error(f"Error in background comic generation for task {task_id}: {str(e)}")
        
        # Store error result
        comic_results[task_id] = {
            "success": False,
            "topic": topic,
            "error": str(e),
            "result": None
        }
        
        # Update status
        generation_status[task_id]["status"] = "failed"
        generation_status[task_id]["error"] = str(e)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=Config.DEBUG
    ) 