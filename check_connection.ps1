# check_connection.ps1
$ErrorActionPreference = "Stop"
$psql = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$env:PGPASSWORD = "postgres"

try {
    & $psql -U postgres -h localhost -d bdr_db -c "SELECT version();"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Connection Successful!"
    }
    else {
        Write-Error "Connection Failed with exit code $LASTEXITCODE"
    }
}
catch {
    Write-Error $_
}
