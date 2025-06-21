# Quick Setup Script for Color Block Path Finding
Write-Host "🎮 Color Block Path Finding - Quick Setup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Write-Host "`n📋 Current Status:" -ForegroundColor Yellow
$gitName = git config --global user.name
$gitEmail = git config --global user.email

if ($gitName -and $gitEmail) {
    Write-Host "✅ Git configured: $gitName <$gitEmail>" -ForegroundColor Green
} else {
    Write-Host "❌ Git not configured" -ForegroundColor Red
    Write-Host "`n🔧 Please configure Git first:" -ForegroundColor Yellow
    Write-Host "   git config --global user.name 'Your Name'" -ForegroundColor Cyan
    Write-Host "   git config --global user.email 'your.email@example.com'" -ForegroundColor Cyan
    Write-Host "`nThen run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📁 Git Repository Status:" -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
    
    $status = git status --porcelain
    if ($status) {
        Write-Host "📦 Files ready to commit" -ForegroundColor Green
        git add .
        git commit -m "Initial commit: Color Block Path Finding game"
        Write-Host "✅ Initial commit created" -ForegroundColor Green
    } else {
        Write-Host "✅ All files committed" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Git repository not initialized" -ForegroundColor Red
    git init
    git add .
    git commit -m "Initial commit: Color Block Path Finding game"
    Write-Host "✅ Git repository initialized and committed" -ForegroundColor Green
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. Create GitHub repository: https://github.com/new" -ForegroundColor White
Write-Host "   - Name: color_block_path_finding" -ForegroundColor White
Write-Host "   - Don't initialize with README, .gitignore, or license" -ForegroundColor White
Write-Host "2. Run these commands (replace 'yourusername'):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/yourusername/color_block_path_finding.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host "3. Deploy to Vercel: https://vercel.com" -ForegroundColor White

Write-Host "`n📖 For detailed instructions, see: DEPLOYMENT-GUIDE.md" -ForegroundColor Yellow
Write-Host "✅ Setup complete! Follow the steps above to deploy." -ForegroundColor Green 