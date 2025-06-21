# 🚀 Auto-Deploy Script for Color Block Path Finding
# This script automates the entire deployment process

Write-Host "🚀 Color Block Path Finding - Auto Deployment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Git
if (-not (Test-Command "git")) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/downloads" -ForegroundColor Cyan
    exit 1
}
Write-Host "✅ Git is installed" -ForegroundColor Green

# Check Git configuration
$gitName = git config --global user.name
$gitEmail = git config --global user.email

if (-not $gitName -or -not $gitEmail) {
    Write-Host "❌ Git is not configured. Please run these commands first:" -ForegroundColor Red
    Write-Host "   git config --global user.name 'Your Name'" -ForegroundColor Cyan
    Write-Host "   git config --global user.email 'your.email@example.com'" -ForegroundColor Cyan
    Write-Host "`nThen run this script again." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Git configured: $gitName <$gitEmail>" -ForegroundColor Green

# Check GitHub CLI
$ghInstalled = Test-Command "gh"
if (-not $ghInstalled) {
    Write-Host "⚠️  GitHub CLI not found. Installing..." -ForegroundColor Yellow
    
    # Try to install GitHub CLI using winget
    if (Test-Command "winget") {
        Write-Host "📦 Installing GitHub CLI via winget..." -ForegroundColor Yellow
        winget install GitHub.cli
        Write-Host "✅ GitHub CLI installed via winget" -ForegroundColor Green
    } else {
        Write-Host "❌ Please install GitHub CLI manually:" -ForegroundColor Red
        Write-Host "   Download from: https://cli.github.com/" -ForegroundColor Cyan
        Write-Host "   Or run: winget install GitHub.cli" -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "✅ GitHub CLI is installed" -ForegroundColor Green
}

# Check if GitHub CLI is authenticated
Write-Host "`n🔐 Checking GitHub authentication..." -ForegroundColor Yellow
try {
    $ghAuth = gh auth status 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ GitHub CLI is authenticated" -ForegroundColor Green
    } else {
        Write-Host "❌ GitHub CLI not authenticated. Please run:" -ForegroundColor Red
        Write-Host "   gh auth login" -ForegroundColor Cyan
        Write-Host "   Follow the prompts to authenticate with your GitHub account" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ GitHub CLI not authenticated. Please run:" -ForegroundColor Red
    Write-Host "   gh auth login" -ForegroundColor Cyan
    exit 1
}

# Initialize Git repository if needed
Write-Host "`n📁 Setting up Git repository..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Add and commit files
Write-Host "`n📦 Adding files to Git..." -ForegroundColor Yellow
git add .
$status = git status --porcelain
if ($status) {
    git commit -m "Initial commit: Color Block Path Finding game"
    Write-Host "✅ Files committed" -ForegroundColor Green
} else {
    Write-Host "✅ All files already committed" -ForegroundColor Green
}

# Create GitHub repository
Write-Host "`n🌐 Creating GitHub repository..." -ForegroundColor Yellow
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
    Write-Host "   Please create it manually at: https://github.com/new" -ForegroundColor Cyan
    exit 1
}

# Set up remote if not already set
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    $username = gh api user --jq .login
    $remoteUrl = "https://github.com/$username/$repoName.git"
    git remote add origin $remoteUrl
    Write-Host "✅ Remote origin added: $remoteUrl" -ForegroundColor Green
}

# Push to GitHub
Write-Host "`n📤 Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Code pushed to GitHub" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    exit 1
}

# Deploy to Vercel
Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Yellow

# Check if Vercel CLI is available
$vercelInstalled = Test-Command "vercel"
if (-not $vercelInstalled) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        Write-Host "   Please install manually: npm install -g vercel" -ForegroundColor Cyan
        exit 1
    }
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
}

# Deploy to Vercel
Write-Host "`n🌐 Deploying to Vercel (this may take a few minutes)..." -ForegroundColor Yellow
Write-Host "   You may be prompted to log in to Vercel..." -ForegroundColor Yellow

try {
    # Deploy using Vercel CLI
    vercel --prod --yes
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully deployed to Vercel!" -ForegroundColor Green
    } else {
        Write-Host "❌ Vercel deployment failed" -ForegroundColor Red
        Write-Host "   Please try manual deployment at: https://vercel.com" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error during Vercel deployment" -ForegroundColor Red
    Write-Host "   Please deploy manually at: https://vercel.com" -ForegroundColor Cyan
}

Write-Host "`n🎉 Deployment Summary:" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "✅ GitHub Repository: https://github.com/$username/$repoName" -ForegroundColor White
Write-Host "✅ Vercel Deployment: Check your Vercel dashboard for the live URL" -ForegroundColor White
Write-Host "✅ Auto-deploy: Enabled - future pushes will auto-deploy" -ForegroundColor White

Write-Host "`n🎮 Your Color Block Path Finding game is now live!" -ForegroundColor Green
Write-Host "   Check your Vercel dashboard for the deployment URL." -ForegroundColor Yellow 