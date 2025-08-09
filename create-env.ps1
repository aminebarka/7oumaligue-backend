Write-Host "🔧 Creating .env file with database configuration..." -ForegroundColor Green

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "📝 .env file already exists, updating DATABASE_URL..." -ForegroundColor Yellow
    # Read existing content and update DATABASE_URL
    $content = Get-Content ".env" -Raw
    if ($content -match "DATABASE_URL=") {
        $content = $content -replace "DATABASE_URL=.*", "DATABASE_URL=`"postgresql://ftms_user:password@localhost:5432/ftms_db`""
    } else {
        $content += "`nDATABASE_URL=`"postgresql://ftms_user:password@localhost:5432/ftms_db`""
    }
    $content | Out-File -FilePath ".env" -Encoding UTF8
} else {
    Write-Host "📝 Creating new .env file..." -ForegroundColor Yellow
    
    $envContent = @"
# Database Configuration
DATABASE_URL="postgresql://ftms_user:password@localhost:5432/ftms_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=8080
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Stripe Configuration (optional)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Logging
LOG_LEVEL="info"
"@

    $envContent | Out-File -FilePath ".env" -Encoding UTF8
}

Write-Host "✅ .env file created/updated successfully!" -ForegroundColor Green
Write-Host "🔍 Current DATABASE_URL: postgresql://ftms_user:***@localhost:5432/ftms_db" -ForegroundColor Cyan
Write-Host "⚠️  Please update the password in the DATABASE_URL if needed" -ForegroundColor Yellow

# Test the environment variable
Write-Host "`n🧪 Testing environment variable..." -ForegroundColor Green
$envContent = Get-Content ".env"
$dbUrl = ($envContent | Where-Object { $_ -match "DATABASE_URL=" }) -replace "DATABASE_URL=`"", "" -replace "`"", ""
Write-Host "Found DATABASE_URL: $($dbUrl -replace ':[^:@]*@', ':***@')" -ForegroundColor Cyan

Read-Host "Press Enter to continue" 