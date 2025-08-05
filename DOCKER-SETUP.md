# 🐳 Configuration Docker - Solution Définitive

## 🎯 Avantages de Docker

1. **Environnement contrôlé** - Build dans un environnement Linux identique à Azure
2. **Dépendances gérées** - Toutes les dépendances système installées automatiquement
3. **Image optimisée** - Multi-stage build pour une image finale légère
4. **Déploiement fiable** - Exactement ce qui fonctionne localement

## 📁 Structure des Fichiers

```
backend/
├── Dockerfile          # Configuration Docker
├── .dockerignore       # Fichiers ignorés par Docker
├── src/               # Code source
├── dist/              # Build généré
└── package.json       # Dépendances
```

## 🧪 Tests Locaux

### **Test Docker Local**
```bash
cd backend
npm run docker-build    # Build de l'image
npm run docker-test     # Test complet
```

### **Test Manuel**
```bash
# Build
docker build -t 7oumaligue-backend .

# Test
docker run -p 8080:8080 7oumaligue-backend
```

## 🚀 Configuration Azure

### **1. Configuration App Service**
- **Pile :** Docker
- **Type de système d'exploitation :** Linux
- **Startup Command :** (laisser vide - utilise le CMD du Dockerfile)

### **2. Variables d'Environnement**
Dans Azure Portal → Configuration → Paramètres d'application :
```ini
WEBSITES_PORT = 8080
DATABASE_URL = votre_url_de_connexion
JWT_SECRET = votre_secret
NODE_ENV = production
```

## 🔧 Configuration GitHub Actions

### **Secrets Requis**
Dans GitHub → Settings → Secrets and variables → Actions :
- `REGISTRY_LOGIN_SERVER` : URL du registre Azure Container Registry
- `REGISTRY_USERNAME` : Nom d'utilisateur du registre
- `REGISTRY_PASSWORD` : Mot de passe du registre

### **Workflow Automatique**
Le fichier `.github/workflows/deploy-docker.yml` :
1. Build l'image Docker
2. Push vers Azure Container Registry
3. Déploie vers Azure App Service

## 📊 Résultat Attendu

Après déploiement, tu verras dans les logs Azure :
```
🐳 Container démarré
📦 Dépendances système installées
🔨 Build TypeScript réussi
🚀 Serveur démarré sur 0.0.0.0:8080
✅ Application prête
```

## 🔍 Diagnostic

### **Vérification Locale**
```bash
# Test complet
npm run docker-test

# Vérification des logs
docker logs test-backend
```

### **Vérification Azure**
```bash
# Logs Azure
az webapp log tail --resource-group 7oumaligue-rg --name 7oumaligue-backend

# SSH dans le container
az webapp ssh --resource-group 7oumaligue-rg --name 7oumaligue-backend
```

## ⚠️ Points Critiques

1. **Multi-stage build** - Build dans un environnement complet, exécution dans une image légère
2. **Chemins explicites** - `./node_modules/.bin/tsc` dans le Dockerfile
3. **Dépendances système** - Installées dans l'étape de build ET d'exécution
4. **Variables d'environnement** - Configurées dans Azure Portal

## 🎯 Résultat Final

Avec Docker, Azure devrait :
- ✅ Build dans un environnement contrôlé
- ✅ Installer toutes les dépendances automatiquement
- ✅ Compiler TypeScript avec succès
- ✅ Démarrer le serveur sur `0.0.0.0:8080`
- ✅ Répondre aux pings HTTP
- ✅ Plus d'erreurs "tsc: not found"

**Cette solution Docker résout définitivement tous les problèmes de déploiement Azure !** 