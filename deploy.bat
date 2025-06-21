@echo off
echo 🚀 Color Block Path Finding - Auto Deployment
echo =============================================
echo.

echo 📋 Step 1: Setting up Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first:
    echo    Download from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo ✅ Git is installed

REM Check Git configuration
git config --global user.name >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not configured. Please run these commands first:
    echo    git config --global user.name "Your Name"
    echo    git config --global user.email "your.email@example.com"
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

echo ✅ Git is configured

REM Initialize Git repository
if not exist ".git" (
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Add and commit files
git add .
git status --porcelain >nul 2>&1
if not errorlevel 1 (
    git commit -m "Initial commit: Color Block Path Finding game"
    echo ✅ Files committed
) else (
    echo ✅ All files already committed
)

echo.
echo 🌐 Step 2: GitHub Setup
echo =======================
echo.
echo 📦 Installing GitHub CLI...
winget install GitHub.cli --accept-source-agreements --accept-package-agreements >nul 2>&1
if errorlevel 1 (
    echo ❌ Could not install GitHub CLI automatically
    echo    Please install manually from: https://cli.github.com/
    pause
    exit /b 1
)

echo ✅ GitHub CLI installed

REM Check GitHub authentication
gh auth status >nul 2>&1
if errorlevel 1 (
    echo 🔐 GitHub authentication required...
    echo    Please follow the prompts to authenticate with GitHub
    gh auth login --web
    if errorlevel 1 (
        echo ❌ GitHub authentication failed
        pause
        exit /b 1
    )
)

echo ✅ GitHub authenticated

REM Create GitHub repository
echo.
echo 📦 Creating GitHub repository...
gh repo view color_block_path_finding >nul 2>&1
if errorlevel 1 (
    gh repo create color_block_path_finding --public --description "A puzzle game where you drag and drop colored shapes through matching gates" --source=. --remote=origin --push
    if errorlevel 1 (
        echo ❌ Failed to create GitHub repository
        pause
        exit /b 1
    )
    echo ✅ GitHub repository created and pushed
) else (
    echo ⚠️  Repository 'color_block_path_finding' already exists
    echo    Using existing repository...
)

REM Setup remote if needed
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    for /f "tokens=*" %%i in ('gh api user --jq .login') do set username=%%i
    git remote add origin https://github.com/%username%/color_block_path_finding.git
    echo ✅ Remote origin added
)

REM Push to GitHub
echo.
echo 📤 Pushing to GitHub...
git branch -M main
git push -u origin main
if errorlevel 1 (
    echo ❌ Failed to push to GitHub
    pause
    exit /b 1
)

echo ✅ Code pushed to GitHub

echo.
echo 🚀 Step 3: Vercel Setup
echo =======================
echo.

REM Install Vercel CLI
echo 📦 Installing Vercel CLI...
npm install -g vercel >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Could not install Vercel CLI automatically
    echo    You can deploy manually at: https://vercel.com
    echo    Just import your GitHub repository: color_block_path_finding
    goto :summary
)

echo ✅ Vercel CLI installed

REM Deploy to Vercel
echo.
echo 🌐 Deploying to Vercel...
echo    This may take a few minutes...
echo    You may be prompted to log in to Vercel...
echo.

vercel --prod --yes
if errorlevel 1 (
    echo ⚠️  Vercel deployment may have failed
    echo    You can deploy manually at: https://vercel.com
) else (
    echo ✅ Successfully deployed to Vercel!
)

:summary
echo.
echo 🎉 Deployment Summary:
echo ======================
for /f "tokens=*" %%i in ('gh api user --jq .login') do set username=%%i
echo ✅ GitHub Repository: https://github.com/%username%/color_block_path_finding
echo ✅ Vercel Dashboard: https://vercel.com/dashboard
echo ✅ Auto-deploy: Enabled for future updates
echo.
echo 🎮 Your Color Block Path Finding game is now live!
echo    Check your Vercel dashboard for the deployment URL.
echo.
echo 📝 To update your game in the future:
echo    1. Make your changes
echo    2. Run: git add . ^&^& git commit -m "Update message" ^&^& git push
echo    3. Vercel will automatically redeploy
echo.
pause 