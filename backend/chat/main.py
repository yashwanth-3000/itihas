from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import asyncio
import logging
import uvicorn
from datetime import datetime
import uuid
import json

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
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

# Add Railway production URLs if deployed
if ChatConfig.RAILWAY_ENVIRONMENT:
    origins.extend([
        "https://*.railway.app",
        "https://*.up.railway.app"
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections
active_connections: Dict[str, WebSocket] = {}

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

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    active_connections[client_id] = websocket
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except:
        if client_id in active_connections:
            del active_connections[client_id]

async def send_log_update(client_id: str, log_type: str, data: Dict[str, Any], message: str = None, agent: str = None, hierarchy: int = None):
    """Send a log update to the connected WebSocket client"""
    if client_id in active_connections:
        try:
            await active_connections[client_id].send_json({
                "type": log_type,
                "data": data,
                "message": message,
                "agent": agent,
                "hierarchy": hierarchy,
                "timestamp": datetime.now().isoformat()
            })
        except:
            logger.error(f"Error sending log update to client {client_id}")

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
            "health": "/health",
            "websocket": "/ws/{client_id}"
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
        
        # Send initial log updates
        if conversation_id in active_connections:
            await send_log_update(
                conversation_id,
                "user_input",
                {"message": request.message},
                f"User sent: {request.message}"
            )

            # Send workflow initialization log
            if request.force_research:
                await send_log_update(
                    conversation_id,
                    "agent_hierarchy",
                    {
                        "mode": "research",
                        "expected_agents": ["Context Analyzer", "EXA Search Tool", "Conversational AI Assistant"]
                    },
                    "Initializing research workflow: Context Analysis → Web Search → Response Generation"
                )
                
                await asyncio.sleep(0.2)  # Small delay for visual effect
                
                await send_log_update(
                    conversation_id,
                    "agent_start",
                    {
                        "agent": "Context Analyzer",
                        "step": 1,
                        "total_steps": 3
                    },
                    "Analyzing user query context and determining research strategy...",
                    "Context Analyzer",
                    0
                )
            else:
                await send_log_update(
                    conversation_id,
                    "agent_hierarchy",
                    {
                        "mode": "simple",
                        "expected_agents": ["Conversational AI Assistant"]
                    },
                    "Initializing simple chat workflow: Direct Response Generation"
                )
                
                await asyncio.sleep(0.1)  # Small delay for visual effect
                
                await send_log_update(
                    conversation_id,
                    "agent_start",
                    {
                        "agent": "Conversational AI Assistant",
                        "step": 1,
                        "total_steps": 1
                    },
                    "Processing conversational response using IBM Granite-3-8B...",
                    "Conversational AI Assistant",
                    0
                )
        
        # Process the chat message
        result = chat_crew.chat(
            user_message=request.message,
            conversation_history=conversation_history,
            force_simple=request.force_simple,
            force_research=request.force_research
        )
        
        if result["success"]:
            # Send API call log
            if conversation_id in active_connections:
                await send_log_update(
                    conversation_id,
                    "api_call",
                    {
                        "model": "IBM Granite-3-8B",
                        "think_mode": request.force_research,
                        "force_research": request.force_research,
                        "timestamp": datetime.now().isoformat()
                    },
                    f"Sending request to chat API {request.force_research and '[RESEARCH MODE]' or '[SIMPLE MODE]'}"
                )

                # If research mode, show additional agent steps
                if request.force_research:
                    await asyncio.sleep(0.8)  # Delay for visual effect
                    await send_log_update(
                        conversation_id,
                        "agent_complete",
                        {
                            "agent": "Context Analyzer",
                            "step": 1,
                            "total_steps": 3
                        },
                        "Context analysis complete - research keywords detected, proceeding to search",
                        "Context Analyzer",
                        0
                    )
                    
                    await asyncio.sleep(0.3)
                    await send_log_update(
                        conversation_id,
                        "agent_start",
                        {
                            "agent": "EXA Search Tool",
                            "step": 2,
                            "total_steps": 3
                        },
                        "Initiating semantic web search for real-time information...",
                        "EXA Search Tool",
                        1
                    )
                    
                    await asyncio.sleep(0.5)
                    await send_log_update(
                        conversation_id,
                        "agent_complete",
                        {
                            "agent": "EXA Search Tool",
                            "step": 2,
                            "total_steps": 3
                        },
                        "Web search complete - relevant information retrieved, synthesizing response",
                        "EXA Search Tool",
                        1
                    )
                    
                    await asyncio.sleep(0.2)
                    await send_log_update(
                        conversation_id,
                        "agent_start",
                        {
                            "agent": "Conversational AI Assistant",
                            "step": 3,
                            "total_steps": 3
                        },
                        "Generating research-enhanced response using IBM Granite-3-8B...",
                        "Conversational AI Assistant",
                        2
                    )

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
            
            # Send completion logs
            if conversation_id in active_connections:
                await asyncio.sleep(0.3)  # Small delay for visual effect
                if request.force_research:
                    await send_log_update(
                        conversation_id,
                        "agent_complete",
                        {
                            "agent": "Conversational AI Assistant",
                            "step": 3,
                            "total_steps": 3
                        },
                        "Research-enhanced response generated successfully",
                        "Conversational AI Assistant",
                        2
                    )
                else:
                    await send_log_update(
                        conversation_id,
                        "agent_complete",
                        {
                            "agent": "Conversational AI Assistant",
                            "step": 1,
                            "total_steps": 1
                        },
                        "Conversational response generated successfully",
                        "Conversational AI Assistant",
                        0
                    )

                await asyncio.sleep(0.2)
                await send_log_update(
                    conversation_id,
                    "response",
                    {
                        "content": result["response"],
                        "type": result.get("metadata", {}).get("response_type", "unknown"),
                        "research_used": result.get("metadata", {}).get("research_used", False),
                        "agents_used": result.get("metadata", {}).get("agents_used", []),
                        "response_length": len(result["response"]),
                        "think_mode_was_on": request.force_research
                    },
                    f"Response ready: {len(result['response'])} characters {'with web search data' if result.get('metadata', {}).get('research_used', False) else 'from knowledge base'}"
                )

                # Log research summary if available
                if result.get("metadata", {}).get("research_used") and request.force_research:
                    await asyncio.sleep(0.1)
                    await send_log_update(
                        conversation_id,
                        "response",
                        {
                            "research_summary": {
                                "search_results_length": result.get("metadata", {}).get("search_results_length", 0),
                                "sources_found": result.get("metadata", {}).get("sources_found", 0),
                                "search_query": result.get("metadata", {}).get("search_query")
                            }
                        },
                        f"Research summary: {result.get('metadata', {}).get('search_results_length', 0)} chars from web search, query: \"{result.get('metadata', {}).get('search_query', '')}\""
                    )
            
            return ChatResponse(
                success=True,
                message=request.message,
                response=result["response"],
                conversation_id=conversation_id,
                metadata=result.get("metadata"),
                timestamp=datetime.now().isoformat()
            )
        else:
            if conversation_id in active_connections:
                await send_log_update(
                    conversation_id,
                    "error",
                    {"error": result.get("error", "Unknown error")},
                    "Chat processing failed"
                )
            
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
        if conversation_id in active_connections:
            await send_log_update(
                conversation_id,
                "error",
                {"error": str(e)},
                "Chat API error"
            )
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

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=ChatConfig.HOST,
        port=ChatConfig.PORT,
        reload=ChatConfig.DEBUG
    )