#!/bin/bash
echo "========================================================="
echo "   S-AI Chat / ChatGPT PC App Launcher"
echo "========================================================="
echo ""

if [ ! -d "node_modules" ]; then
    echo "[1/2] Installing dependencies..."
    npm install
    echo ""
fi

echo "[2/2] Starting S-AI Chat server..."
echo "Access in browser at: http://localhost:3000"
echo ""
npm run dev
