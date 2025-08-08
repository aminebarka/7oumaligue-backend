# Backend Startup Fix Guide

## Problem
The backend container is failing to start and not responding to HTTP pings on port 8080.

## Root Causes
1. **Missing .env file** - The application requires environment variables
2. **Database connection issues** - Server fails when database is unavailable
3. **Port configuration** - Container should listen on port 8080

## Quick Fix

### Option 1: Run the fix script
```bash
cd backend
node fix-startup-issues.js
```

### Option 2: Manual setup

#### Step 1: Create .env file
Create a `.env` file in the `backend` directory with:

```env
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
CORS_ORIGINS="http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://gray-tree-0ae561303.2.azurestaticapps.net"

# Logging
LOG_LEVEL=info
```

#### Step 2: Install dependencies
```bash
cd backend
npm install
```

#### Step 3: Generate Prisma client
```bash
npx prisma generate
```

#### Step 4: Build the application
```bash
npm run build
```

#### Step 5: Start the server
```bash
npm start
```

## Docker Deployment

### Updated Dockerfile
The Dockerfile has been updated to:
- Handle missing .env files gracefully
- Use non-root user for security
- Include health checks
- Be more resilient to environment issues

### Docker Commands
```bash
# Build the image
docker build -t 7oumaligue-backend .

# Run the container
docker run -p 8080:8080 7oumaligue-backend

# Run with environment variables
docker run -p 8080:8080 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  7oumaligue-backend
```

## Azure Deployment

### Environment Variables
Set these environment variables in Azure:

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure JWT secret
- `PORT`: 8080
- `HOST`: 0.0.0.0
- `NODE_ENV`: production

### Startup Script
The `startup.sh` script will:
1. Create .env file if missing
2. Install dependencies
3. Generate Prisma client
4. Build the application
5. Start the server

## Health Check

Test if the server is running:
```bash
# Using curl
curl http://localhost:8080/health

# Using the health check script
node healthcheck.js
```

## Troubleshooting

### Server won't start
1. Check if .env file exists
2. Verify DATABASE_URL is set
3. Ensure dependencies are installed
4. Check if port 8080 is available

### Database connection fails
The server will now start even if the database is unavailable. You can:
1. Set up a local PostgreSQL database
2. Use a cloud database (Supabase, Railway, etc.)
3. Update the DATABASE_URL in .env

### Port already in use
```bash
# Check what's using port 8080
netstat -tulpn | grep 8080

# Kill the process
kill -9 <PID>
```

## Verification

After applying the fixes, verify:

1. **Server starts**: `npm start` should work
2. **Health check passes**: `curl http://localhost:8080/health`
3. **API responds**: `curl http://localhost:8080/api/test`

## Files Modified

- `src/server.ts`: More resilient startup
- `src/config/database.ts`: Don't exit on DB failure
- `Dockerfile`: Better environment handling
- `startup.sh`: Automated setup
- `startup.ps1`: Windows setup
- `healthcheck.js`: Health check script
- `fix-startup-issues.js`: Automated fix script 