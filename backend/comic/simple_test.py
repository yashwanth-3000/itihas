#!/usr/bin/env python3
"""
Simple test script for Cultural Comics Backend (no external tools required)
"""

import os 
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def test_basic_imports():
    """Test that basic imports work"""
    print("🧪 Testing Basic Imports")
    print("-" * 30)
    
    try:
        from dotenv import load_dotenv
        load_dotenv("../.env.local")
        print("✅ Environment variables loaded")
        
        from config import Config
        print("✅ Config module imported")
        
        import crewai
        print("✅ CrewAI imported")
        
        import fastapi
        print("✅ FastAPI imported")
        
        import genai
        print("✅ IBM GenAI imported")
        
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_config():
    """Test configuration"""
    print("\n🔧 Testing Configuration")
    print("-" * 30)
    
    try:
        from config import Config
        
        # Check required variables
        required_vars = {
            "IBM_API_KEY": Config.IBM_API_KEY,
            "IBM_WATSONX_URL": Config.IBM_WATSONX_URL,
            "IBM_PROJECT_ID": Config.IBM_PROJECT_ID,
            "EXA_API_KEY": Config.EXA_API_KEY
        }
        
        for var_name, var_value in required_vars.items():
            if var_value and var_value != "your_api_key_here":
                print(f"✅ {var_name}: {'*' * (len(str(var_value)) - 4) + str(var_value)[-4:] if len(str(var_value)) > 4 else 'Set'}")
            else:
                print(f"⚠️  {var_name}: Not set or placeholder")
        
        return True
        
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

def test_simple_crew():
    """Test basic crew creation without external tools"""
    print("\n🎭 Testing Simple Crew Creation")
    print("-" * 30)
    
    try:
        from crewai import Agent, Task, Crew
        from config import Config
        
        # Simple agent without external tools
        simple_agent = Agent(
            role="Story Writer",
            goal="Write simple stories about culture",
            backstory="You are a creative writer who specializes in cultural stories for children.",
            tools=[],  # No external tools
            verbose=False,
            allow_delegation=False
        )
        
        # Simple task
        simple_task = Task(
            description="Write a short story about Japanese tea ceremony for children",
            agent=simple_agent,
            expected_output="A brief, educational story about Japanese tea ceremony"
        )
        
        # Simple crew
        simple_crew = Crew(
            agents=[simple_agent],
            tasks=[simple_task],
            verbose=False
        )
        
        print("✅ Simple crew created successfully")
        print(f"✅ Crew has {len(simple_crew.agents)} agent(s)")
        print(f"✅ Crew has {len(simple_crew.tasks)} task(s)")
        
        return True
        
    except Exception as e:
        print(f"❌ Simple crew test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_fastapi_creation():
    """Test FastAPI app creation"""
    print("\n🚀 Testing FastAPI Creation")
    print("-" * 30)
    
    try:
        from fastapi import FastAPI
        
        app = FastAPI(title="Test API")
        print("✅ FastAPI app created successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ FastAPI test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🎨 Cultural Comics Backend - Simple Test Suite")
    print("=" * 50)
    
    tests = [
        test_basic_imports,
        test_config,
        test_simple_crew,
        test_fastapi_creation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"🏁 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your basic setup is working.")
        print("\nNext steps:")
        print("1. Run: source myenv/bin/activate")
        print("2. Run: python start.py")
        print("3. Visit: http://localhost:8000")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 