#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Starting Zeph Development Environment..."

# Start Backend
echo "Starting Backend Server (Port 3001)..."
cd server
if [ ! -d "node_modules" ]; then
    echo "Installing server dependencies..."
    npm install
fi
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to initialize
sleep 2

# Start Frontend
echo "Starting Frontend (Vite)..."
if [ ! -d "node_modules" ]; then
    echo "Installing client dependencies..."
    npm install
fi
npm run dev

# Wait for backend process to finish (if frontend is stopped)
wait $BACKEND_PID
