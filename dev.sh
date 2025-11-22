#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
}
trap cleanup EXIT

echo "🦕 Dino Bingo Dev Launcher"

# Backend
echo "🔧 Checking Backend..."
if [ ! -d "dino-api/.venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv dino-api/.venv
fi

echo "Installing backend dependencies..."
source dino-api/.venv/bin/activate
pip install -r dino-api/requirements.txt > /dev/null

# Frontend
echo "🎨 Checking Frontend..."
if [ ! -d "dino-web/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd dino-web && npm install && cd ..
fi

# Start
echo "🚀 Starting API (http://localhost:8000)..."
# Run uvicorn from the venv, pointing to the app module
./dino-api/.venv/bin/uvicorn app.main:app --reload --app-dir dino-api --port 8000 &

echo "🚀 Starting Web (http://localhost:5173)..."
cd dino-web && npm run dev &

# Wait for user to stop
wait
