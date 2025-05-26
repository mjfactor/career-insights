#!/bin/bash

# Career Compass ML API Startup Script

echo "🚀 Starting Career Compass ML API..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip and try again."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Check if model file exists
if [ ! -f "rf.pkl" ]; then
    echo "⚠️  Warning: rf.pkl model file not found in current directory!"
    echo "   Please ensure your trained model file is present before making predictions."
fi

# Start the API server
echo "🔥 Starting FastAPI server..."
echo "📍 API will be available at: http://localhost:8000"
echo "📚 API documentation: http://localhost:8000/docs"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

python main.py
