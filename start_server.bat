@echo off
REM Start the MindMate Backend Server
cd /d "%~dp0"
echo Starting MindMate Backend Server...
node server.js
pause
