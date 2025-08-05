# Comic Module

This module handles all comic generation functionality using CrewAI and various AI models.

## Components

### Core Files
- `main.py` - Main entry point for comic generation API
- `start.py` - Application startup and initialization
- `config.py` - Configuration settings and environment variables

### CrewAI Components
- `agents.py` - AI agents for different comic generation tasks
- `tasks.py` - Task definitions for the comic creation workflow
- `comic_crew.py` - CrewAI crew configuration and execution

### Testing
- `test_comic.py` - Unit tests for comic functionality
- `test_inference.py` - Testing AI model inference
- `simple_test.py` - Simple integration tests

## Usage

To start the comic generation service:

```bash
python start.py
```

To run tests:

```bash
python -m pytest test_comic.py
```

## Features

- AI-powered story generation
- Automatic image prompt creation
- 10-panel comic structure
- Integration with image generation APIs
- Real-time streaming responses 