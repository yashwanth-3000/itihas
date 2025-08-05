#!/usr/bin/env python3
"""
Simple test script for the Cultural Comics Backend
"""

import os
import sys
import json
import asyncio
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

async def test_comic_generation():
    """Test the comic generation system"""
    print("🧪 Testing Cultural Comics Backend")
    print("=" * 50)
    
    try:
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv("../.env.local")
        print("✅ Environment variables loaded")
        
        # Import the comic crew
        from comic_crew import comic_crew
        print("✅ Comic crew imported successfully")
        
        # Test crew info
        print("\n📋 Crew Information:")
        crew_info = comic_crew.get_crew_info()
        for agent in crew_info["agents"]:
            print(f"  - {agent['role']}: {agent['purpose']}")
        
        # Test comic generation with a simple topic
        test_topic = "Cherry Blossoms in Japan"
        print(f"\n🎨 Testing comic generation for topic: '{test_topic}'")
        print("⏱️  This may take a few minutes...")
        
        # Generate the comic
        result = comic_crew.create_comic(test_topic)
        
        print("\n📊 Results:")
        print(f"Success: {result['success']}")
        print(f"Topic: {result['topic']}")
        
        if result['success']:
            print("✅ Comic generation completed successfully!")
            
            # Save the result to a file for inspection
            output_file = backend_dir / "test_result.json"
            with open(output_file, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"📄 Full result saved to: {output_file}")
            
            # Display a summary
            if result.get('result') and result['result'].get('task_results'):
                task_results = result['result']['task_results']
                print("\n📝 Task Results Summary:")
                for task_name, task_result in task_results.items():
                    if task_result:
                        preview = str(task_result)[:200] + "..." if len(str(task_result)) > 200 else str(task_result)
                        print(f"  {task_name.title()}: {preview}")
        else:
            print(f"❌ Comic generation failed: {result.get('error', 'Unknown error')}")
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("📦 Please ensure all dependencies are installed: pip install -r requirements.txt")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

def test_config():
    """Test configuration"""
    print("🔧 Testing Configuration")
    print("-" * 30)
    
    try:
        from config import Config
        Config.validate_config()
        print("✅ Configuration is valid")
        
        # Display config (without sensitive data)
        print(f"Watson URL: {Config.IBM_WATSONX_URL}")
        print(f"Project ID: {Config.IBM_PROJECT_ID}")
        print(f"IBM API Key: {'*' * (len(Config.IBM_API_KEY) - 4) + Config.IBM_API_KEY[-4:] if Config.IBM_API_KEY else 'Not set'}")
        print(f"EXA API Key: {'*' * (len(Config.EXA_API_KEY) - 4) + Config.EXA_API_KEY[-4:] if Config.EXA_API_KEY else 'Not set'}")
        
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False
    
    return True

async def main():
    """Main test function"""
    print("🎭 Cultural Comics Backend Test Suite")
    print("=" * 50)
    
    # Test configuration first
    if not test_config():
        print("❌ Configuration test failed. Please check your .env.local file.")
        return
    
    print("\n")
    
    # Test comic generation
    await test_comic_generation()
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")

if __name__ == "__main__":
    asyncio.run(main()) 