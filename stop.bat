@echo off
TITLE Stop HexaStudy
echo Stopping HexaStudy local instance on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /f /pid %%a >nul 2>nul
)
echo HexaStudy stopped successfully.
pause
