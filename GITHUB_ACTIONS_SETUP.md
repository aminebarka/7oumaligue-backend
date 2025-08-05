# GitHub Actions Setup Guide

## Required Secrets

To make the GitHub Actions workflow work properly, you need to configure these secrets in your repository:

### 1. Go to your repository settings
- Navigate to your GitHub repository
- Go to **Settings** → **Secrets and variables** → **Actions**

### 2. Add these secrets:

#### `DATABASE_URL`
Your PostgreSQL connection string:
```
postgresql://username:password@host:port/database
```

#### `JWT_SECRET`
A secure random string for JWT token signing:
```
your-super-secret-jwt-key-for-production
```

#### `AZUREAPPSERVICE_PUBLISHPROFILE_F2EFC73E8FD9481CA208D4847CDB20A2`
Your Azure Web App publish profile (already configured)

## Workflow Changes Made

### ✅ Fixed Issues:
1. **Added system dependencies installation** for canvas
2. **Improved .env file creation** with all required variables
3. **Reordered steps** for better dependency management
4. **Added proper error handling** for build process

### 🔧 Steps in the workflow:
1. **Checkout code**
2. **Install system dependencies** (canvas requirements)
3. **Setup Node.js 20.x**
4. **Create .env from secrets**
5. **Install npm dependencies**
6. **Generate Prisma client**
7. **Build TypeScript**
8. **Deploy database migrations**
9. **Upload artifacts**
10. **Deploy to Azure**

## Testing the Workflow

### Local Testing:
```bash
# Test build locally first
cd backend
npm install
npm run build
```

### GitHub Actions Testing:
1. Push to main branch
2. Check Actions tab for build status
3. Verify all steps complete successfully

## Troubleshooting

### Common Issues:
1. **Canvas build fails**: System dependencies not installed
2. **Prisma errors**: DATABASE_URL not configured
3. **TypeScript errors**: Missing type annotations
4. **Build fails**: Missing npm dependencies

### Solutions:
1. Ensure all secrets are configured
2. Check that system dependencies are installed
3. Verify TypeScript compilation locally first
4. Make sure all dependencies are in package.json 