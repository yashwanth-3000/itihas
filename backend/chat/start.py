#!/usr/bin/env python3
"""
Start script for the Chat API server
"""

import os
import sys
import uvicorn
import logging
from datetime import datetime

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_environment():
    """Check if required environment variables are set"""
    from config import ChatConfig
    
    print("🔍 Checking environment configuration...")
    
    try:
        ChatConfig.validate_config()
        print("✅ Environment configuration valid")
        return True
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("\n📝 Please ensure the following environment variables are set:")
        print("   - IBM_API_KEY")
        print("   - IBM_WATSONX_URL")
        print("   - IBM_PROJECT_ID") 
        print("   - EXA_API_KEY")
        print("   - OPENAI_API_KEY")
        print("\n💡 You can set these in a .env file in the backend directory")
        return False

def test_basic_functionality():
    """Test basic functionality before starting server"""
    print("\n🧪 Testing basic functionality...")
    
    try:
        from chat_crew import chat_crew
        print("✅ Chat crew initialized successfully")
        
        # Quick test
        info = chat_crew.get_crew_info()
        print(f"✅ Found {len(info['agents'])} agents ready")
        
        return True
        
    except Exception as e:
        print(f"❌ Functionality test failed: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    print("\n🚀 Starting Chat API server...")
    
    from config import ChatConfig
    
    print(f"   Host: {ChatConfig.HOST}")
    print(f"   Port: {ChatConfig.PORT}")
    print(f"   Debug: {ChatConfig.DEBUG}")
    print("\n📡 Server endpoints:")
    print(f"   Main API: http://{ChatConfig.HOST}:{ChatConfig.PORT}")
    print(f"   Chat: http://{ChatConfig.HOST}:{ChatConfig.PORT}/chat")
    print(f"   Health: http://{ChatConfig.HOST}:{ChatConfig.PORT}/health")
    print(f"   Docs: http://{ChatConfig.HOST}:{ChatConfig.PORT}/docs")
    
    print("\n" + "="*50)
    print("Chat API Server Starting...")
    print("="*50)
    
    try:
        uvicorn.run(
            "main:app",
            host=ChatConfig.HOST,
            port=ChatConfig.PORT,
            reload=ChatConfig.DEBUG,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")

def main():
    """Main startup routine"""
    print("🤖 Chat API Startup")
    print("=" * 30)
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Check environment
    if not check_environment():
        print("\n❌ Environment check failed. Cannot start server.")
        return False
    
    # Test functionality
    if not test_basic_functionality():
        print("\n❌ Functionality test failed. Cannot start server.")
        return False
    
    # Start server
    start_server()
    return True

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logger.error(f"Startup error: {e}")
        sys.exit(1) 