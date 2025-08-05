# TypeScript Build Fix Instructions

## Problem
The backend TypeScript build is failing due to missing dependencies and implicit `any` type errors.

## Solution

### 1. Install System Dependencies (Required for canvas)
**For Linux/Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential libpng-dev
```

**Or use the provided script:**
```bash
chmod +x install-system-deps.sh
./install-system-deps.sh
```

**For Windows:**
Canvas should work automatically with the pre-built binaries.

**For macOS:**
```bash
brew install cairo jpeg pango giflib
```

### 2. Install Missing Dependencies
Run one of these commands in the `backend` directory:

**Using npm:**
```bash
npm install express-validator express-rate-limit canvas @types/express-validator @types/express-rate-limit
```

**Using the provided scripts:**
- Windows: `install-deps.bat`
- PowerShell: `install-deps.ps1`

### 3. Fix Database Connection Issue
**If you get "DATABASE_URL resolved to an empty string" error:**

**Option A: Use the fix script**
```bash
node fix-database-connection.js
```

**Option B: Use PowerShell script**
```powershell
.\create-env.ps1
```

**Option C: Manual fix**
Create/update `.env` file with:
```env
DATABASE_URL="postgresql://ftms_user:password@localhost:5432/ftms_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
NODE_ENV=development
```

### 4. Configure Database Connection
**Create .env file:**
```bash
# Windows PowerShell
.\setup-env.ps1

# Or manually create .env file with:
DATABASE_URL="postgresql://username:password@localhost:5432/7oumaligue_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
NODE_ENV=development
```

**Test database connection:**
```bash
node test-database.js
```

### 5. Fix TypeScript Errors
The following files have been updated to fix implicit `any` type errors:

- `src/routes/liveMatch.routes.ts` - Added type annotations for validation errors
- `src/routes/match.routes.ts` - Added type annotations for validation errors  
- `src/routes/player.routes.ts` - Added type annotations for validation errors
- `src/routes/team.routes.ts` - Added type annotations for validation errors
- `src/routes/tournament.routes.ts` - Added type annotations for validation errors and custom validation function
- `src/server.ts` - Added type annotations for rate limiter functions

### 6. Run Prisma Migrations
After configuring the database:
```bash
npx prisma generate
npx prisma migrate deploy
```

### 7. Verify the Fix
After installing dependencies, run:
```bash
npm run build
```

The build should now complete successfully without TypeScript errors.

### 8. Alternative: Use the Fix Script
You can also run the automated fix script:
```bash
node fix-typescript-errors.js
```

## Changes Made

### Package.json Updates
- Added `express-validator` for request validation
- Added `express-rate-limit` for rate limiting
- Added `canvas` for image generation
- Added corresponding TypeScript type definitions

### Type Annotations Added
- `(err: any) => err.msg` for validation error mapping
- `(endDate: any, { req }: any) =>` for custom validation
- `(req: any, res: any) =>` for rate limiter handlers

## Database Setup Options

### Option 1: Local PostgreSQL
1. Install PostgreSQL
2. Create database: `createdb 7oumaligue_db`
3. Update DATABASE_URL in .env

### Option 2: Cloud Database (Recommended)
- **Supabase**: Free PostgreSQL hosting
- **Railway**: Easy deployment
- **PlanetScale**: MySQL with Prisma support
- **Neon**: Serverless PostgreSQL

### Option 3: SQLite (Development only)
Update schema.prisma:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

## Troubleshooting Database Issues

### Common DATABASE_URL Errors:
1. **Empty string**: `.env` file missing or DATABASE_URL not set
2. **Connection refused**: Database server not running
3. **Authentication failed**: Wrong username/password
4. **Database does not exist**: Database not created

### Quick Fix Scripts:
- `fix-database-connection.js` - Automatic fix for .env issues
- `create-env.ps1` - PowerShell script for Windows
- `test-database.js` - Test database connection

## Notes
- The `any` type annotations are used to resolve immediate build issues
- For production, consider adding proper type definitions
- The canvas dependency is used for player card generation
- Rate limiting is configured but can be disabled in development
- **Important**: Canvas requires system dependencies on Linux systems
- **Important**: DATABASE_URL must be properly configured for Prisma to work
- **Important**: .env file must be in the backend directory root 