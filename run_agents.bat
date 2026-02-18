@echo off
echo Starting KmedTour AI Agents Server...
cd agents
venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
