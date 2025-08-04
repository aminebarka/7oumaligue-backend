# 🚀 Correction Rapide - Azure ne répond pas sur le port 8080

## 🎯 Problème
Azure exécute `npm run dev` au lieu de `npm start` → Conteneur ne répond pas

## ✅ Solution en 3 étapes

### Étape 1 : Configurer Azure Portal
1. Aller dans **Azure Portal** → App Service
2. **Configuration** → **General Settings**
3. **Startup Command** : mettre exactement `npm start`
4. **Save** + **Restart**

### Étape 2 : Vérifier le build local
```bash
cd backend
npm run build
npm run check-build
```

### Étape 3 : Tester
```bash
# Test local
npm start

# Test Azure
curl https://7oumaligue-backend.azurewebsites.net/health
```

## 🧪 Résultat attendu
Dans les logs Azure :
```
✅ Server successfully started on port: 8080
```

## ⚠️ Points critiques
- **Ne jamais laisser Startup Command vide**
- **Toujours utiliser `npm start`** (pas `npm run start`)
- **Redémarrer obligatoire** après modification
- **Vérifier que dist/src/server.js existe**

## 🔧 Si ça ne marche pas
1. Vérifier les logs Azure : `az webapp log tail`
2. Tester local : `npm start`
3. Rebuild : `npm run build`
4. Redéployer 