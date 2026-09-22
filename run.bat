@echo off
echo ========================================================
echo        Starting Honey Juice Shop Platform
echo ========================================================
echo [1/3] Installing all dependencies across root, client, and server...
call npm run install:all
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Dependency installation failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Building application assets...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Launching development environment...
call npm run dev
pause
