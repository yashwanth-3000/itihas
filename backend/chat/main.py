from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import asyncio
import logging
import uvicorn
from datetime import datetime
import uuid

from config import ChatConfig
from chat_crew import chat_crew

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Validate configuration on startup
try:
    ChatConfig.validate_config()
    logger.info("Chat configuration validated successfully")
except ValueError as e:
    logger.error(f"Configuration error: {e}")
    raise

# Initialize FastAPI app
app = FastAPI(
    title="AI Chat API",
    description="AI-powered chat API with advanced search capabilities using IBM Watson and CrewAI",
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
class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    force_simple: Optional[bool] = False
    force_research: Optional[bool] = False

class ConversationHistory(BaseModel):
    user: str
    assistant: str
    timestamp: str

class ChatResponse(BaseModel):
    success: bool
    message: str
    response: str
    conversation_id: str
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str

class CrewInfoResponse(BaseModel):
    agents: list
    capabilities: list
    search_tools: list
    features: list

# In-memory storage for conversations (in production, use proper database)
conversations = {}
chat_sessions = {}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Chat API",
        "description": "AI-powered chat with IBM Watson and advanced search capabilities",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat",
            "conversation": "/conversation/{conversation_id}",
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
        "config_valid": True,
        "agents_ready": True
    }

@app.get("/crew/info", response_model=CrewInfoResponse)
async def get_crew_info():
    """Get information about the CrewAI setup"""
    try:
        info = chat_crew.get_crew_info()
        return CrewInfoResponse(**info)
    except Exception as e:
        logger.error(f"Error getting crew info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting crew info: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatMessage):
    """
    Main chat endpoint for processing user messages
    """
    try:
        logger.info(f"Received chat message: {request.message[:100]}...")
        
        # Generate or use existing conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Get conversation history
        conversation_history = conversations.get(conversation_id, [])
        
        # Process the chat message
        result = chat_crew.chat(
            user_message=request.message,
            conversation_history=conversation_history,
            force_simple=request.force_simple,
            force_research=request.force_research
        )
        
        if result["success"]:
            # Store the conversation
            if conversation_id not in conversations:
                conversations[conversation_id] = []
            
            conversations[conversation_id].append({
                "user": request.message,
                "assistant": result["response"],
                "timestamp": datetime.now().isoformat(),
                "metadata": result.get("metadata", {})
            })
            
            # Limit conversation history
            if len(conversations[conversation_id]) > ChatConfig.MAX_CONVERSATION_HISTORY:
                conversations[conversation_id] = conversations[conversation_id][-ChatConfig.MAX_CONVERSATION_HISTORY:]
            
            return ChatResponse(
                success=True,
                message=request.message,
                response=result["response"],
                conversation_id=conversation_id,
                metadata=result.get("metadata"),
                timestamp=datetime.now().isoformat()
            )
        else:
            return ChatResponse(
                success=False,
                message=request.message,
                response=result.get("response", "An error occurred"),
                conversation_id=conversation_id,
                error=result.get("error"),
                timestamp=datetime.now().isoformat()
            )
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.get("/conversation/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get conversation history for a specific conversation ID"""
    try:
        if conversation_id not in conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return {
            "conversation_id": conversation_id,
            "history": conversations[conversation_id],
            "message_count": len(conversations[conversation_id]),
            "last_updated": conversations[conversation_id][-1]["timestamp"] if conversations[conversation_id] else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting conversation: {str(e)}")

@app.delete("/conversation/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """Clear a specific conversation history"""
    try:
        if conversation_id not in conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        del conversations[conversation_id]
        
        return {
            "message": f"Conversation {conversation_id} cleared successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error clearing conversation: {str(e)}")

@app.get("/conversations")
async def list_conversations():
    """List all active conversations"""
    try:
        conversation_list = []
        for conv_id, history in conversations.items():
            if history:  # Only include conversations with messages
                conversation_list.append({
                    "conversation_id": conv_id,
                    "message_count": len(history),
                    "last_message": history[-1]["user"][:50] + "..." if len(history[-1]["user"]) > 50 else history[-1]["user"],
                    "last_updated": history[-1]["timestamp"]
                })
        
        return {
            "conversations": conversation_list,
            "total_count": len(conversation_list)
        }
        
    except Exception as e:
        logger.error(f"Error listing conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing conversations: {str(e)}")

# Simple test endpoint for quick verification
@app.post("/test")
async def test_chat():
    """Simple test endpoint to verify the chat system is working"""
    try:
        test_message = "Hello, can you tell me about yourself?"
        result = chat_crew.chat(test_message, force_simple=True)
        
        return {
            "test": "success",
            "message": test_message,
            "response": result["response"],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in test endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=ChatConfig.HOST,
        port=ChatConfig.PORT,
        reload=ChatConfig.DEBUG
    ) 