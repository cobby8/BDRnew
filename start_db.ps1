# start_db.ps1
$ErrorActionPreference = "Stop"

# Configuration
$DB_DIR = "$PSScriptRoot\pgdata"
$DB_LOG = "$PSScriptRoot\pg.log"
$DB_PORT = 5432
$DB_USER = "postgres"
$DB_NAME = "bdr_db"

# 1. Find PostgreSQL Binaries
Write-Host "Searching for PostgreSQL installation..."
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\*\bin",
    "C:\Program Files (x86)\PostgreSQL\*\bin"
)

$pgBin = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $pgBin = Get-ChildItem $path | Sort-Object Name -Descending | Select-Object -First 1
        break
    }
}

if (-not $pgBin) {
    # Check PATH
    if (Get-Command "postgres" -ErrorAction SilentlyContinue) {
        $pgBin = (Get-Command "postgres").Source | Split-Path
    }
}

if (-not $pgBin) {
    Write-Error "PostgreSQL binaries not found. Please install PostgreSQL or check the installation path."
    exit 1
}

Write-Host "Found PostgreSQL at: $pgBin"
$Env:Path += ";$pgBin"

# 2. Initialize Database Cluster (if not exists)
if (-not (Test-Path $DB_DIR)) {
    Write-Host "Initializing database cluster in $DB_DIR..."
    & "$pgBin\initdb.exe" -D "$DB_DIR" -U "$DB_USER" -A trust -E UTF8 --no-locale
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to initialize database."
        exit 1
    }
}
else {
    Write-Host "Database cluster already exists at $DB_DIR"
}

# 3. Start Database Server
Write-Host "Starting PostgreSQL server on port $DB_PORT..."
$pgCtl = "$pgBin\pg_ctl.exe"
$status = & $pgCtl -D "$DB_DIR" status

if ($status -like "*no server running*") {
    & $pgCtl -D "$DB_DIR" -l "$DB_LOG" -o "-p $DB_PORT" start
    Start-Sleep -Seconds 3
}
else {
    Write-Host "Server is already running."
}

# 4. Create User and Database (idempotent)
Write-Host "Setting up database '$DB_NAME'..."

# Create DB if not exists
$dbExists = & "$pgBin\psql.exe" -U "$DB_USER" -p "$DB_PORT" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'"
if ($dbExists -ne "1") {
    Write-Host "Creating database '$DB_NAME'..."
    & "$pgBin\createdb.exe" -U "$DB_USER" -p "$DB_PORT" "$DB_NAME"
}
else {
    Write-Host "Database '$DB_NAME' already exists."
}

Write-Host "✅ Database is ready!"
Write-Host "Connection Info: Host=localhost, Port=$DB_PORT, User=$DB_USER, DB=$DB_NAME, Password=(none)"
