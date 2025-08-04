# Configuration Azure Portal - Commande de Démarrage

## 🎯 Problème Identifié
Azure exécute `npm run dev` au lieu de `npm start` → Conteneur ne répond pas sur le port 8080

## ✅ Solution

### 1. Aller dans Azure Portal
- App Service > Configuration > General Settings
- Trouver "Startup Command" (ou "Commande de démarrage")

### 2. Configurer la Commande
**Mettre exactement :**
```bash
npm start
```

### 3. Sauvegarder et Redémarrer
- ✅ Save les modifications
- 🔄 Restart le site dans Azure

## ⚠️ Points Critiques
- **Ne pas laisser vide** (sinon Azure "devine" et tombe sur `npm run dev`)
- **Utiliser `npm start`** (pas `npm run start`)
- **Redémarrer obligatoire** après modification

## 🧪 Test
Après redémarrage, vérifier dans les logs :
```
✅ Server successfully started on port: 8080
``` 