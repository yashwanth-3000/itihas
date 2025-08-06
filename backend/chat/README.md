# Chat Module

This module handles all chat and conversational AI functionality using IBM Watson and CrewAI.

## Features

- **AI Chatbot**: Intelligent conversational interface powered by IBM Granite models
- **Context-Aware Responses**: Analyzes conversation context to determine optimal response strategy
- **EXA Search Integration**: Advanced semantic search capabilities for current information
- **Multi-Agent Workflow**: Uses CrewAI agents for research, analysis, and response generation
- **Conversation Management**: Persistent conversation history and context retention
- **Flexible Response Modes**: Simple chat or research-enhanced responses

## Structure

```
chat/
├── __init__.py          # Module initialization
├── README.md           # This file
├── config.py           # Configuration management
├── agents.py           # CrewAI agent definitions
├── tasks.py            # CrewAI task definitions
├── chat_crew.py        # Main chat orchestrator
├── main.py             # FastAPI application
├── start.py            # Server startup script
└── test_chat.py        # Testing utilities
```

## Agents

1. **Context Analyzer**: Analyzes user messages and conversation context to determine response strategy
2. **Information Research Specialist**: Uses EXA search and other tools to find current information
3. **Conversational AI Assistant**: Generates helpful, engaging responses using IBM Granite models

## API Endpoints

- `POST /chat` - Main chat endpoint
- `GET /conversation/{id}` - Get conversation history
- `DELETE /conversation/{id}` - Clear conversation
- `GET /conversations` - List all conversations
- `GET /crew/info` - Get agent information
- `GET /health` - Health check
- `POST /test` - Simple test endpoint

## Getting Started

1. **Set Environment Variables** (in backend/.env):
   ```
   IBM_API_KEY=your_ibm_api_key
   IBM_WATSONX_URL=your_watsonx_url
   IBM_PROJECT_ID=your_project_id
   EXA_API_KEY=your_exa_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

2. **Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Test the System**:
   ```bash
   cd backend/chat
   python test_chat.py
   ```

4. **Start the Server**:
   ```bash
   cd backend/chat
   python start.py
   ```

The API will be available at `http://localhost:8001`

## Integration

The chat module integrates with:
- Frontend chat interface at `/chat`
- IBM Watson for AI capabilities
- EXA Search for current information
- CrewAI for multi-agent workflows

## Example Usage

```bash
# Test the chat endpoint
curl -X POST "http://localhost:8001/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, how are you today?"}'

# Chat with search capabilities
curl -X POST "http://localhost:8001/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "What are the latest developments in AI?"}'
``` 