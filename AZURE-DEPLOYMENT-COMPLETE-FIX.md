# 🚀 Complete Azure Deployment Fix Guide

## 🎯 Current Issues from Azure Logs

From the Azure logs, I can see these specific issues:

1. **TypeScript Compilation Error**: `sh: 1: tsc: not found`
2. **Old Scripts Being Used**: Azure is running `> tsc` instead of our new script
3. **Startup Command Issue**: Azure is running `> node dist/src/server.js` instead of `npm start`

## 🔧 Root Cause Analysis

### 1. Deployment Configuration
- **Frontend**: Deployed via Static Web App (`.github/workflows/azure-static-web-apps-gray-tree-0ae561303.yml`)
- **Backend**: Deployed via Azure App Service (`backend/azure-deploy.yml`)
- **Issue**: The backend deployment is using old package.json scripts

### 2. Azure Portal Configuration
- **Startup Command**: Needs to be set to `npm start` in Azure Portal
- **Current Issue**: Azure is using default startup command

### 3. Package.json Scripts
- **Old Scripts**: `"build": "tsc"` and `"start": "tsc && node dist/src/server.js"`
- **New Scripts**: `"build": "node ./node_modules/typescript/bin/tsc"` and `"start": "node start-prod.js"`

## ✅ Complete Fix Steps

### Step 1: Update Azure Portal Configuration

1. **Go to Azure Portal**
   - Navigate to your App Service: `7oumaligue-backend`
   - Go to **Configuration** → **General settings**

2. **Set Startup Command**
   ```
   npm start
   ```

3. **Save and Restart**
   - Click **Save**
   - Restart the app service

### Step 2: Deploy Updated Code

The updated package.json has these fixed scripts:

```json
{
  "scripts": {
    "build": "node ./node_modules/typescript/bin/tsc",
    "start": "node start-prod.js",
    "dev:simple": "node start-dev-simple.js"
  }
}
```

### Step 3: Verify Deployment

After deployment, check Azure logs for:

```
✅ TypeScript compilation successful
🌐 Starting server on port 8080...
✅ Server successfully started on port: 8080
```

## 📁 Updated Files Summary

### 1. `package.json`
- ✅ `"build": "node ./node_modules/typescript/bin/tsc"`
- ✅ `"start": "node start-prod.js"`
- ✅ `kill-port` moved to dependencies
- ✅ `typescript` and `ts-node` in dependencies

### 2. `start-prod.js` (NEW)
- ✅ Windows-compatible TypeScript compilation
- ✅ Dynamic port configuration (3000 locally, 8080 on Azure)
- ✅ Automatic compilation check
- ✅ Graceful shutdown handling

### 3. `start-dev-simple.js` (UPDATED)
- ✅ Windows-compatible ts-node execution
- ✅ No kill-port dependency
- ✅ Proper error handling

### 4. `test-startup.js` (NEW)
- ✅ Tests all deployment fixes
- ✅ No port conflicts
- ✅ Windows-compatible compilation

## 🚨 Critical Azure Configuration

### Azure Portal Settings
1. **Startup Command**: `npm start`
2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=8080
   ```

### Deployment Workflow
The `backend/azure-deploy.yml` workflow will:
1. Install dependencies (`npm ci`)
2. Build the app (`npm run build`)
3. Deploy to Azure App Service

## 🧪 Testing Locally

```bash
cd backend

# Test compilation and dependencies
npm run test:startup

# Test production build
npm run build

# Test production startup (uses port 3000 locally)
npm start

# Test development (uses port 5000)
npm run dev:simple
```

## 📋 Deployment Checklist

- [ ] Azure Portal startup command set to `npm start`
- [ ] Environment variables configured (NODE_ENV=production, PORT=8080)
- [ ] Updated package.json deployed
- [ ] App service restarted
- [ ] Logs show successful compilation and startup
- [ ] Health check endpoint responding on `/health`

## 🔍 Troubleshooting

### If TypeScript still fails:
1. Verify `typescript` is in dependencies ✅
2. Check if `./node_modules/typescript/bin/tsc` exists
3. Verify `tsconfig.json` configuration

### If startup command fails:
1. Check Azure Portal startup command is `npm start`
2. Verify the app service was restarted
3. Check if any other services are using port 8080

### If deployment fails:
1. Check GitHub Actions workflow (`backend/azure-deploy.yml`)
2. Verify Azure credentials and app name
3. Check build logs in GitHub Actions

## 📞 Support

If issues persist:
1. Check Azure App Service logs for specific error messages
2. Verify all configuration changes were applied
3. Test locally first using `npm run test:startup`
4. Check GitHub Actions deployment logs

## 🎯 Expected Results

After implementing all fixes, Azure logs should show:

```
✅ TypeScript compilation successful
🌐 Starting server on port 8080...
✅ Server successfully started on port: 8080
```

Instead of the current errors:
```
❌ sh: 1: tsc: not found
❌ sh: 1: kill-port: not found
``` 