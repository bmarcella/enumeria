@echo off
echo ==========================================
echo   Damba App Launcher
echo ==========================================

echo Starting Redis via Docker...
docker-compose up -d

echo.
echo Starting API...
start "Damba API" cmd /k "cd api && npm run dev"

echo.
echo Starting Workers...
start "Damba Workers" cmd /k "cd workers && npm run workers"

echo.
echo Starting UI...
start "Damba UI" cmd /k "cd ui\damba && npm run dev"

echo.
echo ==========================================
echo   All services are starting!
echo   Close the separate windows to stop.
echo ==========================================
pause
