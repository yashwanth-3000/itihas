from crewai import Agent
from crewai_tools import EXASearchTool, SerperDevTool, WebsiteSearchTool
try:
    from langchain_community.llms import WatsonxLLM
except ImportError:
    # Fallback for newer version
    from langchain_ibm import WatsonxLLM
from config import Config

# Initialize search tools - EXA for semantic search, SERPER as fallback
# Configure tools to avoid OpenAI dependency issues
try:
    exa_search_tool = EXASearchTool()
except Exception as e:
    print(f"Warning: EXA tool initialization failed: {e}")
    exa_search_tool = None

try:
    search_tool = SerperDevTool()  # Keep as fallback
except Exception as e:
    print(f"Warning: SERPER tool initialization failed: {e}")
    search_tool = None

try:
    web_search_tool = WebsiteSearchTool()
except Exception as e:
    print(f"Warning: Website search tool initialization failed: {e}")
    web_search_tool = None

# Create list of available tools
available_tools = [tool for tool in [exa_search_tool, search_tool, web_search_tool] if tool is not None]

# Initialize IBM Watson LLM
def get_watsonx_llm():
    return WatsonxLLM(
        model_id="ibm/granite-3-8b-instruct",  # Updated to supported granite-3-8b model
        url=Config.IBM_WATSONX_URL,
        apikey=Config.IBM_API_KEY,
        project_id=Config.IBM_PROJECT_ID,
        params={
            "decoding_method": "greedy",
            "max_new_tokens": 2000,
            "temperature": 0.7,
            "repetition_penalty": 1.1
        }
    )

# Cultural Research Agent
cultural_researcher = Agent(
    role="Cultural Research Specialist",
    goal="Research and gather comprehensive information about cultures, traditions, and natural elements related to the given topic",
    backstory="""You are an expert cultural anthropologist and naturalist with deep knowledge 
    of world cultures, traditions, and their relationship with nature. You specialize in 
    finding authentic, educational, and engaging cultural information that can inspire 
    children to learn and appreciate diversity. When external search tools are not available,
    you rely on your extensive training knowledge to provide accurate cultural information.""",
    tools=available_tools if available_tools else [],
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=3
)

# Story Creator Agent  
story_creator = Agent(
    role="Children's Story Creator",
    goal="Create engaging, educational stories for children that incorporate cultural elements and nature conservation messages",
    backstory="""You are a renowned children's author who specializes in creating 
    educational stories that are both entertaining and meaningful. You have a gift for 
    weaving cultural knowledge and environmental awareness into compelling narratives 
    that captivate young minds while teaching important values.""",
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=2
)

# Comic Script Writer Agent
comic_script_writer = Agent(
    role="Comic Script Writer",
    goal="Transform stories into engaging 6-page comic book scripts with visual descriptions and dialogue",
    backstory="""You are a professional comic book writer who specializes in children's 
    educational comics. You excel at creating visual storytelling that combines engaging 
    dialogue, compelling scene descriptions, and cliffhanger endings for each page. 
    You understand how to make complex cultural and environmental topics accessible 
    and exciting for young readers.""",
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=2
)

# Quality Assurance Agent
quality_reviewer = Agent(
    role="Children's Content Quality Reviewer",
    goal="Ensure content is age-appropriate, culturally respectful, and educationally valuable for children",
    backstory="""You are an experienced educator and child development specialist who 
    reviews educational content for children. You have expertise in cultural sensitivity, 
    age-appropriate content creation, and environmental education. You ensure that all 
    content is respectful, accurate, and engaging for young audiences.""",
    llm=get_watsonx_llm(),
    verbose=True,
    allow_delegation=False,
    max_iter=2
) 