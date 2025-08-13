# Explore Module

This module handles an agentic exploration workflow using IBM Watsonx for reasoning and EXA web search for live information.

## Features

- **Planner → Research → Synthesis** workflow via CrewAI
- **IBM Watsonx only** for inference (granite-3-8b-instruct)
- **EXA semantic web search** for current info (forced at least once)
- **FastAPI endpoint** at `/explore` returning structured JSON for UI

## Structure

```
explore/
├── __init__.py
├── README.md
├── config.py        # Config (IBM, EXA)
├── agents.py        # Planner, Researcher (EXA tool), Synthesizer
├── tasks.py         # Task prompts for each step
├── crew.py          # Orchestrates plan → research → synthesize
├── main.py          # FastAPI app exposing /explore
└── start.py         # Simple runner
```

## Getting Started

Start the API:

```bash
cd backend
pip install -r requirements.txt
cd explore
python start.py
```

Endpoint: `http://localhost:8002/explore`

Example:

```bash
curl -X POST http://localhost:8002/explore \
  -H 'Content-Type: application/json' \
  -d '{"query": "ancient temples near Delhi"}'
```

## Integration

The explore module integrates with the frontend `/explore/results` page, which calls the `/explore` endpoint and renders the structured results (summary, items, sources). 

## Future Enhancements

- **Advanced Analytics**: Content popularity and engagement metrics
- **Social Features**: Community sharing and ratings
- **Content Curation**: Editorial picks and featured content
- **Export Features**: Download and share functionality 