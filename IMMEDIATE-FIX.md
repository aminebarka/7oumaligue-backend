# 🚨 Fix Immédiat - Startup Command Azure

## ❌ Problème Identifié dans tes Logs

Tes logs montrent clairement :
```
sh: 1: tsc: not found
sh: 1: kill-port: not found
```

**Cause :** Azure n'utilise pas le bon Startup Command

## ✅ Solution Immédiate

### **Étape 1 : Configurer le Startup Command**

#### **Via Azure Portal :**
1. Va dans **Azure Portal**
2. **App Service** → `7oumaligue-backend`
3. **Configuration** → **General Settings**
4. **Startup Command** : mets exactement ceci :
   ```
   bash startup.sh
   ```
5. **Save** + **Restart**

#### **Via Azure CLI :**
```bash
az webapp config set \
  --resource-group 7oumaligue-rg \
  --name 7oumaligue-backend \
  --startup-file "bash startup.sh"
```

### **Étape 2 : Vérifier la Configuration**

```bash
cd backend
npm run check-startup
```

### **Étape 3 : Déployer les Corrections**

```bash
git add .
git commit -m "Fix: Startup Command Azure - bash startup.sh"
git push origin main
```

## 📊 Résultat Attendu

Après configuration, tu devrais voir dans les logs :
```
🚀 === DÉMARRAGE AZURE AVEC INSTALLATION COMPLÈTE ===
🔧 Désactivation du loader Azure...
📦 Installation des dépendances système...
✅ Dépendances système installées
📦 Installation des dépendances npm...
✅ node_modules existe déjà
🔧 Installation de TypeScript globalement...
✅ TypeScript installé globalement
🔨 Vérification du build...
✅ Build vérifié
🚀 Démarrage de l'application...
> 7oumaligue-backend@1.0.0 start
> tsc && node dist/src/server.js
✅ Server running on 0.0.0.0:8080
```

## ⚠️ Points Critiques

1. **Startup Command** : `bash startup.sh` (pas `npm start`)
2. **Pas de Startup Command** = Azure devine (et se trompe)
3. **startup.sh** installe TypeScript et les dépendances système
4. **npm start** compile TypeScript puis démarre le serveur

## 🔍 Diagnostic

### Si le problème persiste :
```bash
# Vérifier la configuration
npm run check-startup

# Analyser les logs
npm run analyze-logs

# Test des dépendances
npm run test-deps
```

## 🎯 Résultat Final

Après cette configuration :
- ✅ TypeScript installé automatiquement
- ✅ Dépendances système installées
- ✅ Build TypeScript réussi
- ✅ Serveur démarre sur 0.0.0.0:8080
- ✅ Plus d'erreurs "tsc: not found"

**Le Startup Command est la clé pour résoudre tous tes problèmes Azure !** 