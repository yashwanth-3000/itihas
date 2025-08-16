from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, Optional
from datetime import datetime
import uvicorn

from config import ExploreConfig
from crew import explore_crew


class ExploreRequest(BaseModel):
    query: str


class ExploreResponse(BaseModel):
    success: bool
    query: str
    plan: str
    notes: str
    result: Dict[str, Any]
    timestamp: str


# Validate config on import
ExploreConfig.validate_config()

app = FastAPI(
    title="Explore API",
    description="Agentic exploration workflow using IBM Watsonx and EXA web search",
    version="1.0.0",
)

# Configure CORS - Allow specific origins and all for compatibility
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "https://ibm-three.vercel.app",  # Original Vercel deployment
    "https://itihas-ibm.vercel.app",  # New Vercel deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for maximum compatibility
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Explore API",
        "description": "Plan → Search (EXA) → Synthesize using IBM Watsonx",
        "version": "1.0.0",
        "endpoints": {"explore": "/explore", "health": "/health"},
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "config_valid": True,
    }


@app.post("/explore", response_model=ExploreResponse)
async def explore(req: ExploreRequest):
    try:
        result = explore_crew.run(req.query)
        return ExploreResponse(
            success=True,
            query=result["query"],
            plan=result["plan"],
            notes=result["notes"],
            result=result["result"],
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=ExploreConfig.HOST,
        port=ExploreConfig.PORT,
        reload=ExploreConfig.DEBUG,
        log_level="info",
    )

