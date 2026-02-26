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

echo "Starting Z.CORE Development Environment..."

# Start Oracle API Gateway
echo "Starting Oracle API Gateway (Port 3000)..."
cd oracle-api
if [ ! -d "node_modules" ]; then
    echo "Installing oracle-api dependencies..."
    npm install
fi
npm run dev &
ORACLE_PID=$!
cd ..

# Wait a bit for gateway to initialize
sleep 2

# Start Frontend
echo "Starting Frontend (Vite)..."
if [ ! -d "node_modules" ]; then
    echo "Installing client dependencies..."
    npm install
fi
npm run dev

# Wait for process to finish
wait $ORACLE_PID
