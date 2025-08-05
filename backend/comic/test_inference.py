#!/usr/bin/env python3
"""
Test script to verify that inference and content generation actually works
"""

import os
import sys
import asyncio
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def test_watson_llm():
    """Test if IBM Watson LLM is working"""
    print("🧠 Testing IBM Watson LLM Connection")
    print("-" * 40)
    
    try:
        from dotenv import load_dotenv
        load_dotenv("../.env.local")
        
        from agents import get_watsonx_llm
        
        # Try to create Watson LLM instance
        llm = get_watsonx_llm()
        print("✅ Watson LLM instance created")
        
        # Test simple inference
        print("🔄 Testing simple inference...")
        test_prompt = "Write a short sentence about Japanese culture for children."
        
        try:
            response = llm.invoke(test_prompt)
            print(f"✅ LLM Response: {response[:100]}..." if len(str(response)) > 100 else f"✅ LLM Response: {response}")
            return True
        except Exception as e:
            print(f"❌ LLM inference failed: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Watson LLM setup failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_simple_agent():
    """Test if a simple agent can generate content"""
    print("\n🤖 Testing Simple Agent Content Generation")
    print("-" * 40)
    
    try:
        from crewai import Agent, Task, Crew
        from agents import get_watsonx_llm
        
        # Create a simple agent
        writer_agent = Agent(
            role="Children's Story Writer",
            goal="Write short educational stories about culture for children",
            backstory="You are a creative writer who loves creating simple, educational stories for children about different cultures around the world.",
            tools=[],  # No external tools to avoid dependency issues
            llm=get_watsonx_llm(),
            verbose=True,
            allow_delegation=False,
            max_iter=1
        )
        
        # Create a simple task
        story_task = Task(
            description="Write a very short story (2-3 sentences) about cherry blossoms in Japan that children can understand and learn from.",
            agent=writer_agent,
            expected_output="A short, educational story about cherry blossoms in Japan for children"
        )
        
        # Create crew
        test_crew = Crew(
            agents=[writer_agent],
            tasks=[story_task],
            verbose=True
        )
        
        print("🔄 Executing simple story generation...")
        
        # Run the crew
        result = test_crew.kickoff()
        
        print(f"\n✅ Story Generated Successfully!")
        print("=" * 50)
        print(f"Generated Story: {result}")
        print("=" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ Agent content generation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_multi_agent_workflow():
    """Test a simple multi-agent workflow"""
    print("\n👥 Testing Multi-Agent Workflow")
    print("-" * 40)
    
    try:
        from crewai import Agent, Task, Crew
        from agents import get_watsonx_llm
        
        # Create researcher agent
        researcher = Agent(
            role="Cultural Researcher",
            goal="Research basic facts about cultures",
            backstory="You are a cultural researcher who knows interesting facts about world cultures.",
            tools=[],
            llm=get_watsonx_llm(),
            verbose=True,
            allow_delegation=False,
            max_iter=1
        )
        
        # Create writer agent
        writer = Agent(
            role="Story Writer",
            goal="Write stories based on research",
            backstory="You are a story writer who creates educational content for children.",
            tools=[],
            llm=get_watsonx_llm(),
            verbose=True,
            allow_delegation=False,
            max_iter=1
        )
        
        # Create research task
        research_task = Task(
            description="Provide 2 interesting facts about tea ceremonies in different cultures.",
            agent=researcher,
            expected_output="Two interesting facts about tea ceremonies"
        )
        
        # Create writing task
        writing_task = Task(
            description="Using the research facts, write a short educational paragraph about tea ceremonies for children.",
            agent=writer,
            expected_output="Educational paragraph about tea ceremonies for children",
            context=[research_task]  # This task depends on research_task
        )
        
        # Create crew
        multi_crew = Crew(
            agents=[researcher, writer],
            tasks=[research_task, writing_task],
            verbose=True
        )
        
        print("🔄 Executing multi-agent workflow...")
        
        # Run the crew
        result = multi_crew.kickoff()
        
        print(f"\n✅ Multi-Agent Workflow Completed!")
        print("=" * 50)
        print(f"Final Result: {result}")
        print("=" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ Multi-agent workflow failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run inference tests"""
    print("🎨 Cultural Comics Backend - Inference Test")
    print("=" * 50)
    
    tests = [
        test_watson_llm,
        test_simple_agent,
        test_multi_agent_workflow
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
            print()  # Add spacing between tests
        except KeyboardInterrupt:
            print("\n⚠️ Test interrupted by user")
            break
        except Exception as e:
            print(f"❌ Test failed with unexpected error: {e}")
    
    print("=" * 50)
    print(f"🏁 Inference Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All inference tests passed! Your AI agents are working correctly.")
        print("\n🚀 Your Cultural Comics system is ready for full comic generation!")
    else:
        print("⚠️ Some inference tests failed. Check the errors above.")
        
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 