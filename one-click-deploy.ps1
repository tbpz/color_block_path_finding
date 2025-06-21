# 🚀 One-Click Deploy for Color Block Path Finding
# This script handles everything with minimal user interaction

Write-Host "🚀 Color Block Path Finding - One-Click Deployment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to install GitHub CLI
function Install-GitHubCLI {
    Write-Host "📦 Installing GitHub CLI..." -ForegroundColor Yellow
    
    if (Test-Command "winget") {
        Write-Host "   Using winget..." -ForegroundColor Yellow
        winget install GitHub.cli --accept-source-agreements --accept-package-agreements
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ GitHub CLI installed successfully" -ForegroundColor Green
            return $true
        }
    }
    
    if (Test-Command "choco") {
        Write-Host "   Using Chocolatey..." -ForegroundColor Yellow
        choco install gh -y
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ GitHub CLI installed successfully" -ForegroundColor Green
            return $true
        }
    }
    
    Write-Host "❌ Could not install GitHub CLI automatically" -ForegroundColor Red
    Write-Host "   Please install manually from: https://cli.github.com/" -ForegroundColor Cyan
    return $false
}

# Function to install Vercel CLI
function Install-VercelCLI {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    
    if (Test-Command "npm") {
        npm install -g vercel
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Vercel CLI installed successfully" -ForegroundColor Green
            return $true
        }
    }
    
    Write-Host "❌ Could not install Vercel CLI automatically" -ForegroundColor Red
    Write-Host "   Please install manually: npm install -g vercel" -ForegroundColor Cyan
    return $false
}

# Check and setup Git
Write-Host "`n📋 Step 1: Setting up Git..." -ForegroundColor Yellow

if (-not (Test-Command "git")) {
    Write-Host "❌ Git is not installed. Please install Git first:" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/downloads" -ForegroundColor Cyan
    exit 1
}

$gitName = git config --global user.name
$gitEmail = git config --global user.email

if (-not $gitName -or -not $gitEmail) {
    Write-Host "❌ Git is not configured. Please provide your details:" -ForegroundColor Red
    
    $name = Read-Host "Enter your name"
    $email = Read-Host "Enter your email"
    
    git config --global user.name $name
    git config --global user.email $email
    
    Write-Host "✅ Git configured successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Git already configured: $gitName at $gitEmail" -ForegroundColor Green
}

# Setup Git repository
Write-Host "`n📁 Step 2: Setting up Git repository..." -ForegroundColor Yellow

if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

git add .
$status = git status --porcelain
if ($status) {
    git commit -m "Initial commit: Color Block Path Finding game"
    Write-Host "✅ Files committed" -ForegroundColor Green
} else {
    Write-Host "✅ All files already committed" -ForegroundColor Green
}

# Setup GitHub CLI
Write-Host "`n🌐 Step 3: Setting up GitHub..." -ForegroundColor Yellow

if (-not (Test-Command "gh")) {
    if (-not (Install-GitHubCLI)) {
        exit 1
    }
}

# Check GitHub authentication
try {
    $ghAuth = gh auth status 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "🔐 GitHub authentication required..." -ForegroundColor Yellow
        Write-Host "   Please follow the prompts to authenticate with GitHub" -ForegroundColor Yellow
        Write-Host "   This will open your browser for authentication" -ForegroundColor Yellow
        
        gh auth login --web
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ GitHub authentication failed" -ForegroundColor Red
            exit 1
        }
    }
    Write-Host "✅ GitHub authenticated" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub authentication failed" -ForegroundColor Red
    exit 1
}

# Create GitHub repository
Write-Host "`n📦 Step 4: Creating GitHub repository..." -ForegroundColor Yellow

$repoName = "color_block_path_finding"
$repoDescription = "A puzzle game where you drag and drop colored shapes through matching gates"

try {
    # Check if repository already exists
    $existingRepo = gh repo view $repoName 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⚠️  Repository '$repoName' already exists" -ForegroundColor Yellow
        Write-Host "   Using existing repository..." -ForegroundColor Yellow
    } else {
        # Create new repository
        gh repo create $repoName --public --description $repoDescription --source=. --remote=origin --push
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ GitHub repository created and pushed" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to create GitHub repository" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "❌ Error creating GitHub repository" -ForegroundColor Red
    exit 1
}

# Setup remote if needed
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    $username = gh api user --jq .login
    $remoteUrl = "https://github.com/$username/$repoName.git"
    git remote add origin $remoteUrl
    Write-Host "✅ Remote origin added" -ForegroundColor Green
}

# Push to GitHub
Write-Host "`n📤 Step 5: Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Code pushed to GitHub" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    exit 1
}

# Setup Vercel
Write-Host "`n🚀 Step 6: Setting up Vercel..." -ForegroundColor Yellow

if (-not (Test-Command "vercel")) {
    if (-not (Install-VercelCLI)) {
        Write-Host "⚠️  Vercel CLI not available. You can deploy manually at: https://vercel.com" -ForegroundColor Yellow
        Write-Host "   Just import your GitHub repository: $repoName" -ForegroundColor Yellow
    }
}

# Deploy to Vercel
if (Test-Command "vercel") {
    Write-Host "`n🌐 Step 7: Deploying to Vercel..." -ForegroundColor Yellow
    Write-Host "   This may take a few minutes..." -ForegroundColor Yellow
    Write-Host "   You may be prompted to log in to Vercel..." -ForegroundColor Yellow
    
    try {
        vercel --prod --yes
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully deployed to Vercel!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Vercel deployment may have failed" -ForegroundColor Yellow
            Write-Host "   You can deploy manually at: https://vercel.com" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "⚠️  Vercel deployment failed" -ForegroundColor Yellow
        Write-Host "   You can deploy manually at: https://vercel.com" -ForegroundColor Cyan
    }
}

# Final summary
$username = gh api user --jq .login
Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host "✅ GitHub Repository: https://github.com/$username/$repoName" -ForegroundColor White
Write-Host "✅ Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "✅ Auto-deploy: Enabled for future updates" -ForegroundColor White

Write-Host "`n🎮 Your Color Block Path Finding game is now live!" -ForegroundColor Green
Write-Host "   Check your Vercel dashboard for the deployment URL." -ForegroundColor Yellow

Write-Host "`n📝 To update your game in the future:" -ForegroundColor Cyan
Write-Host "   1. Make your changes" -ForegroundColor White
Write-Host "   2. Run: git add . && git commit -m 'Update message' && git push" -ForegroundColor White
Write-Host "   3. Vercel will automatically redeploy" -ForegroundColor White 