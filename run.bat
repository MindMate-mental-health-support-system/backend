@echo off
echo =======================================================
echo Starting MindMate Backend Server
echo =======================================================
echo.

echo Checking for existing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    if "%%a" neq "0" (
        echo Port 5000 is in use by PID %%a... Killing it now.
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo Press Ctrl+C to stop the server.
echo.
node server.js
pause
