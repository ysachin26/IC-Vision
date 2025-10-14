@echo off
echo ====================================
echo  MarkSure AOI System Setup Script
echo ====================================
echo.

echo Checking prerequisites...
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed. Please install Python 3.10+ from https://python.org/
    pause
    exit /b 1
)

:: Check MongoDB (optional)
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MongoDB is not installed locally. You can use MongoDB Atlas or install locally.
)

echo Prerequisites check completed.
echo.

:: Create necessary directories
echo Creating project directories...
if not exist "backend\src" mkdir backend\src
if not exist "backend\src\controllers" mkdir backend\src\controllers
if not exist "backend\src\models" mkdir backend\src\models
if not exist "backend\src\routes" mkdir backend\src\routes
if not exist "backend\src\middleware" mkdir backend\src\middleware
if not exist "backend\src\services" mkdir backend\src\services
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\logs" mkdir backend\logs

if not exist "frontend\src" mkdir frontend\src
if not exist "frontend\src\components" mkdir frontend\src\components
if not exist "frontend\src\pages" mkdir frontend\src\pages
if not exist "frontend\src\services" mkdir frontend\src\services
if not exist "frontend\src\utils" mkdir frontend\src\utils
if not exist "frontend\public" mkdir frontend\public

if not exist "ai-service\src" mkdir ai-service\src
if not exist "ai-service\src\ocr" mkdir ai-service\src\ocr
if not exist "ai-service\src\preprocessing" mkdir ai-service\src\preprocessing
if not exist "ai-service\src\comparison" mkdir ai-service\src\comparison
if not exist "ai-service\src\models" mkdir ai-service\src\models
if not exist "ai-service\temp" mkdir ai-service\temp
if not exist "ai-service\logs" mkdir ai-service\logs

echo Directories created successfully.
echo.

:: Setup Backend
echo Setting up Backend (Node.js)...
cd backend
if not exist ".env" copy ".env.example" ".env"
echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..
echo Backend setup completed.
echo.

:: Setup Frontend
echo Setting up Frontend (React)...
cd frontend
echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..
echo Frontend setup completed.
echo.

:: Setup AI Service
echo Setting up AI Service (Python)...
cd ai-service
if not exist ".env" copy ".env.example" ".env"

echo Creating Python virtual environment...
python -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create Python virtual environment
    pause
    exit /b 1
)

echo Activating virtual environment and installing dependencies...
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)
cd ..
echo AI Service setup completed.
echo.

echo ====================================
echo  Setup Complete! 🎉
echo ====================================
echo.
echo Next steps:
echo 1. Configure your .env files in backend/ and ai-service/
echo 2. Start MongoDB (local or use MongoDB Atlas)
echo 3. Run the services:
echo.
echo    Backend:     cd backend && npm run dev
echo    Frontend:    cd frontend && npm start
echo    AI Service:  cd ai-service && venv\Scripts\activate && python main.py
echo.
echo Or use Docker: docker-compose up
echo.
echo Happy coding! 🚀
echo.
pause