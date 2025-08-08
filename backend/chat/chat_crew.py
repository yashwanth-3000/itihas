from crewai import Crew, Process
from agents import chat_researcher, chat_assistant, context_analyzer, exa_search_tool
from tasks import create_context_analysis_task, create_research_task, create_response_task, create_simple_chat_task
from typing import Dict, Any, List, Optional
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatCrew:
    """
    Main orchestrator for AI chat functionality using CrewAI
    Handles conversation workflow with optional research capabilities
    """
    
    def __init__(self):
        """Initialize the chat crew"""
        self.crew = None
        self.simple_crew = None
        self._setup_crews()
    
    def _setup_crews(self):
        """Set up the CrewAI crews for different chat scenarios"""
        try:
            # Full crew with research capabilities
            self.crew = Crew(
                agents=[
                    context_analyzer,
                    chat_researcher,
                    chat_assistant
                ],
                tasks=[],  # Tasks will be added dynamically
                process=Process.sequential,
                verbose=True,
                memory=True,
                embedder={
                    "provider": "openai",
                    "config": {
                        "model": "text-embedding-ada-002"
                    }
                }
            )
            
            # Simple crew for basic conversations
            self.simple_crew = Crew(
                agents=[chat_assistant],
                tasks=[],  # Tasks will be added dynamically
                process=Process.sequential,
                verbose=True,
                memory=True,
                embedder={
                    "provider": "openai",
                    "config": {
                        "model": "text-embedding-ada-002"
                    }
                }
            )
            
            logger.info("Chat crews initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing crews: {str(e)}")
            raise
    
    def chat(self, user_message: str, conversation_history: List[Dict] = None, force_simple: bool = False, force_research: bool = False) -> Dict[str, Any]:
        """
        Process a chat message and generate a response
        
        Args:
            user_message (str): The user's message
            conversation_history (List[Dict]): Previous conversation context
            force_simple (bool): Force simple chat without research
            force_research (bool): Force research even for simple queries
            
        Returns:
            Dict[str, Any]: The chat response with metadata
        """
        try:
            logger.info(f"Processing chat message: {user_message[:100]}...")
            
            if force_simple:
                return self._simple_chat(user_message)
            
            # Force research if explicitly requested
            if force_research:
                logger.info(f"FORCING RESEARCH MODE - User enabled think mode for: {user_message[:50]}...")
                return self._chat_with_research(user_message, conversation_history, "Forced research mode via think mode")
            
            # First, analyze context to determine if research is needed
            analysis_result = self._analyze_context(user_message, conversation_history)
            
            # Determine if research is needed based on analysis
            needs_research = self._needs_research(analysis_result, user_message)
            
            if needs_research:
                logger.info(f"RESEARCH TRIGGERED - Keywords detected in: {user_message[:50]}...")
                return self._chat_with_research(user_message, conversation_history, analysis_result)
            else:
                logger.info(f"SIMPLE CHAT - No research needed for: {user_message[:50]}...")
                return self._simple_chat(user_message)
                
        except Exception as e:
            logger.error(f"Error processing chat: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": user_message,
                "response": "I encountered an error while processing your message. Please try again.",
                "metadata": {
                    "error_type": "processing_error"
                }
            }
    
    def _analyze_context(self, user_message: str, conversation_history: List[Dict] = None) -> str:
        """Analyze the context to determine response strategy"""
        try:
            analysis_task = create_context_analysis_task(user_message, conversation_history)
            
            # Create temporary crew for analysis
            analysis_crew = Crew(
                agents=[context_analyzer],
                tasks=[analysis_task],
                process=Process.sequential,
                verbose=False,
                embedder={
                    "provider": "openai",
                    "config": {
                        "model": "text-embedding-ada-002"
                    }
                }
            )
            
            result = analysis_crew.kickoff()
            return str(result)
            
        except Exception as e:
            logger.error(f"Error in context analysis: {str(e)}")
            return "Analysis unavailable"
    
    def _needs_research(self, analysis_result: str, user_message: str) -> bool:
        """Determine if the query needs research based on analysis and keywords"""
        research_keywords = [
            "latest", "current", "recent", "today", "news", "update", "what's happening",
            "when did", "current price", "stock price", "weather", "score", "results",
            "search", "find", "look up", "what is", "who is", "where is", "how is",
            "trending", "breaking", "live", "now", "2024", "2025", "this year"
        ]
        
        # Check if analysis explicitly mentions research need
        analysis_lower = analysis_result.lower()
        if "research is needed: yes" in analysis_lower or "requires research" in analysis_lower:
            return True
        
        # Check for research keywords in user message
        message_lower = user_message.lower()
        if any(keyword in message_lower for keyword in research_keywords):
            return True
        
        # Default to simple chat for most queries
        return False
    
    def _simple_chat(self, user_message: str) -> Dict[str, Any]:
        """Handle simple chat without research"""
        try:
            logger.info("Processing as simple chat")
            
            simple_task = create_simple_chat_task(user_message)
            self.simple_crew.tasks = [simple_task]
            
            result = self.simple_crew.kickoff()
            
            return {
                "success": True,
                "message": user_message,
                "response": str(result),
                "metadata": {
                    "response_type": "simple_chat",
                    "research_used": False,
                    "agents_used": ["Conversational AI Assistant"],
                    "agent_hierarchy": [
                        {
                            "agent": "Conversational AI Assistant",
                            "role": "Primary response generator",
                            "order": 1,
                            "status": "completed"
                        }
                    ],
                    "execution_flow": "Simple chat flow: User input → Conversational AI Assistant → Response"
                }
            }
            
        except Exception as e:
            logger.error(f"Error in simple chat: {str(e)}")
            raise
    
    def _chat_with_research(self, user_message: str, conversation_history: List[Dict] = None, analysis_result: str = None) -> Dict[str, Any]:
        """Handle chat with research capabilities - FORCES EXA SEARCH"""
        try:
            logger.info("Processing chat with research - FORCING EXA SEARCH")
            
            # FORCE EXA SEARCH FIRST - This bypasses the agent tool-calling issue
            search_query = user_message.strip()  # Use the message directly as search query
            logger.info(f"Executing forced EXA search for: {search_query}")
            
            search_results = "No search results available"
            search_success = False
            
            if exa_search_tool:
                try:
                    search_results = exa_search_tool._run(search_query)
                    search_success = True
                    logger.info(f"EXA search completed - {len(search_results)} characters returned")
                except Exception as e:
                    logger.error(f"EXA search failed: {e}")
                    search_results = f"Search error: {str(e)}"
            
            # Extract sources from search results
            sources = self._extract_sources_from_search_results(search_results)
            
            # Create enhanced message with search results
            enhanced_message = f"""
            User Query: {user_message}
            
            CURRENT SEARCH RESULTS FROM EXA (as of {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}):
            {search_results}
            
            CRITICAL FORMATTING REQUIREMENTS:
            - **FORMAT YOUR ENTIRE RESPONSE IN MARKDOWN**
            - Start with a ## heading that summarizes the topic
            - Use **bold** for key findings and important information
            - Use bullet points (- ) for listing information
            - Use > quotes for highlighting important sources or quotes
            - Use ### subheadings to organize different aspects
            - **NEVER use emojis in your response**
            - Keep responses professional and text-only
            - **MANDATORY: End your response with a "### Sources" section listing all source URLs**
            
            CONTENT REQUIREMENTS:
            - Base your response ONLY on the above search results
            - These are current, real-time results from {datetime.now().strftime('%Y-%m-%d')}
            - Do not mention knowledge cutoffs or training data
            - Present information as current and accurate
            - Include source attribution where possible
            - Structure like a professional web search response
            - **MANDATORY: Your response MUST end with exactly this section:**
            
            ### Sources
            {chr(10).join(f"- {source}" for source in sources)}
            
            **DO NOT modify or change the Sources section format above. Use it exactly as shown.**
            """
            
            # Create response task with search results embedded
            response_task = create_response_task(enhanced_message, requires_search=True)
            
            # Update crew with single task (no need for research task since we already have results)
            self.crew.tasks = [response_task]
            
            # Execute the crew
            result = self.crew.kickoff()
            
            return {
                "success": True,
                "message": user_message,
                "response": str(result),
                "metadata": {
                    "response_type": "research_chat",
                    "research_used": True,
                    "exa_search_used": search_success,
                    "search_query": search_query,
                    "search_results_length": len(search_results),
                    "search_timestamp": datetime.now().isoformat(),
                    "agents_used": ["Context Analyzer", "EXA Search Tool", "Conversational AI Assistant"],
                    "agent_hierarchy": [
                        {
                            "agent": "Context Analyzer",
                            "role": "Query analysis and context determination",
                            "order": 1,
                            "status": "completed"
                        },
                        {
                            "agent": "EXA Search Tool",
                            "role": "Real-time information retrieval",
                            "order": 2,
                            "status": "completed" if search_success else "failed"
                        },
                        {
                            "agent": "Conversational AI Assistant",
                            "role": "Research synthesis and response generation",
                            "order": 3,
                            "status": "completed"
                        }
                    ],
                    "execution_flow": "Research chat flow: User input → Context Analyzer → EXA Search → Conversational AI Assistant → Response",
                    "analysis": analysis_result
                }
            }
            
        except Exception as e:
            logger.error(f"Error in research chat: {str(e)}")
            raise
    
    def _extract_sources_from_search_results(self, search_results: str) -> List[str]:
        """Extract URLs from EXA search results for sources section"""
        import re
        
        sources = []
        try:
            # Pattern to match URLs in the EXA search results format
            # Looking for "URL: https://..." pattern
            url_pattern = r'URL:\s*(https?://[^\s\n]+)'
            urls = re.findall(url_pattern, search_results)
            
            # Clean up URLs and remove duplicates
            for url in urls:
                url = url.strip()
                if url and url not in sources and url != 'No URL':
                    sources.append(url)
            
            # If no URLs found, try alternative patterns
            if not sources:
                # Try finding any URLs in the text
                general_url_pattern = r'https?://[^\s\n]+'
                urls = re.findall(general_url_pattern, search_results)
                for url in urls:
                    url = url.strip()
                    if url and url not in sources:
                        sources.append(url)
            
            logger.info(f"Extracted {len(sources)} sources from search results")
            return sources
            
        except Exception as e:
            logger.error(f"Error extracting sources: {e}")
            return []
    
    def get_crew_info(self) -> Dict[str, Any]:
        """Get information about the chat crew setup"""
        return {
            "agents": [
                {
                    "role": "Context Analyzer",
                    "purpose": "Analyze conversation context and determine response strategy"
                },
                {
                    "role": "Information Research Specialist", 
                    "purpose": "Research current information using advanced search capabilities"
                },
                {
                    "role": "Conversational AI Assistant",
                    "purpose": "Provide helpful and engaging conversational responses"
                }
            ],
            "capabilities": [
                "Context-aware conversations",
                "Intelligent research when needed", 
                "Multiple response strategies",
                "Conversation history awareness"
            ],
            "search_tools": ["EXA Search", "SERPER", "Website Search"],
            "features": ["Memory enabled", "Sequential processing", "Dynamic task creation"]
        }

# Create a singleton instance
chat_crew = ChatCrew() 