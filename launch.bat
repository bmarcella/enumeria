@echo off
setlocal EnableDelayedExpansion

:: ─────────────────────────────────────────────────────────────────────────────
::  Damba Launcher
::  Usage: launch [command]
::
::  Commands:
::    all      (default) Redis + API + Workers + UI
::    api      API server only
::    workers  BullMQ workers only
::    ui       React UI only
::    redis    Redis container only
::    stop     Stop Redis container
::    help     Show this message
:: ─────────────────────────────────────────────────────────────────────────────

set CMD=%~1
if "%CMD%"=="" set CMD=all

if /i "%CMD%"=="help"    goto :help
if /i "%CMD%"=="stop"    goto :stop
if /i "%CMD%"=="redis"   goto :redis
if /i "%CMD%"=="api"     goto :api
if /i "%CMD%"=="workers" goto :workers
if /i "%CMD%"=="ui"      goto :ui
if /i "%CMD%"=="all"     goto :all

echo [ERROR] Unknown command: %CMD%
goto :help

:: ─────────────────────────────────────────────────────────────────────────────
:all
call :start_redis
call :wait_redis
call :start_api
call :start_workers
call :start_ui
goto :done

:redis
call :start_redis
goto :done

:api
call :start_api
goto :done

:workers
call :start_workers
goto :done

:ui
call :start_ui
goto :done

:stop
echo Stopping Redis container...
docker-compose down
echo Redis stopped.
goto :eof

:help
echo.
echo   Usage: launch [command]
echo.
echo   Commands:
echo     all      (default) Redis + API + Workers + UI
echo     api      API server only
echo     workers  BullMQ workers only
echo     ui       React UI only
echo     redis    Redis container only
echo     stop     Stop Redis container
echo     help     Show this message
echo.
goto :eof

:: ─────────────────────────────────────────────────────────────────────────────
:start_redis
echo [Redis] Starting container...
docker-compose up -d
goto :eof

:wait_redis
echo [Redis] Waiting for Redis to be ready...
:redis_loop
docker-compose exec -T redis redis-cli ping 2>nul | findstr /i "PONG" >nul
if errorlevel 1 (
  timeout /t 1 /nobreak >nul
  goto :redis_loop
)
echo [Redis] Ready.
goto :eof

:start_api
echo [API] Starting...
start "Damba API" cmd /k "cd /d %~dp0api && npm run dev"
goto :eof

:start_workers
echo [Workers] Starting...
start "Damba Workers" cmd /k "cd /d %~dp0workers && npm run workers"
goto :eof

:start_ui
echo [UI] Starting...
start "Damba UI" cmd /k "cd /d %~dp0ui\damba && npm run dev"
goto :eof

:: ─────────────────────────────────────────────────────────────────────────────
:done
echo.
echo ==========================================
echo   Services started. Close windows to stop.
echo   Run "launch stop" to stop Redis.
echo ==========================================
pause
