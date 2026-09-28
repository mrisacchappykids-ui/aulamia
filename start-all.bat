@echo off
echo ========================================================
echo           AulaMIA - Asistente Pedagógico IA
echo ========================================================
echo Iniciando Backend (FastAPI :8000) y Frontend (Next.js :3000)...
start "AulaMIA Backend (FastAPI)" cmd /c "%~dp0start-backend.bat"
timeout /t 2 /nobreak >nul
start "AulaMIA Frontend (Next.js)" cmd /c "%~dp0start-frontend.bat"
echo.
echo Todo listo:
echo - Frontend: http://localhost:3000
echo - Backend Swagger Docs: http://localhost:8000/docs
echo ========================================================
