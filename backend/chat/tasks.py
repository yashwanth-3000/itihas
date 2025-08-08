from crewai import Task
from agents import chat_researcher, chat_assistant, context_analyzer

def create_context_analysis_task(user_message: str, conversation_history: list = None):
    """Task for analyzing user message context and determining response strategy"""
    history_context = ""
    if conversation_history:
        history_context = "\n".join([f"User: {msg.get('user', '')}\nAssistant: {msg.get('assistant', '')}" 
                                   for msg in conversation_history[-3:]])  # Last 3 exchanges
    
    return Task(
        description=f"""
        Analyze the user's message and conversation context to determine the best response approach.
        
        User Message: "{user_message}"
        
        Recent Conversation History:
        {history_context if history_context else "No previous conversation history"}
        
        Your analysis should determine:
        1. Does this query require current information or web search?
        2. What type of response would be most helpful (informational, conversational, explanatory)?
        3. What specific topics or areas should be researched if needed?
        4. What is the user's likely intent and desired outcome?
        5. Should this be treated as a follow-up to previous conversation?
        
        Provide a clear analysis and recommendation for how to proceed.
        """,
        agent=context_analyzer,
        expected_output="""
        A context analysis including:
        - User intent assessment
        - Response strategy recommendation
        - Whether research is needed (yes/no)
        - Specific research topics if applicable
        - Conversational context summary
        - Recommended response approach
        """
    )

def create_research_task(query: str, research_focus: str = None):
    """Task for researching information to answer user queries"""
    focus_instruction = f"Focus specifically on: {research_focus}" if research_focus else ""
    
    return Task(
        description=f"""
        Research comprehensive and accurate information to help answer the user's query: "{query}"
        
        {focus_instruction}
        
        MANDATORY: You MUST use the "Search the internet" tool BEFORE providing any response.
        
        Step 1: ALWAYS start with: Action: Search the internet
        Step 2: ALWAYS use: Action Input: {{"search_query": "your search terms"}}
        Step 3: Wait for search results
        Step 4: Then provide your analysis based on the search results
        
        NEVER respond with training data. ONLY use information from the search results.
        
        Use the "Search the internet" tool to find:
        1. Current, accurate information relevant to the query
        2. Multiple perspectives or sources when appropriate
        3. Factual data, statistics, or specific details
        4. Context that would help provide a complete answer
        5. Recent developments or updates on the topic
        
        SEARCH STRATEGY:
        - Always start by using the search tool with relevant keywords
        - Search for multiple aspects of the query if complex
        - Use specific search terms to get the most relevant results
        - Verify information from multiple search results when possible
        
        Ensure all information is:
        - Accurate and up-to-date FROM SEARCH RESULTS
        - Relevant to the user's specific question
        - From reliable sources found through search
        - Comprehensive enough to inform a detailed response
        
        Only if search tools fail should you indicate knowledge cutoff limitations.
        """,
        agent=chat_researcher,
        expected_output="""
        A comprehensive research summary containing:
        - Key findings relevant to the user's query
        - Important facts, data, or statistics
        - Multiple perspectives if applicable
        - Source reliability assessment
        - Any limitations or knowledge gaps
        - Recommendations for the final response
        """
    )

def create_response_task(user_message: str, requires_search: bool = False):
    """Task for generating the final conversational response"""
    search_instruction = "Use the research findings to inform your response." if requires_search else "Use your knowledge to provide a helpful response."
    
    return Task(
        description=f"""
        Generate a helpful, engaging, and informative response to the user's message: "{user_message}"
        
        {search_instruction}
        
        Your response should be:
        1. Directly relevant to the user's question or comment
        2. Clear and easy to understand
        3. Conversational and engaging in tone
        4. Comprehensive but concise
        5. Helpful and actionable when appropriate
        6. Contextually appropriate for the conversation
        7. **FORMATTED IN PROPER MARKDOWN**
        
        MANDATORY FORMATTING REQUIREMENTS:
        - **Use markdown syntax for all formatting**
        - Use ## for main headings, ### for subheadings
        - Use **bold** for emphasis and important points
        - Use *italics* for subtle emphasis
        - Use `code blocks` for technical terms or commands
        - Use bullet points with - for lists
        - Use numbered lists 1. 2. 3. when order matters
        - Use > for quotes or important notes
        - Use [link text](URL) format for any links
        - Structure content with clear headings and sections
        - For search results, clearly indicate sources and recent findings
        - **NEVER use emojis in your response**
        - Keep responses professional and text-only
        
        Guidelines:
        - Keep the tone friendly and professional
        - Structure information clearly with markdown headings and lists
        - Include specific details when they add value
        - Acknowledge any limitations in your knowledge
        - Encourage follow-up questions if appropriate
        - Maintain conversation flow naturally
        - **ALWAYS format the entire response in markdown**
        
        IMPORTANT: Your response should be professional text only. Do not include any emojis, emoticons, or special characters like 😊, 🌟, etc. Use plain text with markdown formatting only.
        """,
        agent=chat_assistant,
        expected_output="""
        A conversational response that:
        - Directly addresses the user's query
        - Is well-structured and easy to read in **markdown format**
        - Includes relevant information and details with proper markdown formatting
        - Maintains an engaging, helpful tone
        - Uses markdown headings, lists, and emphasis appropriately
        - Encourages continued conversation when appropriate
        - **ENTIRE RESPONSE MUST BE IN MARKDOWN FORMAT**
        """
    )

def create_simple_chat_task(user_message: str):
    """Task for simple conversational responses that don't require research"""
    return Task(
        description=f"""
        Provide a helpful and engaging conversational response to: "{user_message}"
        
        This is a straightforward conversational query that doesn't require external research.
        Focus on:
        1. Being helpful and informative
        2. Maintaining a friendly, conversational tone
        3. Providing clear and relevant information
        4. Encouraging continued dialogue
        5. Being concise but comprehensive
        6. **FORMATTING EVERYTHING IN PROPER MARKDOWN**
        
        MARKDOWN FORMATTING REQUIREMENTS:
        - Use ## for main headings, ### for subheadings
        - Use **bold** for emphasis and important points
        - Use *italics* for subtle emphasis
        - Use `code blocks` for technical terms
        - Use bullet points with - for lists
        - Use numbered lists when order matters
        - Use > for quotes or important notes
        - Structure content with clear markdown formatting
        - **ABSOLUTELY NO EMOJIS OR EMOTICONS ALLOWED**
        - Keep responses professional and text-only
        - Do not use any symbols like 😊, 🌟, 👍, ✨, 🚀, etc.
        - Professional business communication style only
        
        Use your training knowledge to provide the best possible response in markdown format.
        
        CRITICAL: This is a professional system. NEVER include emojis, emoticons, or decorative symbols. Your response must be plain text with markdown formatting only. Any emoji will cause system errors.
        """,
        agent=chat_assistant,
        expected_output="""
        A friendly, informative response that:
        - Directly addresses the user's message
        - Provides helpful information in **markdown format**
        - Maintains conversational flow with proper markdown structure
        - Is appropriately detailed with markdown formatting
        - Uses headings, lists, and emphasis correctly
        - Encourages further interaction
        - **ENTIRE RESPONSE MUST BE IN MARKDOWN FORMAT**
        """
    ) 