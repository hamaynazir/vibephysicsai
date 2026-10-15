@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js or use Python as described in README.md.
  pause
  exit /b 1
)
start "" "http://localhost:4173"
node tools/serve.mjs
pause
