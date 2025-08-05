# 🚀 Azure Deployment Fix Guide

## 🎯 Issues Fixed

### 1. TypeScript Compilation Error
**Problem**: `tsc: not found` error in Azure logs
**Solution**: 
- Changed build scripts to use `node ./node_modules/typescript/bin/tsc` (Windows-compatible)
- Created production startup script that handles compilation automatically
- Fixed Windows compatibility issues without relying on `npx`

### 2. Kill-Port Dependency Error
**Problem**: `kill-port: not found` error in Azure logs
**Solution**:
- Moved `kill-port` from `devDependencies` to `dependencies`
- Created production startup scripts that don't rely on kill-port
- Updated `npm start` to use `start-prod.js`

### 3. Port Permission Issues
**Problem**: Port 8080 requires elevated permissions on Windows
**Solution**:
- Local development uses port 3000 (no elevated permissions needed)
- Azure deployment uses port 8080 (Azure handles permissions)
- Dynamic port configuration based on environment

### 4. Azure Startup Command
**Problem**: Azure was running `npm run dev` instead of `npm start`
**Solution**: Configure Azure to use `npm start` explicitly

## ✅ Fixed Files

### 1. `package.json`
- ✅ Updated build scripts to use `node ./node_modules/typescript/bin/tsc`
- ✅ Moved `kill-port` to dependencies
- ✅ Updated `start` script to use `start-prod.js`
- ✅ Updated `dev:simple` to use `start-dev-simple.js`

### 2. `start-prod.js` (UPDATED)
- ✅ Production startup script without kill-port dependency
- ✅ Automatic TypeScript compilation check using Windows-compatible approach
- ✅ Dynamic port configuration (3000 locally, 8080 on Azure)
- ✅ Proper environment variable setup
- ✅ Graceful shutdown handling

### 3. `start-dev-simple.js` (UPDATED)
- ✅ Development startup script without kill-port
- ✅ Uses `node ./node_modules/ts-node/dist/bin.js` for development
- ✅ Proper error handling

### 4. `test-startup.js` (UPDATED)
- ✅ Simple test script that doesn't require elevated ports
- ✅ Tests all deployment fixes without port conflicts
- ✅ Uses Windows-compatible TypeScript compilation

## 🔧 Azure Configuration Steps

### 1. Set Startup Command in Azure Portal
1. Go to Azure Portal → App Service
2. Navigate to **Configuration** → **General settings**
3. Set **Startup Command** to: `npm start`
4. Save and restart the app

### 2. Environment Variables (if needed)
Set these in Azure Portal → Configuration → Application settings:
```
NODE_ENV=production
PORT=8080
```

### 3. Build Configuration
The app will now:
- ✅ Automatically compile TypeScript if needed using Windows-compatible approach
- ✅ Use port 3000 locally and 8080 on Azure
- ✅ Handle graceful shutdowns
- ✅ Provide clear error messages

## 🧪 Testing the Fix

### Local Testing
```bash
# Test TypeScript compilation and dependencies
npm run test:startup

# Test production build
npm run build
npm start  # Uses port 3000 locally

# Test development
npm run dev:simple  # Uses port 5000
```

### Azure Testing
After deployment, check logs for:
```
✅ TypeScript compilation successful
🌐 Starting server on port 8080...
✅ Server successfully started on port: 8080
```

## 📋 Deployment Checklist

- [ ] Azure startup command set to `npm start`
- [ ] Environment variables configured
- [ ] App restarted after configuration changes
- [ ] Logs show successful compilation and startup
- [ ] Health check endpoint responding on `/health`

## 🚨 Troubleshooting

### If TypeScript still fails:
1. Check if `typescript` is in dependencies ✅ (Already fixed)
2. Verify `./node_modules/typescript/bin/tsc` exists in the deployment
3. Check `tsconfig.json` configuration

### If port issues persist:
1. **Local**: App uses port 3000 (no elevated permissions needed)
2. **Azure**: App uses port 8080 (Azure handles permissions)
3. Check if any other services are using the ports

### If kill-port still fails:
1. The new scripts don't use kill-port ✅ (Already fixed)
2. Verify `npm start` is being used, not `npm run dev`

### Windows Compatibility:
1. All scripts now use direct paths to binaries instead of `npx`
2. Port 3000 used locally to avoid permission issues
3. Port 8080 used on Azure where permissions are handled
4. No dependency on `npx` being in PATH

## 📞 Support

If issues persist after implementing these fixes:
1. Check Azure logs for specific error messages
2. Verify all configuration changes were applied
3. Test the startup scripts locally first using `npm run test:startup` 