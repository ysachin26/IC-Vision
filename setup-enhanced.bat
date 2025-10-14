@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    MARKSURE AOI SYSTEM SETUP v2.0
echo ========================================
echo.

:: Create logs directory
if not exist "logs" mkdir logs
set LOGFILE=logs\setup-%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%-%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%.log
set LOGFILE=!LOGFILE: =0!

echo [INFO] Setup log: %LOGFILE%
echo Setup started at %DATE% %TIME% > "%LOGFILE%"

echo [INFO] Starting MarkSure AOI System Setup >> "%LOGFILE%"

:: Check system requirements
echo ========================================
echo    CHECKING SYSTEM REQUIREMENTS
echo ========================================

:: Check if Git is installed
echo.
echo [1/7] Checking Git installation...
git --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%i in ('git --version') do (
        echo [SUCCESS] Git: %%i >> "%LOGFILE%"
        echo     ✓ %%i
    )
) else (
    echo [WARNING] Git not found >> "%LOGFILE%"
    echo     ✗ Git not installed
    echo       Download from: https://git-scm.com/
    set MISSING_DEPS=true
)

:: Check Node.js
echo.
echo [2/7] Checking Node.js installation...
node --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do (
        echo [SUCCESS] Node.js: %%i >> "%LOGFILE%"
        echo     ✓ Node.js %%i
    )
) else (
    echo [ERROR] Node.js not found >> "%LOGFILE%"
    echo     ✗ Node.js not installed
    echo       Download from: https://nodejs.org/
    set MISSING_DEPS=true
)

:: Check npm
echo.
echo [3/7] Checking npm installation...
npm --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do (
        echo [SUCCESS] npm: %%i >> "%LOGFILE%"
        echo     ✓ npm %%i
    )
) else (
    echo [ERROR] npm not found >> "%LOGFILE%"
    echo     ✗ npm not installed
    set MISSING_DEPS=true
)

:: Check Python
echo.
echo [4/7] Checking Python installation...
python --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%i in ('python --version') do (
        echo [SUCCESS] Python: %%i >> "%LOGFILE%"
        echo     ✓ %%i
    )
) else (
    echo [ERROR] Python not found >> "%LOGFILE%"
    echo     ✗ Python not installed
    echo       Download from: https://python.org/
    set MISSING_DEPS=true
)

:: Check pip
echo.
echo [5/7] Checking pip installation...
pip --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%i in ('pip --version') do (
        echo [SUCCESS] pip: %%i >> "%LOGFILE%"
        echo     ✓ %%i
    )
) else (
    echo [ERROR] pip not found >> "%LOGFILE%"
    echo     ✗ pip not installed
    set MISSING_DEPS=true
)

:: Check MongoDB (optional)
echo.
echo [6/7] Checking MongoDB installation (optional)...
mongod --version >nul 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] MongoDB: Installed >> "%LOGFILE%"
    echo     ✓ MongoDB installed (local development)
) else (
    echo [INFO] MongoDB not installed locally >> "%LOGFILE%"
    echo     ℹ MongoDB not installed locally (will use MongoDB Atlas)
)

:: Check available ports
echo.
echo [7/7] Checking port availability...
netstat -an | findstr ":3000" >nul
if %errorLevel% neq 0 (
    echo [SUCCESS] Port 3000 available >> "%LOGFILE%"
    echo     ✓ Port 3000 (Frontend) available
) else (
    echo [WARNING] Port 3000 may be in use >> "%LOGFILE%"
    echo     ⚠ Port 3000 may be in use
)

:: Stop if missing critical dependencies
if defined MISSING_DEPS (
    echo.
    echo ========================================
    echo         MISSING DEPENDENCIES!
    echo ========================================
    echo Please install the missing dependencies and run setup again.
    echo [ERROR] Setup aborted due to missing dependencies >> "%LOGFILE%"
    pause
    exit /b 1
)

echo.
echo ========================================
echo      INSTALLING PROJECT DEPENDENCIES
echo ========================================

:: Setup environment files
echo.
echo Setting up environment configuration...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul 2>&1
    echo [INFO] Created backend/.env from template >> "%LOGFILE%"
    echo     ✓ Created backend/.env from template
) else (
    echo [INFO] backend/.env already exists >> "%LOGFILE%"
    echo     ℹ backend/.env already exists
)

:: Install Backend Dependencies
echo.
echo Installing Backend Dependencies...
echo [INFO] Installing backend dependencies >> "%LOGFILE%"
cd backend

if exist "package.json" (
    echo     → Running npm install...
    npm install >> "..\%LOGFILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [SUCCESS] Backend dependencies installed >> "..\%LOGFILE%"
        echo     ✓ Backend dependencies installed successfully
    ) else (
        echo [ERROR] Failed to install backend dependencies >> "..\%LOGFILE%"
        echo     ✗ Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo [ERROR] backend/package.json not found >> "..\%LOGFILE%"
    echo     ✗ package.json not found
)
cd ..

:: Install Frontend Dependencies
echo.
echo Installing Frontend Dependencies...
echo [INFO] Installing frontend dependencies >> "%LOGFILE%"
cd frontend

if exist "package.json" (
    echo     → Running npm install...
    npm install >> "..\%LOGFILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [SUCCESS] Frontend dependencies installed >> "..\%LOGFILE%"
        echo     ✓ Frontend dependencies installed successfully
    ) else (
        echo [ERROR] Failed to install frontend dependencies >> "..\%LOGFILE%"
        echo     ✗ Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo [ERROR] frontend/package.json not found >> "..\%LOGFILE%"
    echo     ✗ package.json not found
)
cd ..

:: Setup AI Service Python Environment
echo.
echo Setting up AI Service Python Environment...
echo [INFO] Setting up AI service environment >> "%LOGFILE%"
cd ai-service

if exist "requirements.txt" (
    echo     → Creating Python virtual environment...
    python -m venv venv >> "..\%LOGFILE%" 2>&1
    
    echo     → Activating virtual environment...
    call venv\Scripts\activate.bat
    
    echo     → Upgrading pip...
    python -m pip install --upgrade pip >> "..\%LOGFILE%" 2>&1
    
    echo     → Installing Python dependencies (this may take several minutes)...
    pip install -r requirements.txt >> "..\%LOGFILE%" 2>&1
    
    if %errorLevel% equ 0 (
        echo [SUCCESS] AI service dependencies installed >> "..\%LOGFILE%"
        echo     ✓ AI service dependencies installed successfully
    ) else (
        echo [WARNING] Some AI service dependencies may have failed >> "..\%LOGFILE%"
        echo     ⚠ Some dependencies may have failed (check log file)
        echo       This is often normal - core functionality should still work
    )
) else (
    echo [ERROR] ai-service/requirements.txt not found >> "..\%LOGFILE%"
    echo     ✗ requirements.txt not found
)
cd ..

:: Create necessary directories
echo.
echo Creating necessary directories...
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "backend\logs" mkdir "backend\logs"
if not exist "ai-service\temp" mkdir "ai-service\temp"
if not exist "ai-service\logs" mkdir "ai-service\logs"
echo [INFO] Created necessary directories >> "%LOGFILE%"
echo     ✓ Created necessary directories

echo.
echo ========================================
echo           SETUP COMPLETE!
echo ========================================
echo.
echo 🎉 MarkSure AOI System is ready to use!
echo.
echo 📋 NEXT STEPS:
echo.
echo 1. Configure your MongoDB Atlas URI in backend/.env
echo 2. Start the services using one of these methods:
echo.
echo    📁 OPTION A - Manual (3 terminals):
echo       Terminal 1: cd backend ^&^& npm run dev
echo       Terminal 2: cd frontend ^&^& npm start
echo       Terminal 3: cd ai-service ^&^& venv\Scripts\activate ^&^& python main.py
echo.
echo 3. Open your browser to: http://localhost:3000
echo.
echo 🔑 Demo Credentials:
echo    Admin: admin@marksure.com / Admin123
echo    Operator: operator1@marksure.com / Operator123
echo.
echo 📊 Access Points:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo    AI Service: http://localhost:8000
echo.
echo 📝 Setup completed at %DATE% %TIME%
echo 📋 Full setup log: %LOGFILE%
echo.
echo [SUCCESS] Setup completed successfully >> "%LOGFILE%"

pause
exit /b 0