# 🔧 Configuration GitHub Actions pour Azure

## 📋 Prérequis

1. **Azure App Service** créé et configuré
2. **GitHub Repository** avec les workflows
3. **Azure CLI** installé localement

## 🔑 Configuration des Secrets GitHub

### Étape 1 : Obtenir le Publish Profile

```bash
# Connecter à Azure
az login

# Obtenir le publish profile
az webapp deployment list-publishing-profiles \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue-backend \
  --xml
```

### Étape 2 : Ajouter le Secret GitHub

1. Aller dans votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquer **New repository secret**
4. Nom : `AZURE_WEBAPP_PUBLISH_PROFILE`
5. Value : Coller le contenu XML du publish profile

## 🚀 Workflows Disponibles

### 1. Déploiement Automatique
- **Fichier** : `.github/workflows/deploy-backend.yml`
- **Déclencheur** : Push sur `main` avec changements dans `backend/`
- **Actions** :
  - Build TypeScript
  - Vérification de la configuration
  - Déploiement Azure
  - Health check

### 2. Déploiement Manuel
- **Fichier** : `.github/workflows/deploy-manual.yml`
- **Déclencheur** : Workflow dispatch (manuel)
- **Options** :
  - Choix de l'environnement
  - Force rebuild des dépendances
  - Health check détaillé

## 🧪 Test des Workflows

### Test Local
```bash
cd backend
npm run build
npm run verify-deployment
npm start
```

### Test GitHub Actions
1. Push vers `main`
2. Aller dans **Actions** sur GitHub
3. Vérifier que le workflow s'exécute
4. Contrôler les logs pour les erreurs

## 🔍 Monitoring

### Vérifier les Logs Azure
```bash
az webapp log tail \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue-backend
```

### Health Check
```bash
curl https://7oumaligue-backend.azurewebsites.net/health
```

## ⚠️ Points Critiques

1. **Secret GitHub** : Le `AZURE_WEBAPP_PUBLISH_PROFILE` doit être correct
2. **Permissions** : Le workflow doit avoir accès aux secrets
3. **Build** : TypeScript doit compiler sans erreur
4. **Startup Command** : `bash startup.sh` force `npm start`

## 🎯 Résultat Attendu

Après déploiement réussi :
```
✅ Build completed successfully
✅ Deployment configuration verified
✅ Health check passed - App is running
🎉 Deployment completed!
``` 