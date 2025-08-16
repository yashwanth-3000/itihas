from typing import Dict
from crewai import Task
from agents import planner_agent, research_agent, coordinate_extraction_agent, synthesis_agent


def create_planning_task(user_query: str, user_location: Dict[str, float] = None) -> Task:
    # Extract location context from query or use user's location
    location_context = ""
    if user_location:
        location_context = f"\nUser's current location: Latitude {user_location['lat']}, Longitude {user_location['lng']}"
    
    return Task(
        description=f"""
        You are the Exploration Planner. Create a concise exploration plan for the query: "{user_query}".{location_context}

        Location-based search rules:
        1. If the query contains a specific location (e.g., "temples in Tamil Nadu"), ONLY search within that exact location.
        2. If no location is specified but user location is provided, search within 50km radius of user's location.
        3. You MUST ensure ALL results are within the specified location or radius.
        4. You MUST plan to find EXACTLY 3 results - no more, no less.
        5. If initial search doesn't yield enough results, plan additional searches with variations:
           - "[location] famous temples"
           - "[location] historic temples"
           - "[location] ancient temples"
           - "[location] religious sites"
           - "[location] places of worship"
        6. NEVER include results from outside the target location/radius.

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


def create_research_task(user_query: str, plan_text: str, user_location: Dict[str, float] = None) -> Task:
    location_context = ""
    if user_location:
        location_context = f"\nUser's current location: Latitude {user_location['lat']}, Longitude {user_location['lng']}"

    return Task(
        description=f"""
        You are the Exploration Researcher. Follow this plan to run searches and extract facts.{location_context}

        PLAN:
        {plan_text}

        STRICT SEARCH PROCESS:
        1. Location-Specific Famous Temples (MANDATORY FIRST STEP):
           For Warangal queries:
           - MUST search for these specific temples first:
             * Thousand Pillar Temple (Rudreshwara Temple)
             * Ramappa Temple (Rudreshwara Temple)
             * Bhadrakali Temple
             * Warangal Fort temples
           - These are historically verified temples in Warangal
           - If these exist, they MUST be included before other temples
           
        2. Location Boundary Verification:
           - For Warangal: Must be within Warangal Urban or Rural district
           - For other cities: Must be within official city/district limits
           - For "near me": Must be within exact 50km radius
           - NEVER include temples outside these boundaries
           
        3. Temple Search Process:
           a) For each famous temple in the location:
              - Search "[temple name] [location] exact address"
              - Search "[temple name] [location] official website"
              - Search "[temple name] [location] tourist information"
              - Verify physical location matches boundaries
           
           b) If more temples needed after famous ones:
              - Search "[location] important temples"
              - Search "[location] historic temples"
              - Search "[location] ancient temples"
              - But ONLY after including available famous temples

        4. For EACH temple, you MUST verify and document:
           - Full physical address
           - GPS coordinates or landmarks proving it's in target area
           - Current operational status
           - Recent visitor information (within last year)
           - Distance from reference point (user location or city center)

        5. Result Requirements:
           - MUST return EXACTLY 3 temples
           - ALL temples MUST be physically within target area
           - NO exceptions to location boundaries
           - If can't find 3 valid temples, clearly state this

        6. Search Format:
           - ALWAYS start with: Action: Search the internet
           - ALWAYS provide: Action Input: {{"search_query": "..."}}
           - Document each verification step
           - Keep track of confirmed in-location temples
        """,
        agent=research_agent,
        expected_output="""
        A structured research note with sections per plan step, containing bullet points of key findings and the list of sources with URLs.
        """,
    )


def create_coordinate_extraction_task(user_query: str, research_notes: str, user_location: Dict[str, float] = None) -> Task:
    location_context = ""
    if user_location:
        location_context = f"\nUser's current location: Latitude {user_location['lat']}, Longitude {user_location['lng']}"

    return Task(
        description=f"""
        You are the Coordinate Extractor. Extract geographic coordinates and images from the research data.

        USER_QUERY: {user_query}{location_context}

        RESEARCH_NOTES:
        {research_notes}

        Your task:
        1. FIRST STEP - Get Temple List:
           a) Search "[Location] famous temples list" ONCE to get overview
           b) Extract AT LEAST 3 major temples from results
           c) Save basic info for each temple found
           d) Move to step 2 after finding 3+ temples
        
        2. Quick Temple Processing:
           For EACH temple (limit 30 seconds per temple):
           a) ONE search: "[Temple Name] [Location] address"
           b) Extract from FIRST result:
              - Basic address
              - Any coordinates found
              - Simple description
           c) Move to next temple immediately
        
        3. STRICT RULES:
           a) MUST collect at least 3 temples:
              - Keep searching until you have 3
              - Use variations: historic temples, ancient temples
              - Include major temples even without full details
           b) NEVER discard temples:
              - Keep ALL temples found
              - Set missing data to null
              - Basic info is enough
        
        4. TEMPLE DATA PRIORITY:
           Required Information (must gather):
           a) Basic Details:
              - Temple name
              - Location in city
              - Main deities/significance
           
           b) Rich Description (100-150 words):
              - Historical background
              - Architectural features
              - Cultural significance
              - Visitor experience
              - Special features/events
              - Best time to visit
           
           c) Practical Information:
              - Address/location
              - Visiting hours if available
              - Notable features
              - Access information
           
           Format Description to Include:
           - Historical context and significance
           - What visitors can see and experience
           - Unique features and attractions
           - Cultural and religious importance
           - Practical visitor information
        8. If user location is provided, calculate and include the distance from user's location to each place

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


def create_synthesis_task(user_query: str, research_notes: str, coordinate_data: str = "", user_location: Dict[str, float] = None) -> Task:
    location_context = ""
    if user_location:
        location_context = f"\nUser's current location: Latitude {user_location['lat']}, Longitude {user_location['lng']}"

    return Task(
        description=f"""
        You are the Exploration Synthesizer. Using the research notes below, produce a JSON object tailored for an explore UI.

        USER_QUERY: {user_query}{location_context}

        RESEARCH_NOTES:
        {research_notes}

        COORDINATE_DATA:
        {coordinate_data}

        CRITICAL REQUIREMENTS:
        1. ALWAYS Return Temples:
           - Return ALL temples found in research
           - Include temples even without coordinates
           - Never skip a temple due to missing data
           - Better partial data than no data
        
        2. Location Processing:
           a) Use temples from research notes that match query location
           b) For city queries (e.g., "temples in Bangalore"):
              - Include ALL temples mentioned for that city
              - Don't require exact coordinates
              - Basic location info is enough
           c) For "near me" queries:
              - Use coordinates if available
              - Otherwise use general location
        
        3. Data Requirements:
           Required Fields (MUST have):
           - Temple name
           - City/area location
           - Basic description
           
           Optional Fields (include if available):
           - Exact coordinates
           - Detailed address
           - Images
           - URLs
        
        4. Quality Rules:
           - Keep descriptions clear and concise
           - Use verified URLs when available
           - Set missing fields to null
           - Include sources when found
        
        5. STRICT OUTPUT RULES:
           - Generate COMPLETE, valid JSON
           - NO partial URLs or broken strings
           - NO complex image URLs that might break
           - Better to have null fields than invalid data
           - MUST return exactly 3 temples
        
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
              "address": string | null,
              "distance_km": number | null,  # Distance from user's location in kilometers (if user_location provided)
              "distance_text": string | null  # Human-readable distance/time (e.g., "5.2 km away" or "15 min drive")
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

