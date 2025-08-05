from crewai import Crew, Process
from agents import cultural_researcher, story_creator, comic_script_writer, quality_reviewer
from tasks import create_research_task, create_story_task, create_comic_script_task, create_review_task
from typing import Dict, Any
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ComicCreationCrew:
    """
    Main orchestrator for the comic creation process using CrewAI
    """
    
    def __init__(self):
        """Initialize the comic creation crew"""
        self.crew = None
        self._setup_crew()
    
    def _setup_crew(self):
        """Set up the CrewAI crew with agents and tasks"""
        try:
            # Note: Tasks will be created dynamically with the topic
            self.crew = Crew(
                agents=[
                    cultural_researcher,
                    story_creator, 
                    comic_script_writer,
                    quality_reviewer
                ],
                tasks=[],  # Tasks will be added dynamically
                process=Process.sequential,
                verbose=True,
                memory=True,
                embedder={
                    "provider": "huggingface",
                    "config": {
                        "model": "sentence-transformers/all-MiniLM-L6-v2"
                    }
                }
            )
            logger.info("Comic creation crew initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing crew: {str(e)}")
            raise
    
    def create_comic(self, topic: str) -> Dict[str, Any]:
        """
        Main method to create a comic based on the given topic
        
        Args:
            topic (str): The topic/theme for the comic
            
        Returns:
            Dict[str, Any]: The complete comic creation results
        """
        try:
            logger.info(f"Starting comic creation for topic: {topic}")
            
            # Create tasks dynamically with the specific topic
            research_task = create_research_task(topic)
            story_task = create_story_task()
            comic_script_task = create_comic_script_task()
            review_task = create_review_task()
            
            # Set up task dependencies
            story_task.context = [research_task]
            comic_script_task.context = [research_task, story_task] 
            review_task.context = [research_task, story_task, comic_script_task]
            
            # Update crew with tasks
            self.crew.tasks = [research_task, story_task, comic_script_task, review_task]
            
            # Execute the crew
            logger.info("Executing comic creation crew...")
            result = self.crew.kickoff()
            
            # Process and structure the result
            structured_result = self._structure_result(result, topic)
            
            logger.info("Comic creation completed successfully")
            return structured_result
            
        except Exception as e:
            logger.error(f"Error creating comic: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "topic": topic,
                "result": None
            }
    
    def _structure_result(self, result: Any, topic: str) -> Dict[str, Any]:
        """
        Structure the crew result into a standardized format
        
        Args:
            result: Raw result from crew execution
            topic (str): The original topic
            
        Returns:
            Dict[str, Any]: Structured result
        """
        try:
            # Extract individual task results if available
            task_results = {}
            
            if hasattr(result, 'tasks_output') and result.tasks_output:
                task_outputs = result.tasks_output
                task_results = {
                    "research": task_outputs[0].raw if len(task_outputs) > 0 else None,
                    "story": task_outputs[1].raw if len(task_outputs) > 1 else None,
                    "comic_script": task_outputs[2].raw if len(task_outputs) > 2 else None,
                    "review": task_outputs[3].raw if len(task_outputs) > 3 else None
                }
            
            return {
                "success": True,
                "topic": topic,
                "result": {
                    "final_output": str(result),
                    "task_results": task_results,
                    "metadata": {
                        "agents_used": ["cultural_researcher", "story_creator", "comic_script_writer", "quality_reviewer"],
                        "process_type": "sequential",
                        "topic": topic
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Error structuring result: {str(e)}")
            return {
                "success": False,
                "error": f"Error structuring result: {str(e)}",
                "topic": topic,
                "result": {
                    "final_output": str(result),
                    "task_results": {},
                    "metadata": {"topic": topic}
                }
            }
    
    def get_crew_info(self) -> Dict[str, Any]:
        """Get information about the crew setup"""
        return {
            "agents": [
                {
                    "role": "Cultural Research Specialist",
                    "purpose": "Research cultural and natural aspects of topics"
                },
                {
                    "role": "Children's Story Creator", 
                    "purpose": "Create engaging educational stories for children"
                },
                {
                    "role": "Comic Script Writer",
                    "purpose": "Transform stories into 6-page comic scripts"
                },
                {
                    "role": "Children's Content Quality Reviewer",
                    "purpose": "Ensure content quality and appropriateness"
                }
            ],
            "process": "Sequential",
            "features": ["Memory enabled", "Verbose logging", "Task dependencies"]
        }

# Create a singleton instance
comic_crew = ComicCreationCrew() 