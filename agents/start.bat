@echo off
echo ========================================
echo KmedTour AI Agents - Starting Server
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo.

REM Install dependencies if needed
echo Checking dependencies...
pip install -q -r requirements.txt
echo.

REM Start FastAPI server
echo Starting FastAPI server...
echo Server will run at: http://localhost:8000
echo API docs at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python -m app.main

pause
