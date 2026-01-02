# create_db.ps1
$ErrorActionPreference = "Stop"

# Try to find psql in standard location
$psql = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

if (-not (Test-Path $psql)) {
    # Try 17 just in case installer version differed
    $psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
}

if (-not (Test-Path $psql)) {
    Write-Error "psql.exe not found in standard paths."
    exit 1
}

Write-Host "Found psql at $psql"

# Create Database
$env:PGPASSWORD = "postgres"
$check = & $psql -U postgres -h localhost -tAc "SELECT 1 FROM pg_database WHERE datname='bdr_db'"

if ($check -ne "1") {
    Write-Host "Creating bdr_db..."
    & $psql -U postgres -h localhost -c "CREATE DATABASE bdr_db;"
    Write-Host "bdr_db created."
}
else {
    Write-Host "bdr_db already exists."
}
