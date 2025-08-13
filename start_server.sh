#!/bin/bash

# Start the Enhanced Explore API Server
# This script starts the backend server with proper environment setup

echo "🚀 Starting Enhanced Explore API Server..."
echo "📍 Location: $(pwd)"

# Kill any existing servers
echo "🔪 Killing existing servers..."
pkill -f "uvicorn.*main:app" 2>/dev/null || true
pkill -f "python.*main.py" 2>/dev/null || true
sleep 2

# Activate virtual environment
echo "🐍 Activating virtual environment..."
source /Users/yashwanthkrishna/Desktop/Projects/ibm/backend/myenv/bin/activate

# Navigate to explore directory
cd /Users/yashwanthkrishna/Desktop/Projects/ibm/backend/explore

# Check if .env file exists
if [ ! -f "../.env" ]; then
    echo "⚠️  Warning: .env file not found in backend directory"
    echo "   Make sure you have IBM_API_KEY, EXA_API_KEY, etc. configured"
fi

# Start the server
echo "🌟 Starting server on http://localhost:8002"
echo "📝 Logs will appear below..."
echo "🔄 Press Ctrl+C to stop the server"
echo "----------------------------------------"

uvicorn main:app --host 0.0.0.0 --port 8002 --reload --log-level info