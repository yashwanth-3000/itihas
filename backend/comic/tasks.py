from crewai import Task
from agents import cultural_researcher, story_creator, comic_script_writer, quality_reviewer

def create_research_task(topic: str):
    """Task for researching cultural and natural aspects of the given topic"""
    return Task(
        description=f"""
        Research comprehensive information about the topic: "{topic}"
        
        Use semantic search capabilities to find deep, meaningful content about:
        1. Cultural significance and traditions related to this topic
        2. Natural elements and environmental aspects
        3. Historical context and cultural practices
        4. How different cultures approach or view this topic
        5. Environmental conservation messages that can be woven in
        6. Interesting facts that would engage children
        7. Authentic cultural perspectives and practices
        
        Provide detailed research findings that will serve as the foundation 
        for creating an educational children's story. Include specific cultural 
        practices, natural phenomena, and conservation messages.
        
        Ensure all information is:
        - Culturally accurate and respectful
        - Age-appropriate for children (ages 6-12)
        - Rich in educational value
        - Connected to nature and environmental themes
        """,
        agent=cultural_researcher,
        expected_output="""
        A comprehensive research report containing:
        - Cultural background and significance
        - Natural/environmental connections
        - Key educational points for children
        - Specific traditions, practices, or phenomena
        - Conservation messages to include
        - Interesting facts and details
        """
    )

def create_story_task():
    """Task for creating the basic story outline"""
    return Task(
        description="""
        Based on the research findings, create an engaging story outline for children 
        that incorporates the cultural and natural elements discovered.
        
        The story should:
        1. Feature child protagonists (ages 8-12)
        2. Incorporate authentic cultural elements from the research
        3. Include nature and environmental conservation themes
        4. Have a clear beginning, middle, and end
        5. Teach valuable lessons about cultural appreciation and environmental responsibility
        6. Be exciting and adventurous to keep children engaged
        7. Include moments of discovery and learning
        8. Have potential for visual storytelling (suitable for comics)
        
        Create a story that naturally flows into 6 distinct, exciting scenes/chapters.
        Each scene should build upon the previous one and end with intrigue or excitement.
        """,
        agent=story_creator,
        expected_output="""
        A complete story outline including:
        - Main characters (names, ages, backgrounds)
        - Setting (time and place)
        - Plot summary with 6 distinct scenes/chapters
        - Cultural elements woven throughout
        - Environmental conservation messages
        - Educational objectives for each scene
        - Key dialogue and character interactions
        """
    )

def create_comic_script_task():
    """Task for converting story into 6-page comic script"""
    return Task(
        description="""
        Transform the story outline into a detailed 6-page comic book script.
        
        For each page, provide:
        1. Panel descriptions (2-4 panels per page)
        2. Visual scene descriptions for each panel
        3. Character dialogue and thoughts
        4. Sound effects where appropriate
        5. Page-ending cliffhanger or exciting moment
        
        Guidelines:
        - Page 1: Introduction of characters and setting
        - Pages 2-5: Adventure progression with cultural learning
        - Page 6: Resolution with clear conservation message
        
        Each page should:
        - End with excitement, mystery, or cliffhanger
        - Include educational elements naturally
        - Feature engaging visual scenes
        - Have age-appropriate dialogue
        - Advance both plot and educational objectives
        
        Format as a professional comic script with clear panel-by-panel breakdowns.
        """,
        agent=comic_script_writer,
        expected_output="""
        A detailed 6-page comic script with:
        - Page-by-page breakdown
        - Panel descriptions for each page
        - Complete dialogue for all characters
        - Visual scene descriptions
        - Sound effects and visual cues
        - Cultural and educational elements highlighted
        - Exciting page endings
        """
    )

def create_review_task():
    """Task for reviewing and ensuring quality of the comic"""
    return Task(
        description="""
        Review the complete comic script to ensure it meets all requirements:
        
        Content Review:
        1. Age-appropriateness for children (6-12 years)
        2. Cultural accuracy and respectfulness
        3. Clear environmental conservation messages
        4. Educational value in each page
        5. Engaging and exciting storytelling
        
        Quality Assurance:
        1. Each page ends with excitement/cliffhanger
        2. Story flows logically across 6 pages
        3. Characters are relatable and well-developed
        4. Cultural elements are authentic and respectful
        5. Conservation messages are subtle but clear
        6. Language is appropriate for target age group
        
        Provide specific feedback and suggestions for improvement if needed.
        If the comic meets all criteria, approve it with commendations.
        """,
        agent=quality_reviewer,
        expected_output="""
        A comprehensive review report including:
        - Content appropriateness assessment
        - Cultural accuracy verification
        - Educational value evaluation
        - Storytelling effectiveness analysis
        - Specific recommendations for improvements (if any)
        - Final approval status
        - Highlighted strengths of the comic
        """
    ) 