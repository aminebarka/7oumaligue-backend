Write-Host "🔧 Force fixing environment variables..." -ForegroundColor Green

# Remove existing .env file if it exists
if (Test-Path ".env") {
    Write-Host "🗑️  Removing existing .env file..." -ForegroundColor Yellow
    Remove-Item ".env" -Force
}

# Create a completely new .env file
Write-Host "📝 Creating new .env file..." -ForegroundColor Yellow

$envContent = @"
DATABASE_URL="postgresql://ftms_user:password@localhost:5432/ftms_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
LOG_LEVEL="info"
"@

# Write with explicit UTF8 encoding
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
Write-Host "✅ .env file created successfully!" -ForegroundColor Green

# Verify the content
Write-Host "`n🔍 Verifying .env content:" -ForegroundColor Cyan
$content = Get-Content ".env"
Write-Host "File has $($content.Length) lines" -ForegroundColor Gray

foreach ($line in $content) {
    if ($line -match "DATABASE_URL=") {
        $masked = $line -replace ':[^:@]*@', ':***@'
        Write-Host "  $masked" -ForegroundColor Green
    } else {
        Write-Host "  $line" -ForegroundColor Gray
    }
}

# Test with Node.js
Write-Host "`n🧪 Testing with Node.js..." -ForegroundColor Cyan
$testScript = @"
require('dotenv').config();
console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL value:', process.env.DATABASE_URL ? 
    process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'NOT SET');
"@

$testScript | Out-File -FilePath "temp-test.js" -Encoding UTF8
node temp-test.js
Remove-Item "temp-test.js" -Force

Write-Host "`n✅ Environment variables force fixed!" -ForegroundColor Green
Write-Host "🚀 You can now run: npx prisma migrate deploy" -ForegroundColor Cyan

Read-Host "Press Enter to continue" 