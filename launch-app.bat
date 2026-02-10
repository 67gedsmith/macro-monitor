@echo off
cd /d "%~dp0"
echo Starting Macro Monitor...
node node_modules\electron\cli.js .
pause
