@echo off
cd /d "%~dp0"
echo Starting local web server for Morpheus Matrix...
echo.
echo This script attempts to start a local server to bypass browser security restrictions
echo that prevent the Matrix effect from loading directly from a file.
echo.

REM Try Python 3
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Found Python. Starting server...
    start "" "http://localhost:8085/index.html"
    python -m http.server 8085
    pause
    goto :EOF
)

REM Try Node/npx
call npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Found Node.js. Starting http-server...
    start "" "http://localhost:8086/index.html"
    call npx http-server -p 8086
    pause
    goto :EOF
)

echo.
echo [ERROR] Neither Python nor Node.js were found in your PATH.
echo Please install Python (https://www.python.org/) or Node.js (https://nodejs.org/)
echo to run this project locally.
echo.
pause
