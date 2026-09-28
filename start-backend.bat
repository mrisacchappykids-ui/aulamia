@echo off
echo Iniciando Backend FastAPI de AulaMIA en http://localhost:8000 ...
cd /d "%~dp0backend"
call .venv\Scripts\activate.bat
python run.py
pause
