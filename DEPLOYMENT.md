# Backend Deployment Guide

## 🚀 Azure App Service Deployment

### Prerequisites
1. Azure App Service plan
2. Node.js 18+ runtime
3. Environment variables configured

### Step 1: Create Azure App Service

```bash
# Create resource group (if not exists)
az group create --name 7oumaligue-rg --location "West Europe"

# Create App Service plan
az appservice plan create --name 7oumaligue-plan --resource-group 7oumaligue-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group 7oumaligue-rg --plan 7oumaligue-plan --name 7oumaligue-backend --runtime "NODE|18-lts"

# Configure Node.js version
az webapp config set --resource-group 7oumaligue-rg --name 7oumaligue-backend --linux-fx-version "NODE|18-lts"
```

### Step 2: Configure Environment Variables

```bash
# Set environment variables
az webapp config appsettings set --resource-group 7oumaligue-rg --name 7oumaligue-backend --settings \
  NODE_ENV=production \
  PORT=8080 \
  DATABASE_URL="your-database-url" \
  JWT_SECRET="your-jwt-secret" \
  FRONTEND_URL="https://your-frontend-url.azurestaticapps.net"
```

### Step 3: Configure GitHub Secrets

1. Go to your GitHub repository settings
2. Add the following secrets:
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Get from Azure App Service → Get publish profile

### Step 4: Deploy

The deployment will happen automatically when you push to the `main` branch.

## 🔧 Manual Deployment

If you prefer manual deployment:

```bash
# Build the application
npm run build

# Deploy to Azure
az webapp deployment source config-zip --resource-group 7oumaligue-rg --name 7oumaligue-backend --src dist.zip
```

## 📊 Monitoring

### Check Logs
```bash
az webapp log tail --resource-group 7oumaligue-rg --name 7oumaligue-backend
```

### Health Check
```bash
curl https://7oumaligue-backend.azurewebsites.net/health
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Issues**: Ensure `PORT` environment variable is set to `8080`
2. **Database Connection**: Verify `DATABASE_URL` is correct
3. **Build Failures**: Check that all dependencies are in `dependencies` (not `devDependencies`)

### Debug Commands

```bash
# Check app settings
az webapp config appsettings list --resource-group 7oumaligue-rg --name 7oumaligue-backend

# Check runtime
az webapp config show --resource-group 7oumaligue-rg --name 7oumaligue-backend --query linuxFxVersion
```

## 🔒 Security Notes

- All sensitive data should be in environment variables
- Database connection should use SSL
- CORS should be properly configured for production
- Rate limiting is enabled in production 