@echo off
echo ========================================================
echo           AulaMIA - Asistente Pedagogico IA
echo ========================================================
echo Iniciando Backend (FastAPI :8000) y Frontend (Next.js :3000)...
start "AulaMIA Backend (FastAPI)" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul
start "AulaMIA Frontend (Next.js)" cmd /k "%~dp0start-frontend.bat"
timeout /t 4 /nobreak >nul
start http://localhost:3000
echo.
echo Todo listo:
echo - Frontend: http://localhost:3000
echo - Backend Swagger Docs: http://localhost:8000/docs
echo ========================================================
