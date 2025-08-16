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
                "numResults": 3,  # Default to 3 results as requested
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
            "max_new_tokens": 4000,  # Increased to handle longer descriptions
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
        "Find AT LEAST 3 temples in the specified location quickly and efficiently. "
        "Focus on major temples and gather basic information in a single pass."
    ),
    backstory=(
        "You are a temple researcher focused on finding multiple temples quickly. "
        "Your efficient search process:\n"
        "1. FIRST SEARCH - Get Overview:\n"
        "   Search '[location] famous temples list' ONCE to get:\n"
        "   - Names of major temples\n"
        "   - Basic locations\n"
        "   - Brief descriptions\n"
        "   Save everything you find immediately.\n"
        "\n"
        "2. If Less Than 3 Temples Found:\n"
        "   Try ONE of these (in order):\n"
        "   - '[location] must visit temples'\n"
        "   - '[location] popular temples'\n"
        "   - '[location] ancient temples'\n"
        "   Stop as soon as you have 3+ temples.\n"
        "\n"
        "3. Detailed Temple Information (gather ALL available info):\n"
        "   For each temple, make these THREE searches:\n"
        "   a) Search '[temple name] [location] history architecture':\n"
        "      - Year/century of construction\n"
        "      - Dynasty or ruler who built it\n"
        "      - Architectural style and features\n"
        "      - Building materials and techniques\n"
        "      - Size and layout details\n"
        "\n"
        "   b) Search '[temple name] [location] religious cultural significance':\n"
        "      - Main deities and their significance\n"
        "      - Religious practices and rituals\n"
        "      - Important festivals celebrated\n"
        "      - Cultural importance to the region\n"
        "      - Legends and stories associated\n"
        "\n"
        "   c) Search '[temple name] [location] tourist guide information':\n"
        "      - What visitors can see and experience\n"
        "      - Notable sculptures and artwork\n"
        "      - Special features or unique aspects\n"
        "      - Best times to visit\n"
        "      - Important ceremonies or events\n"
        "\n"
        "   Combine ALL information into a detailed description (250-300 words):\n"
        "   - Start with historical background\n"
        "   - Describe architectural features\n"
        "   - Explain religious significance\n"
        "   - Include cultural importance\n"
        "   - Add visitor information\n"
        "   - End with practical details\n"
        "\n"
        "4. EFFICIENCY RULES:\n"
        "   - Keep ALL temples found\n"
        "   - Basic info is enough\n"
        "   - Don't waste time on details\n"
        "   - Move quickly between temples\n"
        "   - Better to have 3 temples with basic info than 1 with full details"
    ),
    tools=[exa_search_tool],
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=15,  # Increased to allow for multiple verification searches
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
    max_iter=15,  # Increased to allow for thorough coordinate searches
)

synthesis_agent = Agent(
    role="Exploration Synthesizer",
    goal=(
        "Generate complete, valid JSON output for temples found in research, "
        "focusing on the location specified in the user's query."
    ),
    backstory=(
        "You are a specialized JSON generator for temple data. Your key rules:\n"
        "1. ALWAYS Return Data:\n"
        "   - Return ALL temples found in research\n"
        "   - Include temples even without coordinates\n"
        "   - Never skip temples due to missing data\n"
        "   - Partial data is better than no data\n"
        "\n"
        "2. Location Handling:\n"
        "   - Use temples that match query location\n"
        "   - Don't require exact coordinates\n"
        "   - Basic location info is enough\n"
        "   - Include all temples mentioned for queried city\n"
        "\n"
        "3. Comprehensive Temple Descriptions (250-300 words each):\n"
        "   Structure each description in this order:\n"
        "   a) Historical Background:\n"
        "      - Construction period and dynasty\n"
        "      - Historical context and importance\n"
        "      - Notable historical events\n"
        "\n"
        "   b) Architecture and Design:\n"
        "      - Architectural style and influences\n"
        "      - Notable structural features\n"
        "      - Unique construction elements\n"
        "      - Materials and techniques used\n"
        "\n"
        "   c) Religious and Cultural Significance:\n"
        "      - Main deities and their importance\n"
        "      - Religious practices and rituals\n"
        "      - Cultural impact on the region\n"
        "      - Associated legends and stories\n"
        "\n"
        "   d) Visitor Experience:\n"
        "      - What to see and explore\n"
        "      - Special features and highlights\n"
        "      - Important festivals and events\n"
        "      - Best times to visit\n"
        "\n"
        "   Format as a flowing narrative that engages readers\n"
        "\n"
        "4. Required Fields:\n"
        "   - Temple name\n"
        "   - Detailed location\n"
        "   - Rich description (100-150 words)\n"
        "   - Key features and highlights\n"
        "\n"
        "5. Optional Fields:\n"
        "   - Coordinates\n"
        "   - Full address\n"
        "   - Images\n"
        "   - URLs\n"
        "   - Visiting hours\n"
        "\n"
        "6. Quality Rules:\n"
        "   - Write engaging, informative descriptions\n"
        "   - Include historical and cultural context\n"
        "   - Highlight unique features\n"
        "   - Make descriptions helpful for visitors\n"
        "   - Include practical information when available"
    ),
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=3,
)

