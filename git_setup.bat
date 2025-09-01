@echo off
echo Setting up Git repository...

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Git is not installed or not in PATH. Please install Git and try again.
    exit /b 1
)

REM Initialize Git repository if not already initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
) else (
    echo Git repository already initialized.
)

REM Add all files to Git
echo Adding files to Git...
git add .

REM Commit changes
echo Committing changes...
git commit -m "Initial commit with Tiptap editor implementation"

REM Add remote repository
echo Adding remote repository...
git remote add origin https://github.com/Jaikarans2003/TuneTalez.git

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin master

echo Done!
pause