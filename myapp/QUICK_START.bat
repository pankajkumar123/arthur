@echo off
REM Quick Start Script for E-Commerce Purchase Testing
REM This script sets up everything needed for the real-time purchase flow

echo.
echo ====================================================
echo   Sai Scientifics E-Commerce Quick Start
echo ====================================================
echo.

REM Check if running from correct directory
if not exist "myapp" (
    echo ERROR: Run this script from the root directory (where myapp\ folder exists)
    pause
    exit /b 1
)

echo [1/5] Checking database connection...
@REM Try to connect to PostgreSQL
psql.exe -U postgres -c "SELECT 1;" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo ⚠️  PostgreSQL not running or not in PATH
    echo ℹ️  Please ensure PostgreSQL is installed and running
    echo ℹ️  Or add PostgreSQL to system PATH
    echo.
    echo Continuing anyway - you may need to run setup manually
    echo.
) else (
    echo ✓ PostgreSQL connection OK
)

echo.
echo [2/5] Starting backend server...
start cmd /k "cd myapp\server && npm start"
timeout /t 5 /nobreak

echo.
echo [3/5] Starting frontend server...
start cmd /k "cd myapp && npm run dev"
timeout /t 5 /nobreak

echo.
echo [4/5] Opening application...
timeout /t 2 /nobreak
start http://localhost:5173/

echo.
echo [5/5] Setup Complete!
echo.
echo ====================================================
echo   Next Steps:
echo ====================================================
echo.
echo 1. Wait for both servers to start (watch command windows)
echo.
echo 2. Run database setup (open another terminal):
echo    cd myapp/database
echo    psql -U postgres -d myapp -f setup_test_data.sql
echo.
echo 3. Or use DBeaver/pgAdmin to run: setup_test_data.sql
echo.
echo 4. Once database ready, go to:
echo    http://localhost:5173/Login.html
echo.
echo 5. Login with:
echo    Email:    umeshcholleti25@gmail.com
echo    Password: Umesh@12345
echo.
echo 6. Follow guide: documentation/REAL_TIME_PURCHASE_GUIDE.md
echo.
echo ====================================================
echo.
echo Note: Command windows will stay open showing logs
echo Close them when you want to stop servers (Ctrl+C)
echo.
pause
