# 🚀 Automated Deployment Setup Script
# This script helps you connect your existing Netlify and Render services to GitHub Actions

Write-Host "🚀 Sai Scientifics - Deployment Setup" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "myapp")) {
    Write-Host "❌ Error: Please run this script from the SS repository root" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Repository detected: SS" -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan
Write-Host ""

$missingTools = @()

if (-not (Test-Command "node")) {
    $missingTools += "Node.js"
}

if (-not (Test-Command "npm")) {
    $missingTools += "npm"
}

if (-not (Test-Command "git")) {
    $missingTools += "git"
}

if ($missingTools.Count -gt 0) {
    Write-Host "⚠️  Missing tools: $($missingTools -join ', ')" -ForegroundColor Yellow
    Write-Host "Please install these tools first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All prerequisites installed" -ForegroundColor Green
Write-Host ""

# Step 1: GitHub Pages Setup
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "📄 STEP 1: GitHub Pages Setup" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "GitHub Pages is a FREE static hosting service." -ForegroundColor White
Write-Host ""
Write-Host "To enable it:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/umeshchandracholleti/SS/settings/pages" -ForegroundColor White
Write-Host "2. Under 'Build and deployment':" -ForegroundColor White
Write-Host "   - Source: Select 'GitHub Actions'" -ForegroundColor White
Write-Host "3. Click 'Save'" -ForegroundColor White
Write-Host ""
Write-Host "After enabling, your site will be at:" -ForegroundColor Yellow
Write-Host "🌐 https://umeshchandracholleti.github.io/SS/" -ForegroundColor Cyan
Write-Host ""
$pagesEnabled = Read-Host "Have you enabled GitHub Pages? (yes/no)"

if ($pagesEnabled -ne "yes") {
    Write-Host "⏭️  Skipping to next step. You can enable it later." -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Netlify Setup
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "🎨 STEP 2: Netlify Setup (Frontend)" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "You already have a Netlify site: saiscientifics.netlify.app" -ForegroundColor White
Write-Host "Let's connect it to GitHub Actions for automatic deployments." -ForegroundColor White
Write-Host ""

$setupNetlify = Read-Host "Do you want to setup Netlify automation? (yes/no)"

if ($setupNetlify -eq "yes") {
    Write-Host ""
    Write-Host "Installing Netlify CLI..." -ForegroundColor Cyan
    npm install -g netlify-cli
    
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Run: netlify login" -ForegroundColor White
    Write-Host "   (This will open your browser)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. After logging in, run: netlify sites:list" -ForegroundColor White
    Write-Host "   (Find your 'saiscientifics' site ID)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Get your access token:" -ForegroundColor White
    Write-Host "   - Visit: https://app.netlify.com/user/applications#personal-access-tokens" -ForegroundColor White
    Write-Host "   - Click 'New access token'" -ForegroundColor White
    Write-Host "   - Name it: 'GitHub Actions'" -ForegroundColor White
    Write-Host "   - Copy the token" -ForegroundColor White
    Write-Host ""
    
    $runNetlifyLogin = Read-Host "Run 'netlify login' now? (yes/no)"
    if ($runNetlifyLogin -eq "yes") {
        netlify login
        Write-Host ""
        netlify sites:list
    }
    
    Write-Host ""
    Write-Host "Now, add these secrets to GitHub:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/umeshchandracholleti/SS/settings/secrets/actions" -ForegroundColor White
    Write-Host "2. Click 'New repository secret'" -ForegroundColor White
    Write-Host "3. Add these two secrets:" -ForegroundColor White
    Write-Host ""
    Write-Host "   Secret 1:" -ForegroundColor Cyan
    Write-Host "   Name: NETLIFY_AUTH_TOKEN" -ForegroundColor White
    Write-Host "   Value: <paste your token from Netlify>" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Secret 2:" -ForegroundColor Cyan
    Write-Host "   Name: NETLIFY_SITE_ID" -ForegroundColor White
    Write-Host "   Value: <your site ID from netlify sites:list>" -ForegroundColor Gray
    Write-Host ""
    
    Read-Host "Press Enter when you've added both secrets"
}

# Step 3: Render Setup
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "🔧 STEP 3: Render Setup (Backend)" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "You already have a Render backend: saiscientifics-backend1.onrender.com" -ForegroundColor White
Write-Host "Let's connect it to GitHub Actions." -ForegroundColor White
Write-Host ""

$setupRender = Read-Host "Do you want to setup Render automation? (yes/no)"

if ($setupRender -eq "yes") {
    Write-Host ""
    Write-Host "Follow these steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to your Render dashboard:" -ForegroundColor White
    Write-Host "   🌐 https://dashboard.render.com/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Find your service 'saiscientifics-backend1'" -ForegroundColor White
    Write-Host "   - Click on it" -ForegroundColor White
    Write-Host "   - Copy the Service ID from the URL" -ForegroundColor White
    Write-Host "   - Example: https://dashboard.render.com/web/srv-XXXXX" -ForegroundColor Gray
    Write-Host "   - The Service ID is: srv-XXXXX" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Get your API Key:" -ForegroundColor White
    Write-Host "   - Go to: https://dashboard.render.com/u/settings#api-keys" -ForegroundColor White
    Write-Host "   - Click 'Create API Key'" -ForegroundColor White
    Write-Host "   - Name it: 'GitHub Actions'" -ForegroundColor White
    Write-Host "   - Copy the key" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Add these secrets to GitHub:" -ForegroundColor White
    Write-Host "   Go to: https://github.com/umeshchandracholleti/SS/settings/secrets/actions" -ForegroundColor White
    Write-Host ""
    Write-Host "   Secret 1:" -ForegroundColor Cyan
    Write-Host "   Name: RENDER_SERVICE_ID" -ForegroundColor White
    Write-Host "   Value: srv-XXXXX (your service ID)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Secret 2:" -ForegroundColor Cyan
    Write-Host "   Name: RENDER_API_KEY" -ForegroundColor White
    Write-Host "   Value: <your API key>" -ForegroundColor Gray
    Write-Host ""
    
    Read-Host "Press Enter when you've added both secrets"
}

# Step 4: Test Deployment
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "🧪 STEP 4: Test Deployment" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

$testDeploy = Read-Host "Do you want to trigger a test deployment now? (yes/no)"

if ($testDeploy -eq "yes") {
    Write-Host ""
    Write-Host "Creating a test commit to trigger deployments..." -ForegroundColor Cyan
    
    # Create a test commit
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "# Deployment Test`n`nLast deployment test: $timestamp" | Out-File -FilePath "DEPLOYMENT_TEST.md" -Encoding UTF8
    
    git add DEPLOYMENT_TEST.md
    git commit -m "test: trigger deployment workflows"
    git push origin main
    
    Write-Host ""
    Write-Host "✅ Test commit pushed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Check the deployment progress:" -ForegroundColor Yellow
    Write-Host "🌐 https://github.com/umeshchandracholleti/SS/actions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your sites will be live at:" -ForegroundColor Yellow
    Write-Host "  📄 GitHub Pages: https://umeshchandracholleti.github.io/SS/" -ForegroundColor Cyan
    Write-Host "  🎨 Netlify: https://saiscientifics.netlify.app" -ForegroundColor Cyan
    Write-Host "  🔧 Render Backend: https://saiscientifics-backend1.onrender.com" -ForegroundColor Cyan
    Write-Host ""
}

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "What happens now:" -ForegroundColor Yellow
Write-Host "  ✅ Every time you push code to GitHub," -ForegroundColor White
Write-Host "     your application will automatically deploy!" -ForegroundColor White
Write-Host ""
Write-Host "  ✅ Your application runs 24/7 in the cloud" -ForegroundColor White
Write-Host "     (no laptop needed)" -ForegroundColor White
Write-Host ""
Write-Host "  ✅ Payment gateways will work perfectly" -ForegroundColor White
Write-Host "     (Stripe, Razorpay, PayPal, etc.)" -ForegroundColor White
Write-Host ""
Write-Host "Need help? Check DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy coding!" -ForegroundColor Green
Write-Host ""
