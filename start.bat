@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ========================================
echo   TeeHidZ - Restart Frontend + Backend
echo ========================================
echo.

echo [1/3] Stopping old Backend (port 8787) and Frontend (port 5173)...
for %%P in (8787 5173) do (
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr ":%%P" ^| findstr "LISTENING"') do (
    echo   Killing PID %%A on port %%P...
    taskkill /PID %%A /F >nul 2>&1
  )
)

timeout /t 1 /nobreak >nul

echo [2/3] Starting Backend on http://localhost:8787 ...
start "TeeHidZ Backend" cmd /k "cd /d "%~dp0" && npm run dev"

echo [3/3] Starting Frontend on http://localhost:5173 ...
start "TeeHidZ Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0"

echo.
echo Done.
echo Backend : http://localhost:8787
echo Frontend: http://localhost:5173
echo.
endlocal
