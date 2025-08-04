# 🚀 Guide de Déploiement Complet - Backend Azure

## 📋 Vue d'ensemble

Ce guide couvre le déploiement automatique du backend vers Azure App Service via GitHub Actions.

## 🔧 Configuration Initiale

### 1. Prérequis Azure
```bash
# Créer le groupe de ressources
az group create --name 7oumaligue-rg --location "West Europe"

# Créer le plan App Service
az appservice plan create \
  --name 7oumaligue-plan \
  --resource-group 7oumaligue-rg \
  --sku B1 \
  --is-linux

# Créer l'App Service
az webapp create \
  --resource-group 7oumaligue-rg \
  --plan 7oumaligue-plan \
  --name 7oumaligue-backend \
  --runtime "NODE|18-lts"
```

### 2. Configuration des Variables d'Environnement
```bash
az webapp config appsettings set \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue-backend \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DATABASE_URL="your-database-url" \
    JWT_SECRET="your-jwt-secret" \
    FRONTEND_URL="https://your-frontend-url.azurestaticapps.net"
```

### 3. Obtenir le Publish Profile
```bash
az webapp deployment list-publishing-profiles \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue-backend \
  --xml
```

## 🔑 Configuration GitHub

### 1. Ajouter le Secret GitHub
1. Aller dans votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. Nom : `AZURE_WEBAPP_PUBLISH_PROFILE`
5. Value : Coller le contenu XML du publish profile

## 🧪 Test Local

### 1. Test Complet
```bash
cd backend
npm run pre-deploy-test
```

### 2. Test Manuel
```bash
cd backend
npm run build
npm run verify-deployment
npm start
```

## 🚀 Déploiement

### Option 1 : Déploiement Automatique
- Push vers `main` avec changements dans `backend/`
- Le workflow `.github/workflows/deploy-backend.yml` s'exécute automatiquement

### Option 2 : Déploiement Manuel
1. Aller dans **Actions** sur GitHub
2. Sélectionner **Manual Deploy Backend to Azure**
3. Cliquer **Run workflow**
4. Choisir les options et cliquer **Run workflow**

## 📊 Monitoring

### 1. Vérifier les Logs Azure
```bash
az webapp log tail \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue-backend
```

### 2. Health Check
```bash
curl https://7oumaligue-backend.azurewebsites.net/health
```

### 3. Test de l'API
```bash
curl https://7oumaligue-backend.azurewebsites.net/api/test
```

## 🔍 Troubleshooting

### Problème : "Container didn't respond to HTTP pings"
**Solution :** Vérifier que `startup.sh` force `npm start`

### Problème : "kill-port not found"
**Solution :** Azure utilise `npm run dev` au lieu de `npm start`

### Problème : Build échoue
**Solution :** Vérifier les erreurs TypeScript localement

### Problème : Dépendances manquantes
**Solution :** S'assurer que toutes les dépendances sont dans `dependencies`

## ✅ Checklist de Déploiement

- [ ] Azure App Service créé
- [ ] Variables d'environnement configurées
- [ ] Publish profile ajouté aux secrets GitHub
- [ ] Test local réussi (`npm run pre-deploy-test`)
- [ ] Workflow GitHub Actions configuré
- [ ] Déploiement réussi
- [ ] Health check passe
- [ ] API accessible

## 🎯 Résultat Attendu

Après déploiement réussi :
```
✅ Build completed successfully
✅ Deployment configuration verified
✅ Health check passed - App is running
🎉 Deployment completed!
```

**URLs :**
- Backend : `https://7oumaligue-backend.azurewebsites.net`
- Health : `https://7oumaligue-backend.azurewebsites.net/health`
- API Test : `https://7oumaligue-backend.azurewebsites.net/api/test` 