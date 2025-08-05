Write-Host "Installing missing dependencies..." -ForegroundColor Green
npm install express-validator express-rate-limit canvas @types/express-validator @types/express-rate-limit
Write-Host "Dependencies installed successfully!" -ForegroundColor Green
Read-Host "Press Enter to continue" 