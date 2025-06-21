@echo off
setlocal

echo [DEBUG] Script starting...
pause

echo [DEBUG] Step 1: Checking for Git...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git command not found. Please install Git and ensure it is in your PATH.
    pause
    exit /b 1
)
echo [OK] Git is installed.
pause

echo [DEBUG] Step 2: Configuring Git...
git config --global user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Git user not configured.
    set /p git_name="Enter your name: "
    set /p git_email="Enter your email: "
    git config --global user.name "%git_name%"
    git config --global user.email "%git_email%"
)
echo [OK] Git is configured.
pause

echo [DEBUG] Step 3: Committing files...
if not exist ".git" (
    git init
)
git add .
git commit -m "Initial commit" >nul 2>&1
echo [OK] Files are committed.
pause

echo [DEBUG] Step 4: Checking for GitHub CLI (gh)...
where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] GitHub CLI (gh) not found.
    echo Please install it from: https://cli.github.com/
    echo Then, restart your terminal and run this script again.
    pause
    exit /b 1
)
echo [OK] GitHub CLI is installed.
pause

echo [DEBUG] Step 5: Authenticating with GitHub...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] GitHub authentication needed. Browser will open.
    gh auth login --web
)
echo [OK] GitHub is authenticated.
pause

echo [DEBUG] Step 6: Creating GitHub repository...
set "repoName=color_block_path_finding"
gh repo view %repoName% >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] GitHub repository already exists.
) else (
    gh repo create %repoName% --public --source=. --push
)
echo [OK] GitHub repository is ready.
pause

echo [DEBUG] --- Script finished successfully! ---
pause
exit /b 0 