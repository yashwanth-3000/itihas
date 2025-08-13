from crewai import Task
from agents import planner_agent, research_agent, coordinate_extraction_agent, synthesis_agent


def create_planning_task(user_query: str) -> Task:
    return Task(
        description=f"""
        You are the Exploration Planner. Create a concise exploration plan for the query: "{user_query}".

        Output the plan as numbered steps. Each step should include:
        - A targeted search query (keywords) to run on EXA
        - The goal of the search
        - The expected data points to extract (names, places, facts, dates, stats, links)
        - How it contributes to the final output for an explore UI

        Keep it short and practical (3-6 steps).
        """,
        agent=planner_agent,
        expected_output="""
        A numbered list of 3-6 targeted steps, each with: search query, goal, expected data points, and contribution.
        """,
    )


def create_research_task(user_query: str, plan_text: str) -> Task:
    return Task(
        description=f"""
        You are the Exploration Researcher. Follow this plan to run searches and extract facts.

        PLAN:
        {plan_text}

        Rules:
        - MANDATORY: First action must be: Action: Search the internet
        - ALWAYS provide: Action Input: {{"search_query": "..."}}
        - Use multiple searches if plan has multiple steps
        - Combine findings into bullet points grouped by theme
        - Include titles and EXACT URLs for each useful source from search results
        - Focus on entities (names, places), facts, dates, opening hours, and practical details
        - Extract real URLs from search results - never use fake ones
        - Look for official websites, tourism pages, Wikipedia articles, travel guides
        - If a step yields nothing, note it briefly and continue
        """,
        agent=research_agent,
        expected_output="""
        A structured research note with sections per plan step, containing bullet points of key findings and the list of sources with URLs.
        """,
    )


def create_coordinate_extraction_task(user_query: str, research_notes: str) -> Task:
    return Task(
        description=f"""
        You are the Coordinate Extractor. Extract geographic coordinates and images from the research data.

        USER_QUERY: {user_query}

        RESEARCH_NOTES:
        {research_notes}

        Your task:
        1. Look for any latitude/longitude coordinates in the research
        2. Look for Google Maps links and extract coordinates from them
        3. For EACH individual place mentioned, search for "[Exact Place Name] coordinates" using EXA
        4. Search for "[Exact Place Name] latitude longitude" using EXA
        5. Look for Wikipedia coordinates, address information
        6. Extract DIRECT image URLs (ending in .jpg, .jpeg, .png, .gif, .webp) from Wikipedia, tourism sites, and official sources
        7. Search for "[Place Name] images" or "[Place Name] photos" to find high-quality images

        CRITICAL: Search for coordinates for EACH place individually, not just the general area.
        For example:
        - Search "Thousand Pillar Temple coordinates" specifically
        - Search "Ramappa Temple coordinates" specifically  
        - Do NOT use the same coordinates for multiple places

        For each place mentioned in the research, try to find:
        - Exact latitude and longitude coordinates (UNIQUE for each place)
        - High-quality DIRECT image URLs (ending in .jpg, .jpeg, .png, .gif, .webp) from Wikipedia, tourism sites, government sites
        - Full address information
        
        When looking for images, prioritize:
        1. Wikipedia Commons images (upload.wikimedia.org)
        2. Official tourism website images
        3. Government/archaeological survey images
        4. Direct image links from reputable sources
        
        AVOID webpage URLs that don't end in image file extensions.

        Return your findings in this format:
        
        PLACE: [Exact Place Name]
        COORDINATES: [lat, lng] or COORDINATES: NOT_FOUND
        IMAGES: [image_url1, image_url2] or IMAGES: NOT_FOUND
        ADDRESS: [full address] or ADDRESS: NOT_FOUND
        
        PLACE: [Next Exact Place Name]
        ...
        """,
        agent=coordinate_extraction_agent,
        expected_output="""
        Structured list of places with their coordinates, images, and addresses extracted from research.
        """,
    )


def create_synthesis_task(user_query: str, research_notes: str, coordinate_data: str = "") -> Task:
    return Task(
        description=f"""
        You are the Exploration Synthesizer. Using the research notes below, produce a JSON object tailored for an explore UI.

        USER_QUERY: {user_query}

        RESEARCH_NOTES:
        {research_notes}

        COORDINATE_DATA:
        {coordinate_data}

        CRITICAL: You MUST use the actual research data provided above. Never ignore it or create hypothetical data.
        If research notes contain real information, extract it. If coordinate data is provided, use those coordinates.

        Enhanced JSON schema (no additional fields, no markdown):
        {{
          "query": string,
          "summary": string,
          "items": [
            {{
              "title": string,
              "description": string,
              "location": string | null,
              "tags": [string],
              "url": string | null,
              "coordinates": {{"lat": number, "lng": number}} | null,
              "image": string | null,
              "address": string | null
            }}
          ],
          "sources": [string]
        }}

        - "items" should be derived from research, each representing a concrete thing to explore (place, article, artifact, dataset, etc.)
        - "location" is a human friendly city/region/country if applicable, else null
        - "tags" are 2-5 short labels (e.g., "temple", "heritage", "architecture", "UNESCO")
        - "url" should be REAL URLs extracted from the research results - never use example.com or fake URLs
        - "image" should be DIRECT image URLs (ending in .jpg, .jpeg, .png, .gif, .webp) extracted from coordinate data - NOT webpage URLs
        - Only include image URLs if they are direct links to image files, otherwise set to null
        - "sources" must be distinct URLs that were actually found in the research
        - If no real URLs are found, set "url" to null
        - Focus on specific places, landmarks, attractions, or monuments that users can actually visit
        - Keep strings concise; prioritize clarity
        - CRITICAL: Double-check all URLs for typos before including them
        - Return ONLY minified JSON in the exact schema; do not wrap in code fences.
        """,
        agent=synthesis_agent,
        expected_output="""
        A minified JSON string strictly following the schema.
        """,
    )

