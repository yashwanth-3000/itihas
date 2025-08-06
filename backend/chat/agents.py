from crewai import Agent
from crewai_tools import SerperDevTool, WebsiteSearchTool
from langchain_community.llms import WatsonxLLM
from langchain.tools import BaseTool
from config import ChatConfig
import requests
import json
from typing import Optional, Type
from pydantic import BaseModel, Field

# Custom EXA Search Tool
class EXASearchInput(BaseModel):
    search_query: str = Field(description="The search query to find information about")

class CustomEXASearchTool(BaseTool):
    name = "Search the internet"
    description = "Search the internet for current information using EXA semantic search"
    args_schema: Type[BaseModel] = EXASearchInput
    
    def _run(self, search_query: str) -> str:
        """Use EXA API to search for information"""
        try:
            headers = {
                'accept': 'application/json',
                'content-type': 'application/json',
                'x-api-key': ChatConfig.EXA_API_KEY
            }
            
            data = {
                'query': search_query,
                'numResults': 5,
                'type': 'neural',
                'contents': {
                    'text': True
                }
            }
            
            response = requests.post('https://api.exa.ai/search', headers=headers, json=data)
            
            if response.status_code == 200:
                result = response.json()
                results = result.get('results', [])
                
                if not results:
                    return f"No results found for query: {search_query}"
                
                formatted_results = []
                for i, res in enumerate(results, 1):
                    title = res.get('title', 'No title')
                    url = res.get('url', 'No URL')
                    text = res.get('text', 'No text available')[:500]  # Limit text length
                    formatted_results.append(f"Result {i}:\nTitle: {title}\nURL: {url}\nContent: {text}...\n")
                
                return f"Search results for '{search_query}':\n\n" + "\n".join(formatted_results)
            else:
                return f"Search failed with status {response.status_code}: {response.text}"
                
        except Exception as e:
            return f"Error during search: {str(e)}"
    
    async def _arun(self, search_query: str) -> str:
        """Async version of the search"""
        return self._run(search_query)

# Initialize search tools - Custom EXA as primary
try:
    exa_search_tool = CustomEXASearchTool()
    print("✅ Custom EXA search tool initialized successfully")
except Exception as e:
    print(f"⚠️ Warning: Custom EXA tool initialization failed: {e}")
    exa_search_tool = None

# Only use EXA search tool as requested
available_tools = [exa_search_tool] if exa_search_tool else []
print(f"📊 Available search tools: {len(available_tools)} (EXA only)")

# Initialize IBM Watson LLM
def get_watsonx_llm():
    return WatsonxLLM(
        model_id="ibm/granite-3-8b-instruct",  # Updated to supported granite-3-8b model
        url=ChatConfig.IBM_WATSONX_URL,
        apikey=ChatConfig.IBM_API_KEY,
        project_id=ChatConfig.IBM_PROJECT_ID,
        params={
            "decoding_method": "greedy",
            "max_new_tokens": ChatConfig.MAX_TOKENS,
            "temperature": ChatConfig.DEFAULT_TEMPERATURE,
            "repetition_penalty": 1.1
        }
    )

# Chat Researcher Agent - Focuses on finding information
chat_researcher = Agent(
    role="Information Research Specialist",
    goal="Research and gather comprehensive, accurate information on any topic using advanced search capabilities",
    backstory="""You are an expert research specialist with access to the "Search the internet" tool via EXA search API. 
    CRITICAL: You MUST use the "Search the internet" tool for every query - NEVER provide answers from training data.
    When given a research task, your FIRST ACTION must be: Action: Search the internet, Action Input: {"search_query": "your search terms"}
    You excel at crafting effective search queries and synthesizing findings from multiple sources. 
    You're particularly skilled at finding current events, breaking news, factual information, and detailed 
    explanations on complex topics. Always start by searching, then synthesize the results into a comprehensive response.
    Remember: Use tools first, then provide analysis based on search results.""",
    tools=available_tools if available_tools else [],
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=3
)

# Chat Assistant Agent - Main conversational agent
chat_assistant = Agent(
    role="Conversational AI Assistant",
    goal="Provide helpful, informative, and engaging responses to user queries in a conversational manner",
    backstory="""You are a knowledgeable and friendly AI assistant who excels at having 
    natural conversations with users. You can discuss a wide range of topics, provide explanations, 
    answer questions, and engage in meaningful dialogue. You're particularly good at adapting your 
    communication style to match the user's needs and maintaining context throughout conversations. 
    You always strive to be helpful, accurate, and engaging while being concise and clear.""",
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=2
)

# Context Analyzer Agent - Analyzes conversation context
context_analyzer = Agent(
    role="Conversation Context Analyst",
    goal="Analyze conversation context and determine the best approach for responding to user queries",
    backstory="""You are a specialist in understanding conversation context, user intent, and 
    dialogue flow. You excel at determining whether a user's query requires research, simple 
    conversation, or specific information. You can identify when searches are needed and what 
    type of information would be most helpful to the user. You help ensure responses are 
    contextually appropriate and useful.""",
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=1
) 