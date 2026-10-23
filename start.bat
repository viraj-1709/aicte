@echo off
echo =========================================================================
echo   AICTE Application Validation Platform (Smart India Hackathon 2026)
echo   Team: CrashCoders
echo =========================================================================
echo.
echo Product Principle: DECISION SUPPORT, NOT A DECISION MAKER.
echo.

echo [1/3] Generating Synthetic Applications & Documents...
cd /d "%~dp0backend"
python -m app.data.dataset_generator

echo.
echo [2/3] Launching FastAPI Backend Server on port 8000...
start "AICTE Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo.
echo [3/3] Launching Vite React Frontend on port 5173...
start "AICTE Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =========================================================================
echo Platform services launched!
echo - Frontend:  http://localhost:5173
echo - Backend:   http://localhost:8000
echo - API Docs:  http://localhost:8000/docs
echo =========================================================================
echo Press any key to exit this launcher window...
pause >nul
