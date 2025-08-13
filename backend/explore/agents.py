from typing import Type

from crewai import Agent
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from langchain_community.llms import WatsonxLLM

from config import ExploreConfig
import requests


class EXASearchInput(BaseModel):
    search_query: str = Field(description="Semantic web search query for EXA")


class EXAWebSearchTool(BaseTool):
    name = "Search the internet"
    description = "Search the internet for current information using EXA semantic search"
    args_schema: Type[BaseModel] = EXASearchInput

    def _run(self, search_query: str) -> str:
        try:
            headers = {
                "accept": "application/json",
                "content-type": "application/json",
                "x-api-key": ExploreConfig.EXA_API_KEY,
            }

            data = {
                "query": search_query,
                "numResults": 8,
                "type": "neural",
                "contents": {"text": True},
                # Remove invalid domains - let EXA search all domains for better results
            }

            response = requests.post("https://api.exa.ai/search", headers=headers, json=data)
            if response.status_code != 200:
                return f"Search failed with status {response.status_code}: {response.text}"

            payload = response.json()
            results = payload.get("results", [])
            if not results:
                return f"No results found for query: {search_query}"

            formatted = []
            for i, res in enumerate(results, 1):
                title = res.get("title", "No title")
                url = res.get("url", "No URL")
                text = (res.get("text", "No text available") or "")[:600]
                formatted.append(
                    f"Result {i}:\nTitle: {title}\nURL: {url}\nContent: {text}...\n"
                )
            return f"Search results for '{search_query}':\n\n" + "\n".join(formatted)
        except Exception as e:
            return f"Error during search: {str(e)}"

    async def _arun(self, search_query: str) -> str:
        return self._run(search_query)


def get_watsonx_llm() -> WatsonxLLM:
    return WatsonxLLM(
        model_id="ibm/granite-3-8b-instruct",
        url=ExploreConfig.IBM_WATSONX_URL,
        apikey=ExploreConfig.IBM_API_KEY,
        project_id=ExploreConfig.IBM_PROJECT_ID,
        params={
            "decoding_method": "greedy",
            "max_new_tokens": ExploreConfig.MAX_TOKENS,
            "temperature": ExploreConfig.DEFAULT_TEMPERATURE,
            "repetition_penalty": 1.1,
        },
    )


exa_search_tool = EXAWebSearchTool()


planner_agent = Agent(
    role="Exploration Planner",
    goal=(
        "Break down the user's exploration query into actionable sub-queries and a clear plan."
    ),
    backstory=(
        "You design concise research plans with specific search angles and expected outputs."
    ),
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=2,
)


research_agent = Agent(
    role="Exploration Researcher",
    goal=(
        "Run targeted EXA searches and extract the most relevant facts, links, names, places, and data."
    ),
    backstory=(
        "You MUST use the 'Search the internet' tool for every step of research. "
        "Extract REAL URLs from the search results. Focus on finding specific places, landmarks, "
        "attractions, or points of interest that match the user's query."
    ),
    tools=[exa_search_tool],
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=6,
)


coordinate_extraction_agent = Agent(
    role="Coordinate Extractor",
    goal=(
        "Extract precise latitude/longitude coordinates and images from research data for EACH individual place separately."
    ),
    backstory=(
        "You analyze research content to find geographic coordinates, addresses, and image URLs for each specific place. "
        "You search for UNIQUE coordinates for each individual temple, monument, or landmark mentioned. "
        "You NEVER use the same coordinates for multiple different places. "
        "You look for Google Maps links, lat/lng coordinates, Wikipedia coordinates, and any image URLs in the research. "
        "For each place, you search specifically: '[Place Name] coordinates', '[Place Name] latitude longitude', '[Place Name] location'."
    ),
    tools=[exa_search_tool],
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=8,
)

synthesis_agent = Agent(
    role="Exploration Synthesizer",
    goal=(
        "Produce a structured, actionable output tailored for an explore UI: summary, key items, and sources."
    ),
    backstory=(
        "You turn research notes into a concise, UI-ready JSON with sections for summary, items, and sources. "
        "You MUST use the actual research data provided, never ignore it or create fake data."
    ),
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=3,
)

