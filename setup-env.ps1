Write-Host "🔧 Setting up environment variables..." -ForegroundColor Green

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    
    $envContent = @"
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/7oumaligue_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=3001
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
    Write-Host "✅ .env file created successfully!" -ForegroundColor Green
}

Write-Host "⚠️  IMPORTANT: Please update the DATABASE_URL in .env with your actual database connection string" -ForegroundColor Yellow
Write-Host "   Example: DATABASE_URL=`"postgresql://username:password@localhost:5432/7oumaligue_db`"" -ForegroundColor Cyan
Write-Host "   Or use a cloud database like: DATABASE_URL=`"postgresql://user:pass@host:port/database`"" -ForegroundColor Cyan

Read-Host "Press Enter to continue" 