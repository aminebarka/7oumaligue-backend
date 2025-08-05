# 🔐 Configuration des Secrets GitHub Actions

## 🎯 Secrets Requis

Pour que le workflow Docker fonctionne, configurez ces secrets dans GitHub :

### **1. Azure Container Registry**
Dans GitHub → Settings → Secrets and variables → Actions :

#### **REGISTRY_USERNAME**
- **Valeur :** Nom d'utilisateur de votre Azure Container Registry
- **Exemple :** `7oumaligue`

#### **REGISTRY_PASSWORD**
- **Valeur :** Mot de passe de votre Azure Container Registry
- **Exemple :** `votre_mot_de_passe_registry`

## 🔧 Configuration Azure Container Registry

### **1. Créer le Registry**
```bash
# Créer le resource group (si pas existant)
az group create --name 7oumaligue-rg --location francecentral

# Créer le Container Registry
az acr create \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue \
  --sku Basic \
  --admin-enabled true
```

### **2. Récupérer les Credentials**
```bash
# Récupérer les credentials
az acr credential show --name 7oumaligue

# Ou individuellement
az acr credential show --name 7oumaligue --query "username" -o tsv
az acr credential show --name 7oumaligue --query "passwords[0].value" -o tsv
```

### **3. Configurer l'App Service**
```bash
# Configurer l'App Service pour utiliser Docker
az webapp config container set \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue-backend \
  --docker-custom-image-name 7oumaligue.azurecr.io/7oumaligue-backend:latest
```

## 📊 Variables d'Environnement

### **Dans le Workflow**
Le workflow utilise ces variables d'environnement :
```yaml
env:
  AZURE_WEBAPP_NAME: 7oumaligue-backend
  AZURE_RESOURCE_GROUP: 7oumaligue-rg
  CONTAINER_REGISTRY: 7oumaligue.azurecr.io
  IMAGE_NAME: 7oumaligue-backend
```

### **Dans Azure Portal**
Configurez ces variables dans Azure Portal → App Service → Configuration :
```ini
WEBSITES_PORT = 8080
DATABASE_URL = votre_url_de_connexion
JWT_SECRET = votre_secret
NODE_ENV = production
```

## 🧪 Test de Configuration

### **1. Test Local Docker**
```bash
cd backend
npm run docker-build
npm run docker-test
```

### **2. Test du Registry**
```bash
# Login au registry
docker login 7oumaligue.azurecr.io

# Test de push
docker tag 7oumaligue-backend 7oumaligue.azurecr.io/7oumaligue-backend:test
docker push 7oumaligue.azurecr.io/7oumaligue-backend:test
```

## 🔍 Diagnostic

### **Vérification des Secrets**
Dans GitHub → Settings → Secrets and variables → Actions :
- ✅ `REGISTRY_USERNAME` configuré
- ✅ `REGISTRY_PASSWORD` configuré

### **Vérification du Registry**
```bash
# Lister les images
az acr repository list --name 7oumaligue

# Vérifier les tags
az acr repository show-tags --name 7oumaligue --repository 7oumaligue-backend
```

### **Vérification de l'App Service**
```bash
# Vérifier la configuration
az webapp config container show \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue-backend

# Vérifier les logs
az webapp log tail \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue-backend
```

## ⚠️ Points Critiques

1. **Registry public** - Assurez-vous que le registry est accessible
2. **Credentials** - Les credentials doivent être valides
3. **Permissions** - L'App Service doit avoir accès au registry
4. **Variables d'environnement** - Configurées dans Azure Portal

## 🎯 Résultat Final

Après configuration, le workflow devrait :
- ✅ Build l'image Docker
- ✅ Push vers Azure Container Registry
- ✅ Déployer vers Azure App Service
- ✅ Démarrer l'application avec succès

**Cette configuration garantit un déploiement Docker fiable et automatisé !** 