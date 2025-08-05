Write-Host "🔧 Checking system and installing dependencies..." -ForegroundColor Green

# Check if we're on Windows
if ($IsWindows -or $env:OS -eq "Windows_NT") {
    Write-Host "✅ Windows detected - canvas should work with pre-built binaries" -ForegroundColor Green
} else {
    Write-Host "⚠️  Linux/macOS detected - you may need to install system dependencies first" -ForegroundColor Yellow
    Write-Host "   For Ubuntu/Debian: sudo apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential libpng-dev" -ForegroundColor Cyan
    Write-Host "   For macOS: brew install cairo jpeg pango giflib" -ForegroundColor Cyan
}

Write-Host "📦 Installing npm dependencies..." -ForegroundColor Green
npm install express-validator express-rate-limit canvas @types/express-validator @types/express-rate-limit

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host "🏗️  You can now run: npm run build" -ForegroundColor Cyan
Read-Host "Press Enter to continue" 