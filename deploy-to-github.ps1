# Color Block Path Finding - GitHub Deployment Script
# This script helps you deploy your project to GitHub

Write-Host "🚀 Color Block Path Finding - GitHub Deployment" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if Git is configured
Write-Host "`n📋 Checking Git configuration..." -ForegroundColor Yellow
$gitName = git config --global user.name
$gitEmail = git config --global user.email

if (-not $gitName -or -not $gitEmail) {
    Write-Host "❌ Git is not configured. Please run these commands first:" -ForegroundColor Red
    Write-Host "   git config --global user.name 'Your Name'" -ForegroundColor Cyan
    Write-Host "   git config --global user.email 'your.email@example.com'" -ForegroundColor Cyan
    Write-Host "`nThen run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git is configured: $gitName <$gitEmail>" -ForegroundColor Green

# Initialize Git repository
Write-Host "`n📁 Initializing Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
} else {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Add all files
Write-Host "`n📦 Adding files to Git..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files added to staging area" -ForegroundColor Green

# Initial commit
Write-Host "`n💾 Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Color Block Path Finding game"
Write-Host "✅ Initial commit created" -ForegroundColor Green

# Instructions for GitHub
Write-Host "`n🌐 GitHub Repository Setup Instructions:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "1. Go to https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: color_block_path_finding" -ForegroundColor White
Write-Host "3. Make it Public or Private (your choice)" -ForegroundColor White
Write-Host "4. DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
Write-Host "5. Click 'Create repository'" -ForegroundColor White
Write-Host "6. Copy the repository URL (it will look like: https://github.com/yourusername/color_block_path_finding.git)" -ForegroundColor White

Write-Host "`n🔗 After creating the repository, run these commands:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/yourusername/color_block_path_finding.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan

Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. Create the GitHub repository as shown above" -ForegroundColor White
Write-Host "2. Run the commands above (replace 'yourusername' with your actual GitHub username)" -ForegroundColor White
Write-Host "3. Then run: .\deploy-to-vercel.ps1" -ForegroundColor White

Write-Host "`n✅ Setup complete! Follow the instructions above to continue." -ForegroundColor Green 