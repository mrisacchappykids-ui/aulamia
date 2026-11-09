@echo off
echo Iniciando Frontend Next.js de AulaMIA en http://localhost:3000 ...
cd /d "%~dp0frontend"
if exist "C:\Program Files\nodejs" set "PATH=C:\Program Files\nodejs;%PATH%"
where npm.cmd >nul 2>&1
if errorlevel 1 (
    for /d %%D in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\OpenJS.NodeJS*") do (
        for /d %%N in ("%%D\node*") do (
            if exist "%%N\npm.cmd" set "PATH=%%N;%PATH%"
        )
    )
)
call npm.cmd run dev
pause
