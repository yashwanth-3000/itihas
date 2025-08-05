# AI-Powered Educational Platform Backend

Multi-module backend service for AI-powered educational content generation and management.

## Overview

This backend service provides AI-powered functionality for educational content creation, including comics, chat interactions, and content exploration. It uses CrewAI with multiple specialized agents and various AI models to create engaging educational experiences.

## Architecture

The backend is organized into three main modules:

### 📚 Comic Module (`/comic`)
- AI-powered comic generation using CrewAI
- 10-panel educational comic creation
- Story and image prompt generation
- Integration with image generation APIs

### 💬 Chat Module (`/chat`)
- Conversational AI interface
- Deep thinking and reasoning capabilities
- Context-aware chat interactions
- Multi-model AI support

### 🔍 Explore Module (`/explore`)
- Content discovery and browsing
- Search and filtering capabilities
- AI-powered recommendations
- Content organization and collections

## Project Structure

```
backend/
├── comic/                  # Comic generation module
│   ├── agents.py          # CrewAI agents for comic creation
│   ├── tasks.py           # Task definitions
│   ├── comic_crew.py      # CrewAI crew configuration
│   ├── main.py            # Main API entry point
│   ├── start.py           # Application startup
│   ├── config.py          # Configuration settings
│   └── tests/             # Comic functionality tests
├── chat/                   # Chat functionality (planned)
│   ├── __init__.py
│   └── README.md
├── explore/                # Content exploration (planned)
│   ├── __init__.py
│   └── README.md
├── db/                     # Shared database
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Features

### Current (Comic Module)
- **Multi-agent system** using CrewAI
- **Advanced semantic search** with EXA API for cultural research
- **Cultural research** with comprehensive web search capabilities  
- **Story creation** for educational content
- **Comic script generation** with 10-panel format
- **Quality assurance** for age-appropriate content
- **Asynchronous processing** with background tasks
- **RESTful API** with FastAPI

### Planned
- **Chat Interface**: Conversational AI for Q&A and learning
- **Content Discovery**: Browse and explore generated content
- **Recommendations**: AI-powered content suggestions
- **User Management**: Authentication and personalization

## Quick Start

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Run Comic Module
```bash
cd comic
python start.py
```

### Development
```bash
# Run tests
cd comic
python -m pytest

# Run with hot reload
python main.py --reload
```

## API Endpoints

### Comic Generation
- `POST /comic/generate` - Generate a new comic
- `GET /comic/status/{task_id}` - Check generation status
- `GET /comic/{comic_id}` - Get generated comic

### Future Endpoints
- `POST /chat/message` - Send chat message
- `GET /explore/comics` - Browse comics
- `GET /explore/search` - Search content

## Environment Variables

```env
# AI Model APIs
OPENAI_API_KEY=your_openai_key
IBM_API_KEY=your_ibm_key
EXA_API_KEY=your_exa_key

# Database
DATABASE_URL=sqlite:///./db/app.db

# Application
DEBUG=true
LOG_LEVEL=info
```

## Technologies

- **Backend Framework**: FastAPI
- **AI Orchestration**: CrewAI
- **AI Models**: OpenAI GPT, IBM Watson
- **Search**: EXA API
- **Database**: SQLite (development), PostgreSQL (production)
- **Vector Store**: ChromaDB
- **Testing**: pytest

## Development Guidelines

### Adding New Modules
1. Create module directory under `backend/`
2. Add `__init__.py` and `README.md`
3. Follow the established pattern from comic module
4. Update this main README

### Code Organization
- Each module is self-contained
- Shared utilities go in root level
- Database models shared across modules
- Configuration centralized in each module's config.py

## Contributing

1. Choose a module to work on (comic, chat, explore)
2. Follow the module's README for specific guidelines
3. Write tests for new functionality
4. Update documentation

## License

MIT License - see LICENSE file for details 