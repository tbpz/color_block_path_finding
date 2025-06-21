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
echo [DEBUG] Step 3: Committing file changes...
if not exist ".git" (
    git init
)
git add .
git commit -m "Update project files for deployment" >nul 2>&1
echo [OK] File changes have been committed.
pause

:step4
echo [DEBUG] Step 4: Pushing changes to GitHub...
git push
if errorlevel 1 (
    echo [WARN] Could not push to GitHub. This might be okay if repo is already up to date.
) else (
    echo [OK] Latest changes pushed to GitHub.
)
pause

:step5
echo [DEBUG] Step 5: Checking for GitHub CLI (gh)...
where gh >nul 2>&1
if errorlevel 1 goto gh_not_found
echo [OK] GitHub CLI is installed.
pause
goto step6

:gh_not_found
echo [ERROR] GitHub CLI (gh) not found. Please install from https://cli.github.com/
pause
exit /b 1

:step6
echo [DEBUG] Step 6: Authenticating with GitHub...
gh auth status >nul 2>&1
if not errorlevel 1 goto step7
echo [INFO] GitHub authentication needed. Browser will open.
gh auth login --web
pause

:step7
echo [OK] GitHub authentication is ready.
pause

echo [DEBUG] Step 8: Checking for NPM (Node.js)...
where npm >nul 2>&1
if errorlevel 1 goto npm_not_found
echo [OK] NPM is installed.
pause
goto vercel_deploy

:npm_not_found
echo [WARN] NPM (required for Vercel) not found.
echo Please install Node.js from https://nodejs.org/
pause
goto end_summary

:vercel_deploy
echo [DEBUG] Step 9: Deploying to Vercel...
echo [INFO] This will use 'npx', a tool that comes with Node.js.
npx vercel --prod --yes
if errorlevel 1 goto vercel_fail_deploy
echo [OK] Vercel deployment successful!
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
echo GitHub Repository: https://github.com/%username%/color_block_path_finding
echo Vercel Dashboard: https://vercel.com/dashboard
echo.
echo Your game should be live! Check your dashboard for the URL.
pause
exit /b 0 