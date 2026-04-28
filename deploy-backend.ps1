# Hostinger Backend Deployment Script (Windows PowerShell)
# Prepares backend files for upload to Hostinger Node.js hosting

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Hostinger Backend Deployment Script" -ForegroundColor Cyan
Write-Host "  Sai Scientifics Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_ROOT = "c:\SS"
$BACKEND_DIR = "$PROJECT_ROOT\myapp\server"
$DEPLOY_DIR = "$PROJECT_ROOT\hostinger-deploy-backend"

# Step 1: Check if backend directory exists
Write-Host "[1/4] Checking backend directory..." -ForegroundColor Yellow
if (-Not (Test-Path $BACKEND_DIR)) {
    Write-Host "ERROR: Backend directory not found at $BACKEND_DIR" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend directory found" -ForegroundColor Green
Write-Host ""

# Step 2: Prepare deployment folder
Write-Host "[2/4] Preparing deployment folder..." -ForegroundColor Yellow
if (Test-Path $DEPLOY_DIR) {
    Remove-Item -Path $DEPLOY_DIR -Recurse -Force
}
New-Item -Path $DEPLOY_DIR -ItemType Directory | Out-Null

# Copy backend files (excluding node_modules, .env)
$excludeItems = @('node_modules', '.env', '.env.local', '.env.production', 'logs', '*.log')
Get-ChildItem -Path $BACKEND_DIR -Exclude $excludeItems | Copy-Item -Destination $DEPLOY_DIR -Recurse -Force

Write-Host "✓ Backend files copied" -ForegroundColor Green
Write-Host ""

# Step 3: Create .env template
Write-Host "[3/4] Creating .env template..." -ForegroundColor Yellow
$envTemplate = @"
# Hostinger Backend Environment Variables
# Copy this to Hostinger Node.js Application Environment Variables

PORT=4000
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# Supabase (if using)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
"@

$envTemplate | Out-File -FilePath "$DEPLOY_DIR\.env.template" -Encoding UTF8
Write-Host "✓ .env template created" -ForegroundColor Green
Write-Host ""

# Step 4: Show deployment information
Write-Host "[4/4] Backend Package Ready!" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deployment Files Location:" -ForegroundColor Cyan
Write-Host "  $DEPLOY_DIR" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Login to Hostinger hPanel" -ForegroundColor White
Write-Host "2. Go to Advanced → Node.js" -ForegroundColor White
Write-Host "3. Create or access your Node.js application" -ForegroundColor White
Write-Host "4. Upload all files from: $DEPLOY_DIR" -ForegroundColor White
Write-Host "5. Configure environment variables (see .env.template)" -ForegroundColor White
Write-Host "6. Run: npm install --production" -ForegroundColor White
Write-Host "7. Start/Restart the application" -ForegroundColor White
Write-Host ""

# Show file count
$fileCount = (Get-ChildItem -Path $DEPLOY_DIR -Recurse -File).Count
Write-Host "Total files to upload: $fileCount" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠ IMPORTANT: Don't forget to set environment variables in Hostinger!" -ForegroundColor Yellow
Write-Host "   See .env.template in deployment folder for required variables" -ForegroundColor Yellow
Write-Host ""

Write-Host "✓ Backend deployment preparation complete!" -ForegroundColor Green
Write-Host ""

# Open deployment folder
$openFolder = Read-Host "Open deployment folder in Explorer? (Y/N)"
if ($openFolder -eq "Y" -or $openFolder -eq "y") {
    Start-Process explorer.exe $DEPLOY_DIR
}
