Write-Host "🔧 Fixing environment variables..." -ForegroundColor Green

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "📝 .env file exists, checking content..." -ForegroundColor Yellow
    
    # Read current content
    $content = Get-Content ".env" -Raw
    
    # Check if DATABASE_URL exists and has a value
    if ($content -match "DATABASE_URL=") {
        $dbUrlLine = ($content -split "`n" | Where-Object { $_ -match "DATABASE_URL=" })[0]
        $dbUrl = $dbUrlLine -replace "DATABASE_URL=`"", "" -replace "`"", ""
        
        if ($dbUrl -and $dbUrl -ne "") {
            Write-Host "✅ DATABASE_URL found with value: $($dbUrl -replace ':[^:@]*@', ':***@')" -ForegroundColor Green
        } else {
            Write-Host "❌ DATABASE_URL is empty, fixing..." -ForegroundColor Red
        }
    } else {
        Write-Host "❌ DATABASE_URL not found, adding..." -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env file does not exist, creating..." -ForegroundColor Red
}

# Create/update .env file with correct DATABASE_URL
$envContent = @"
DATABASE_URL="postgresql://ftms_user:password@localhost:5432/ftms_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ .env file created/updated successfully!" -ForegroundColor Green

# Verify the content
Write-Host "`n🔍 Verifying .env content:" -ForegroundColor Cyan
Get-Content ".env" | ForEach-Object {
    if ($_ -match "DATABASE_URL=") {
        $masked = $_ -replace ':[^:@]*@', ':***@'
        Write-Host "  $masked" -ForegroundColor Green
    } else {
        Write-Host "  $_" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Environment variables fixed!" -ForegroundColor Green
Write-Host "🚀 You can now run: npx prisma migrate deploy" -ForegroundColor Cyan

Read-Host "Press Enter to continue" 