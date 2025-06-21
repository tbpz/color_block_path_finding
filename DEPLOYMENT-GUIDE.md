# 🚀 Color Block Path Finding - Deployment Guide

This guide will help you deploy your puzzle game to GitHub and then to Vercel.

## 📋 Prerequisites

1. **GitHub Account**: You need a GitHub account
2. **Git Configuration**: Git needs to be configured with your identity

## 🔧 Step 1: Configure Git (Required)

First, you need to configure Git with your identity. Run these commands in PowerShell:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Replace "Your Name" with your actual name and "your.email@example.com" with your email address.

## 🌐 Step 2: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `color_block_path_finding`
3. Description: `A puzzle game where you drag and drop colored shapes through matching gates`
4. Make it **Public** or **Private** (your choice)
5. **IMPORTANT**: Do NOT check any of these boxes:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click "Create repository"

## 📤 Step 3: Push to GitHub

After creating the repository, GitHub will show you commands. Run these in your PowerShell (replace `yourusername` with your actual GitHub username):

```powershell
git remote add origin https://github.com/yourusername/color_block_path_finding.git
git branch -M main
git push -u origin main
```

## 🚀 Step 4: Deploy to Vercel

### Option A: Web Interface (Recommended)

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your repository: `color_block_path_finding`
5. Vercel will automatically detect it's a static HTML project
6. Click "Deploy"

### Option B: Command Line

If you prefer command line deployment:

```powershell
npx vercel
```

Follow the prompts to:
- Connect your GitHub account
- Select your repository
- Deploy

## ✅ What's Been Prepared

Your project has been configured with:

- ✅ **`.gitignore`**: Excludes unnecessary files
- ✅ **`vercel.json`**: Optimized Vercel configuration
- ✅ **Updated README**: Reflects new project name
- ✅ **Git repository**: Initialized and ready
- ✅ **Initial commit**: All files staged and committed

## 🎯 After Deployment

1. **GitHub**: Your code will be available at `https://github.com/yourusername/color_block_path_finding`
2. **Vercel**: Your live game will be available at a URL like `https://color-block-path-finding.vercel.app`
3. **Auto-deploy**: Every time you push changes to GitHub, Vercel will automatically redeploy

## 🔄 Making Updates

To update your deployed game:

```powershell
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy within minutes.

## 📁 Project Structure

```
puzzle-master/
├── index.html          # Main game page
├── script.js           # Game logic
├── styles.css          # Styling
├── README.md           # Project documentation
├── vercel.json         # Vercel configuration
├── .gitignore          # Git ignore rules
└── DEPLOYMENT-GUIDE.md # This guide
```

## 🆘 Troubleshooting

### Git Configuration Issues
- Make sure you've set your name and email with `git config --global user.name` and `git config --global user.email`

### GitHub Repository Issues
- Ensure the repository name is exactly `color_block_path_finding`
- Don't initialize with README, .gitignore, or license

### Vercel Deployment Issues
- Make sure your GitHub repository is public or you've given Vercel access to private repos
- Check that all files are committed and pushed to GitHub

## 🎉 Success!

Once deployed, you'll have:
- A professional GitHub repository
- A live, playable game on Vercel
- Automatic deployments on updates
- A shareable URL for your game

Your Color Block Path Finding game will be live and ready to play! 