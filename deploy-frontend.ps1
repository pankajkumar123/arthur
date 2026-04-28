# Hostinger Frontend Deployment Script (Windows PowerShell)
# Run this script to build and prepare frontend for Hostinger upload

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Hostinger Frontend Deployment Script" -ForegroundColor Cyan
Write-Host "  Sai Scientifics Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_ROOT = "c:\SS"
$FRONTEND_DIR = "$PROJECT_ROOT\myapp"
$BUILD_DIR = "$FRONTEND_DIR\dist"
$DEPLOY_DIR = "$PROJECT_ROOT\hostinger-deploy"

# Step 1: Check if frontend directory exists
Write-Host "[1/5] Checking frontend directory..." -ForegroundColor Yellow
if (-Not (Test-Path $FRONTEND_DIR)) {
    Write-Host "ERROR: Frontend directory not found at $FRONTEND_DIR" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend directory found" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "[2/5] Installing dependencies..." -ForegroundColor Yellow
Set-Location $FRONTEND_DIR
if (-Not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Build production bundle
Write-Host "[3/5] Building production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Prepare deployment folder
Write-Host "[4/5] Preparing deployment folder..." -ForegroundColor Yellow
if (Test-Path $DEPLOY_DIR) {
    Remove-Item -Path $DEPLOY_DIR -Recurse -Force
}
New-Item -Path $DEPLOY_DIR -ItemType Directory | Out-Null

# Copy build files
Copy-Item -Path "$BUILD_DIR\*" -Destination $DEPLOY_DIR -Recurse -Force

# Copy .htaccess
if (Test-Path "$FRONTEND_DIR\.htaccess") {
    Copy-Item -Path "$FRONTEND_DIR\.htaccess" -Destination $DEPLOY_DIR -Force
    Write-Host "✓ .htaccess file copied" -ForegroundColor Green
} else {
    Write-Host "⚠ Warning: .htaccess file not found" -ForegroundColor Yellow
}

Write-Host "✓ Deployment folder prepared" -ForegroundColor Green
Write-Host ""

# Step 5: Show deployment information
Write-Host "[5/5] Deployment Package Ready!" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deployment Files Location:" -ForegroundColor Cyan
Write-Host "  $DEPLOY_DIR" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open Hostinger File Manager or FTP client" -ForegroundColor White
Write-Host "2. Navigate to public_html directory" -ForegroundColor White
Write-Host "3. Delete any existing files in public_html" -ForegroundColor White
Write-Host "4. Upload ALL files from: $DEPLOY_DIR" -ForegroundColor White
Write-Host "5. Verify .htaccess file is uploaded" -ForegroundColor White
Write-Host ""

# Show file count
$fileCount = (Get-ChildItem -Path $DEPLOY_DIR -Recurse -File).Count
Write-Host "Total files to upload: $fileCount" -ForegroundColor Cyan
Write-Host ""

# Show build size
$buildSize = (Get-ChildItem -Path $DEPLOY_DIR -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Total size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""

Write-Host "✓ Deployment preparation complete!" -ForegroundColor Green
Write-Host ""

# Open deployment folder
$openFolder = Read-Host "Open deployment folder in Explorer? (Y/N)"
if ($openFolder -eq "Y" -or $openFolder -eq "y") {
    Start-Process explorer.exe $DEPLOY_DIR
}
