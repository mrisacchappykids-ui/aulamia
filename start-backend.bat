@echo off
echo Iniciando Backend FastAPI de AulaMIA en http://localhost:8000 ...
cd /d "%~dp0backend"
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    python run.py
) else (
    echo Error: Entorno virtual .venv no encontrado en la carpeta backend.
)
pause
