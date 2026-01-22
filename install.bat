@echo off
echo Installing Macro Monitor dependencies...
cd /d "%~dp0"
call npm install
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Installation complete!
    echo You can now run start-macro-monitor.bat to launch the app.
    pause
) else (
    echo.
    echo Installation failed. Please make sure Node.js is installed.
    pause
)
