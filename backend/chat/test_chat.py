#!/usr/bin/env python3
"""
Simple test script for the Chat API
Tests basic functionality without requiring full server setup
"""

import os
import sys
import logging
from datetime import datetime

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_imports():
    """Test that all imports work correctly"""
    print("🔍 Testing imports...")
    try:
        from config import ChatConfig
        from agents import chat_assistant, chat_researcher, context_analyzer
        from tasks import create_simple_chat_task, create_research_task
        from chat_crew import chat_crew
        print("✅ All imports successful")
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_configuration():
    """Test configuration validation"""
    print("\n⚙️ Testing configuration...")
    try:
        from config import ChatConfig
        
        # Check required environment variables
        required_vars = ["IBM_API_KEY", "IBM_WATSONX_URL", "IBM_PROJECT_ID", "EXA_API_KEY", "OPENAI_API_KEY"]
        missing_vars = []
        
        for var in required_vars:
            if not getattr(ChatConfig, var):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"⚠️ Missing environment variables: {', '.join(missing_vars)}")
            print("   Please set these in your .env file")
            return False
        else:
            print("✅ Configuration validated")
            return True
            
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def test_simple_chat():
    """Test simple chat without research"""
    print("\n💬 Testing simple chat...")
    try:
        from chat_crew import chat_crew
        
        test_message = "Hello! Can you tell me a bit about yourself?"
        print(f"   Sending: {test_message}")
        
        result = chat_crew.chat(test_message, force_simple=True)
        
        if result["success"]:
            print("✅ Simple chat test successful")
            print(f"   Response: {result['response'][:100]}...")
            print(f"   Metadata: {result.get('metadata', {})}")
            return True
        else:
            print(f"❌ Chat failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Simple chat error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_research_chat():
    """Test chat with research capabilities"""
    print("\n🔍 Testing research chat...")
    try:
        from chat_crew import chat_crew
        
        test_message = "What's the latest news about artificial intelligence?"
        print(f"   Sending: {test_message}")
        
        result = chat_crew.chat(test_message, force_simple=False)
        
        if result["success"]:
            print("✅ Research chat test successful")
            print(f"   Response: {result['response'][:100]}...")
            print(f"   Research used: {result.get('metadata', {}).get('research_used', False)}")
            return True
        else:
            print(f"❌ Research chat failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Research chat error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_crew_info():
    """Test crew information endpoint"""
    print("\n📊 Testing crew info...")
    try:
        from chat_crew import chat_crew
        
        info = chat_crew.get_crew_info()
        print("✅ Crew info retrieved successfully")
        print(f"   Agents: {len(info['agents'])}")
        print(f"   Capabilities: {len(info['capabilities'])}")
        print(f"   Search tools: {info['search_tools']}")
        return True
        
    except Exception as e:
        print(f"❌ Crew info error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Chat API Tests")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_configuration,
        test_crew_info,
        test_simple_chat,
        # test_research_chat,  # Commented out as it requires API keys
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
    
    print("\n" + "=" * 50)
    print(f"📈 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Chat API is ready.")
        return True
    else:
        print("⚠️ Some tests failed. Check configuration and dependencies.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 