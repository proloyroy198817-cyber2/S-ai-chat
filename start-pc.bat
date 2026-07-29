@echo off
echo =========================================================
echo    S-AI Chat / ChatGPT PC App Launcher
echo =========================================================
echo.

if not exist node_modules (
    echo [1/2] Installing dependencies...
    call npm install
    echo.
)

echo [2/2] Starting S-AI Chat server...
echo Access in browser at: http://localhost:3000
echo.
call npm run dev
pause
