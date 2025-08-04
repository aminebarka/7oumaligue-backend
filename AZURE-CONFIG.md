# 🌐 Configuration Azure Complète

## 📋 Paramètres Azure Portal

### 1. Paramètres Généraux
- **Commande de démarrage :** `npm run azure:deploy`

### 2. Paramètres d'Application
```ini
WEBSITES_PORT = 8080
NODE_ENV = production
AZURE_DEPLOYMENT = true
```

### 3. Variables d'Environnement Requises
```bash
# Base
NODE_ENV=production
PORT=8080
AZURE_DEPLOYMENT=true

# Base de données
DATABASE_URL=your-database-url

# Sécurité
JWT_SECRET=your-jwt-secret

# Frontend
FRONTEND_URL=https://7oumaligue.azurestaticapps.net

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

## 🧪 Test Local

### Test Azure en Local
```bash
cd backend
npm run test-azure
```

### Test Manuel
```bash
# Simuler Azure
export AZURE_DEPLOYMENT=true
export NODE_ENV=production
export PORT=8080

# Tester
npm run azure:deploy
```

## 🚀 Déploiement

### Option 1 : GitHub Actions
```bash
git add .
git commit -m "Fix Azure deployment - network configuration"
git push origin main
```

### Option 2 : Déploiement Manuel
1. Aller dans **Actions** sur GitHub
2. Sélectionner **Manual Deploy Backend to Azure**
3. Cliquer **Run workflow**

## 📊 Monitoring

### Vérifier les Logs
```bash
az webapp log tail \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue-backend
```

### Résultat Attendu
```
⚙️ === CONFIGURATION AZURE ===
🌐 Mode Azure détecté
✅ Configuration Azure appliquée à .env
🚀 === DÉMARRAGE FORCÉ DU SERVEUR ===
✅ dist/src/server.js trouvé
✅ Port 8080 disponible
🎯 Démarrage sur le port 8080
✅ Server running on 0.0.0.0:8080
🖥️  Network interfaces:
  - eth0: 172.17.0.2 (IPv4)
  - lo: 127.0.0.1 (IPv4)
```

## 🔍 Diagnostic

### Si le problème persiste
```bash
cd backend
npm run diagnose
```

### Vérifier la configuration réseau
```bash
# Test de connectivité
curl -v http://localhost:8080/health

# Test des interfaces
netstat -tlnp | grep :8080
```

## ⚠️ Points Critiques

1. **Écoute réseau :** `0.0.0.0` en production, `localhost` en développement
2. **Port :** 8080 pour Azure, 5000 pour le développement
3. **Variables d'environnement :** Configurées automatiquement par `pre-deploy.js`
4. **Gestion des ports :** Fallback automatique si 8080 est occupé

## 🎯 Résultat Final

Après déploiement, Azure devrait :
- ✅ Écouter sur `0.0.0.0:8080`
- ✅ Répondre aux pings HTTP
- ✅ Afficher les interfaces réseau
- ✅ Fonctionner avec Docker

**L'erreur "Container didn't respond to HTTP pings" sera résolue.** 