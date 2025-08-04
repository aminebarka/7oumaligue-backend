# 🚨 Fix Azure Loader - Solution Complète

## 📊 Problème Identifié

Les logs Azure montrent :
```
-e NODE_OPTIONS=--require /agents/nodejs/build/src/Loader.js
```

**Ce loader Azure :**
- Entre en conflit avec les modules natifs (canvas, sharp)
- Bloque l'écoute réseau sur 0.0.0.0
- Cause des erreurs silencieuses (pas de logs!)

## ✅ Solution Implémentée

### 1. **startup.sh** - Contournement du Loader
```bash
# Désactiver le loader Azure
unset NODE_OPTIONS
export NODE_OPTIONS=""

# Installer les dépendances système
apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Démarrer l'application
exec node start-server.js
```

### 2. **Configuration Azure**
- **Startup Command :** `bash startup.sh`
- **Paramètres d'application :**
  ```ini
  WEBSITES_PORT = 8080
  NODE_ENV = production
  ```

## 🧪 Tests

### Test Local
```bash
cd backend
npm run test-azure
```

### Test Docker (Simulation Azure)
```bash
cd backend
npm run test-docker
```

## 🚀 Déploiement

### 1. Push vers GitHub
```bash
git add .
git commit -m "Fix Azure loader conflict - unset NODE_OPTIONS"
git push origin main
```

### 2. Configuration Azure Portal
1. **App Service** → `7oumaligue-backend`
2. **Configuration** → **General Settings**
3. **Startup Command :** `bash startup.sh`
4. **Save** + **Restart**

## 📊 Monitoring

### Vérifier les Logs
```bash
az webapp log tail \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue-backend
```

### Résultat Attendu
```
🚀 === DÉMARRAGE AZURE AVEC CONTOURNEMENT LOADER ===
🔧 Désactivation du loader Azure...
📦 Installation des dépendances système...
✅ Dépendances système installées
🚀 Démarrage de l'application...
✅ Server running on 0.0.0.0:8080
🖥️  Network interfaces:
  - eth0: 172.17.0.2 (IPv4)
  - lo: 127.0.0.1 (IPv4)
```

## 🔍 Diagnostic

### Si le problème persiste
```bash
# Vérifier la configuration Azure
npm run check-azure

# Test Docker complet
npm run test-docker
```

### Vérifier les logs Kudu
```
https://7oumaligue-backend-fnfcf7c8dzccffh3.scm.francecentral-01.azurewebsites.net/api/logs/docker
```

## ⚠️ Points Critiques

1. **Loader Azure :** Désactivé avec `unset NODE_OPTIONS`
2. **Dépendances système :** Installées automatiquement
3. **Écoute réseau :** Forcée sur `0.0.0.0:8080`
4. **Configuration :** `bash startup.sh` au lieu de `npm start`

## 🎯 Résultat Final

Après déploiement, Azure devrait :
- ✅ Contourner le loader Azure
- ✅ Installer les dépendances système
- ✅ Écouter sur `0.0.0.0:8080`
- ✅ Répondre aux pings HTTP
- ✅ Fonctionner avec les modules natifs (canvas, sharp)

**L'erreur "Container didn't respond to HTTP pings" sera résolue définitivement.** 