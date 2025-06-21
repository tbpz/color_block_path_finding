# Color Block Path Finding - Vercel Deployment Script
# This script helps you deploy your project to Vercel

Write-Host "🚀 Color Block Path Finding - Vercel Deployment" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if Vercel CLI is installed
Write-Host "`n📋 Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = npx vercel --version 2>$null
    if ($vercelVersion) {
        Write-Host "✅ Vercel CLI is available via npx" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Vercel CLI not found, will install via npx" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Vercel CLI not found, will install via npx" -ForegroundColor Yellow
}

# Check if project is connected to GitHub
Write-Host "`n🔗 Checking GitHub connection..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "✅ GitHub remote configured: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "❌ No GitHub remote found. Please run the GitHub deployment first:" -ForegroundColor Red
    Write-Host "   .\deploy-to-github.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host "`n🌐 Vercel Deployment Instructions:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "1. Go to https://vercel.com and sign in with your GitHub account" -ForegroundColor White
Write-Host "2. Click 'New Project'" -ForegroundColor White
Write-Host "3. Import your GitHub repository: color_block_path_finding" -ForegroundColor White
Write-Host "4. Vercel will automatically detect it's a static HTML project" -ForegroundColor White
Write-Host "5. Click 'Deploy'" -ForegroundColor White

Write-Host "`n🔧 Alternative: Deploy via CLI" -ForegroundColor Yellow
Write-Host "If you prefer command line deployment, run:" -ForegroundColor White
Write-Host "   npx vercel" -ForegroundColor Cyan
Write-Host "   Follow the prompts to connect your GitHub account and deploy" -ForegroundColor White

Write-Host "`n📝 Project Configuration:" -ForegroundColor Green
Write-Host "- Framework: Static HTML" -ForegroundColor White
Write-Host "- Build Command: None (static files)" -ForegroundColor White
Write-Host "- Output Directory: . (root)" -ForegroundColor White
Write-Host "- Install Command: None" -ForegroundColor White

Write-Host "`n🎯 After Deployment:" -ForegroundColor Green
Write-Host "1. Vercel will provide you with a live URL" -ForegroundColor White
Write-Host "2. You can set up a custom domain if desired" -ForegroundColor White
Write-Host "3. Every push to main branch will auto-deploy" -ForegroundColor White

Write-Host "`n✅ Ready for Vercel deployment! Follow the instructions above." -ForegroundColor Green 