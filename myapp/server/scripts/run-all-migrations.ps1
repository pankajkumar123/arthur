#!/usr/bin/env pwsh

# Set PostgreSQL password
$env:PGPASSWORD = '010101'
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql"
$dbHost = "localhost"
$dbUser = "postgres"
$dbName = "myapp"
$migrationDir = "C:\SS - Copy\myapp\Database\migrations"

Write-Host "🔄 Starting comprehensive database migration..." -ForegroundColor Cyan

# Migration files in order
$migrations = @(
    "V1__init_schema.sql",
    "V2__seed_data.sql",
    "V3__rollback.sql",
    "V4__reset_schema.sql",
    "V5__seed_data.sql",
    "V6__roles_and_grants.sql",
    "V7__admin_seed.sql",
    "V8__customer_auth.sql",
    "V9__payment_logs.sql",
    "V10__notifications.sql",
    "V11__fix_tables.sql"
)

# Run each migration
foreach ($migration in $migrations) {
    $filePath = Join-Path $migrationDir $migration
    
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️  Skipping $migration (file not found)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Running $migration..." -ForegroundColor Green
    
    try {
        & $psqlPath -U $dbUser -h $dbHost -d $dbName -f $filePath 2>&1 | Out-Null
        Write-Host "✓ $migration completed" -ForegroundColor Green
    } catch {
        Write-Host "✗ $migration failed: $_" -ForegroundColor Red
        Write-Host "Continuing with next migration..." -ForegroundColor Yellow
    }
}

Write-Host "✅ Migration process complete!" -ForegroundColor Cyan

# Verify tables were created
Write-Host "`n📊 Verifying tables..." -ForegroundColor Cyan
$tableCheckQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"
& $psqlPath -U $dbUser -h $dbHost -d $dbName -c $tableCheckQuery

Write-Host "`n✨ Database setup complete! Ready to start backend." -ForegroundColor Green
