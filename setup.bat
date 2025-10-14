@echo off
echo ================================================
echo  MarkSure AOI System Setup Script v2.0
echo  TypeScript Full-Stack Application
echo ================================================
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

:: Install TypeScript globally if not already installed
echo Checking TypeScript installation...
where tsc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing TypeScript globally...
    call npm install -g typescript
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Failed to install TypeScript globally. Will install locally.
    )
)
echo TypeScript check completed.
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
echo Setting up Backend (Node.js with TypeScript)...
cd backend
if not exist ".env" copy ".env.example" ".env"
echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo Compiling TypeScript...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] TypeScript compilation failed. Check for errors and run 'npm run build' manually.
)
cd ..
echo Backend setup completed.
echo.

:: Setup Frontend
echo Setting up Frontend (React with TypeScript)...
cd frontend
if not exist ".env" copy ".env.example" ".env"
echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo Testing React TypeScript build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] React TypeScript build failed. Check for errors and run 'npm run build' manually.
else
    echo React TypeScript build successful!
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

echo ================================================
echo  MarkSure AOI TypeScript Setup Complete! 🎉
echo ================================================
echo.
echo Your TypeScript full-stack application is ready!
echo.
echo Next steps:
echo 1. Configure your .env files:
echo    - backend/.env (database, JWT secret, etc.)
echo    - frontend/.env (API URLs, feature flags)
echo    - ai-service/.env (OCR settings, models)
echo.
echo 2. Start MongoDB (local or use MongoDB Atlas)
echo.
echo 3. Run the services:
echo    Backend:     cd backend && npm run dev
echo    Frontend:    cd frontend && npm start  
echo    AI Service:  cd ai-service && venv\Scripts\activate && python main.py
echo.
echo 4. Access the application:
echo    Frontend:    http://localhost:3000
echo    Backend API: http://localhost:5001
echo    AI Service:  http://localhost:8000
echo.
echo Features included:
echo ✓ TypeScript backend with Express.js
echo ✓ React TypeScript frontend with Material-UI
echo ✓ Authentication system with JWT
echo ✓ Professional UI/UX design
echo ✓ AI-powered IC inspection
echo ✓ Real-time processing and analytics
echo.
echo Happy coding! 🚀
echo.
pause