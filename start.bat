@echo off
TITLE HexaStudy - Windows 11 Academic Assessor
echo ========================================================
echo   HexaStudy: Local-First Academic Proficiency Assessor
echo   Windows 11 Workstation & CSE Study Suite
echo ========================================================
echo.

WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found. Please install Node LTS from https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Checking dependencies...
IF NOT EXIST "node_modules" (
    echo Installing local dependencies...
    call npm install
)

echo [2/3] Starting HexaStudy local workstation on port 3000...
start "" http://localhost:3000
call npm run dev
