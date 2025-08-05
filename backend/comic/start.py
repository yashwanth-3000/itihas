#!/usr/bin/env python3
"""
Startup script for the Cultural Comics Backend
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is sufficient"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version.split()[0]} detected")

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import fastapi
        import crewai
        import uvicorn
        print("✅ Core dependencies found")
        return True
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("📦 Please run: pip install -r requirements.txt")
        return False

def check_environment():
    """Check if required environment variables are set"""
    required_vars = [
        "IBM_API_KEY",
        "IBM_WATSONX_URL", 
        "IBM_PROJECT_ID",
        "EXA_API_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("🔧 Please check your .env.local file")
        return False
    
    print("✅ Environment variables configured")
    return True

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting Cultural Comics Backend...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🛑 Press Ctrl+C to stop the server\n")
    
    try:
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    """Main startup function"""
    print("🎨 Cultural Comics Backend Startup")
    print("=" * 40)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    print(f"📁 Working directory: {backend_dir}")
    
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv("../.env.local")  # Load from parent directory
        print("✅ Environment variables loaded")
    except ImportError:
        print("⚠️  python-dotenv not found, environment variables may not be loaded")
    except Exception as e:
        print(f"⚠️  Could not load .env.local: {e}")
    
    # Perform checks
    check_python_version()
    
    if not check_dependencies():
        sys.exit(1)
    
    if not check_environment():
        sys.exit(1)
    
    print("\n🎯 All checks passed! Starting server...")
    print("-" * 40)
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main() 