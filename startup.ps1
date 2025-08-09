Write-Host "🚀 Starting 7oumaligue backend..." -ForegroundColor Green

# Check if .env file exists, if not create it
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    @"
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/7oumaligue_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-for-production-7oumaligue"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=8080
HOST=0.0.0.0
NODE_ENV=production

# API Configuration
API_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS Origins
CORS_ORIGINS="http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://gray-tree-0ae561303.2.azurestaticapps.net,https://tonfrontend.azurestaticapps.net"

# Logging
LOG_LEVEL=info
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Build the application
Write-Host "🏗️ Building application..." -ForegroundColor Yellow
npm run build

# Start the server
Write-Host "🚀 Starting server..." -ForegroundColor Green
node dist/src/server.js 