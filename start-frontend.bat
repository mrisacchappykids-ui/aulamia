@echo off
echo Iniciando Frontend Next.js de AulaMIA en http://localhost:3000 ...
cd /d "%~dp0frontend"
set "PATH=C:\Program Files\nodejs;%PATH%"
call npm.cmd run dev
pause
