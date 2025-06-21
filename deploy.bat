@echo off
setlocal

echo [DEBUG] Script starting...
pause

echo [DEBUG] Step 1: Checking for Git...
where git >nul 2>&1
if errorlevel 1 goto git_not_found
echo [OK] Git is installed.
pause
goto step2

:git_not_found
echo [ERROR] Git command not found. Please install Git.
pause
exit /b 1

:step2
echo [DEBUG] Step 2: Configuring Git...
git config --global user.name >nul 2>&1
if not errorlevel 1 goto step3
echo [INFO] Git user not configured. Please enter your details.
set /p git_name="Enter your name: "
set /p git_email="Enter your email: "
git config --global user.name "%git_name%"
git config --global user.email "%git_email%"
pause

:step3
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

:step4
echo [DEBUG] Step 4: Checking for GitHub CLI (gh)...
where gh >nul 2>&1
if errorlevel 1 goto gh_not_found
echo [OK] GitHub CLI is installed.
pause
goto step5

:gh_not_found
echo [ERROR] GitHub CLI (gh) not found. Please install from https://cli.github.com/
pause
exit /b 1

:step5
echo [DEBUG] Step 5: Authenticating with GitHub...
gh auth status >nul 2>&1
if not errorlevel 1 goto step6
echo [INFO] GitHub authentication needed. Browser will open.
gh auth login --web
pause

:step6
echo [DEBUG] Step 6: Setting up GitHub repository...
set "repoName=color_block_path_finding"
gh repo view %repoName% >nul 2>&1
if not errorlevel 1 goto step7
echo [INFO] Creating new GitHub repository...
gh repo create %repoName% --public --source=. --push
goto step7

:step7
echo [OK] GitHub repository is ready.
pause

echo [DEBUG] Step 7: Checking for Vercel CLI...
where vercel >nul 2>&1
if not errorlevel 1 goto vercel_install
echo [OK] Vercel CLI is installed.
pause
goto vercel_deploy

:vercel_install
echo [INFO] Vercel CLI not found. Attempting to install...
npm install -g vercel
if errorlevel 1 goto vercel_fail
echo [OK] Vercel CLI installed. Please RE-RUN this script.
pause
exit /b 0

:vercel_deploy
echo [DEBUG] Step 8: Deploying to Vercel...
echo [INFO] You may be prompted to log in. A browser window may open.
vercel --prod --yes
if errorlevel 1 goto vercel_fail_deploy
echo [OK] Vercel deployment successful!
pause
goto end_summary

:vercel_fail
echo [WARN] Could not install Vercel CLI automatically.
echo You can deploy manually at: https://vercel.com
pause
goto end_summary

:vercel_fail_deploy
echo [WARN] Vercel deployment failed.
echo You can deploy manually by importing your repo at https://vercel.com
pause

:end_summary
echo.
echo [INFO] --- Deployment Process Finished ---
for /f "tokens=*" %%i in ('gh api user --jq .login') do set username=%%i
echo.
echo Deployment Summary
echo ====================
echo GitHub Repository: https://github.com/%username%/%repoName%
echo Vercel Dashboard: https://vercel.com/dashboard
echo.
echo Your game should be live! Check your dashboard for the URL.
pause
exit /b 0 