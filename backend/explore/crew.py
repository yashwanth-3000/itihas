from typing import Any, Dict, List

from crewai import Crew, Process

from agents import planner_agent, research_agent, coordinate_extraction_agent, synthesis_agent, exa_search_tool
from tasks import create_planning_task, create_research_task, create_coordinate_extraction_task, create_synthesis_task
from config import ExploreConfig


class ExploreCrew:
    """Agentic workflow to plan, search (EXA), and synthesize results using IBM Watsonx."""

    def __init__(self) -> None:
        self.crew = Crew(
            agents=[planner_agent, research_agent, coordinate_extraction_agent, synthesis_agent],
            tasks=[],
            process=Process.sequential,
            verbose=True,
            memory=False,
        )

    def run(self, query: str, user_location: Dict[str, float] = None) -> Dict[str, Any]:
        """
        Run the exploration crew with optional user location context.
        
        Args:
            query: The user's search query
            user_location: Optional dict with user's location {'lat': float, 'lng': float}
        """
        # Validate and format location for strict geographic search
        location_context = {}
        if user_location and 'lat' in user_location and 'lng' in user_location:
            try:
                lat = float(user_location['lat'])
                lng = float(user_location['lng'])
                # Validate coordinates are within reasonable bounds
                if -90 <= lat <= 90 and -180 <= lng <= 180:
                    location_context = {
                        'lat': lat,
                        'lng': lng,
                        # Use reverse geocoding to get location name for more accurate search
                        'search_radius_km': 50,  # Set strict radius for "near me" searches
                        'strict_bounds': True  # Enforce strict geographic boundaries
                    }
                    # Modify query to enforce location if not already specified
                    if "in" not in query.lower() and "near" not in query.lower():
                        query = f"{query} near current location"
            except (ValueError, TypeError):
                location_context = None
        # 1) Planning
        planning_task = create_planning_task(query, user_location)

        # 2) Research (uses EXA tool). We will force at least one pre-search to ensure data present.
        #    This bypasses any tool-calling quirks by injecting results context if needed.
        forced_search = exa_search_tool._run(query)
        research_preamble = f"Forced initial EXA search for context:\n{forced_search}\n\nUse EXA again per plan steps."
        research_task = create_research_task(query, plan_text=f"{research_preamble}\n\n(Plan will follow)\n{{PLAN_PLACEHOLDER}}", user_location=user_location)

        # 3) Synthesis
        synthesis_task = create_synthesis_task(query, research_notes="{RESEARCH_NOTES_PLACEHOLDER}", user_location=user_location)

        # Wire sequentially by running step-by-step to pass outputs
        self.crew.tasks = [planning_task]
        plan_result = str(self.crew.kickoff())

        research_task = create_research_task(query, plan_text=plan_result + "\n\n" + research_preamble, user_location=user_location)
        self.crew.tasks = [research_task]
        research_result = str(self.crew.kickoff())

        # 3) Coordinate & Image Extraction
        coordinate_task = create_coordinate_extraction_task(query, research_notes=research_result, user_location=user_location)
        self.crew.tasks = [coordinate_task]
        coordinate_result = str(self.crew.kickoff())

        # 4) Synthesis
        synthesis_task = create_synthesis_task(query, research_notes=research_result, coordinate_data=coordinate_result, user_location=user_location)
        self.crew.tasks = [synthesis_task]
        synthesis_result = str(self.crew.kickoff())

        # Expect synthesis_result to be JSON; return parsed if possible
        import json

        payload: Dict[str, Any]
        try:
            payload = json.loads(synthesis_result)
        except Exception:
            # Fallback: return raw string in a standard envelope
            payload = {
                "query": query,
                "summary": "",
                "items": [],
                "sources": [],
                "raw": synthesis_result,
            }

        return {
            "success": True,
            "query": query,
            "plan": plan_result,
            "notes": research_result,
            "result": payload,
        }


explore_crew = ExploreCrew()

