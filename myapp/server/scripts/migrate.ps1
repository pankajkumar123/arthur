$env:PGPASSWORD = '010101'
$psql = "C:\Program Files\PostgreSQL\18\bin\psql"
$dir = "C:\SS - Copy\myapp\Database\migrations"

Write-Host "Starting migrations..." -ForegroundColor Green

$migrations = @(
    "V1__init_schema.sql",
    "V2__seed_data.sql",
    "V4__reset_schema.sql", 
    "V5__seed_data.sql",
    "V6__roles_and_grants.sql",
    "V7__admin_seed.sql",
    "V8__customer_auth.sql",
    "V9__payment_logs.sql",
    "V10__notifications.sql",
    "V11__fix_tables.sql"
)

foreach ($m in $migrations) {
    $p = Join-Path $dir $m
    if (Test-Path $p) {
        Write-Host "Running $m..." -ForegroundColor Cyan
        & $psql -U postgres -d myapp -f $p
        Write-Host "OK: $m" -ForegroundColor Green
    } else {
        Write-Host "SKIP: $m not found" -ForegroundColor Yellow
    }
}

Write-Host "Done!" -ForegroundColor Green
