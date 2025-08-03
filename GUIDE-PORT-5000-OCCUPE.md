# 🔌 Guide de Résolution - Port 5000 Occupé

## 🚨 Problème Identifié

**Erreur :**
```
EADDRINUSE: address already in use :::5000
```

**Cause :**
- Un processus Node.js utilise déjà le port 5000
- Le serveur backend ne peut pas démarrer
- Probablement un ancien serveur qui n'a pas été arrêté correctement

## ✅ Solutions Disponibles

### **Solution 1: Script Automatique (Recommandé)**
```bash
cd backend
node start-server.js
```

Ce script va :
- ✅ Vérifier si le port 5000 est libre
- ✅ Arrêter automatiquement le processus qui l'utilise
- ✅ Redémarrer le serveur backend
- ✅ Gérer les erreurs automatiquement

### **Solution 2: Script de Libération Manuel**
```bash
cd backend
node kill-port-5000.js
npm run dev
```

### **Solution 3: Commande Manuelle**
```bash
# Trouver le processus
netstat -ano | findstr :5000

# Tuer le processus (remplacez XXXX par le PID)
taskkill /PID XXXX /F

# Redémarrer le serveur
cd backend && npm run dev
```

## 🔧 Détails des Scripts

### **`start-server.js` - Démarrage Intelligent**
- 🔍 Vérifie automatiquement le port 5000
- 🛑 Arrête le processus qui bloque le port
- 🚀 Redémarre le serveur automatiquement
- 🔄 Gère les erreurs et redémarre si nécessaire

### **`kill-port-5000.js` - Libération du Port**
- 📋 Affiche tous les processus sur le port 5000
- 🎯 Trouve le PID du processus Node.js
- 💀 Arrête le processus automatiquement
- ✅ Confirme la libération du port

## 🧪 Test de la Solution

### **1. Vérifier que le serveur fonctionne :**
```bash
# Dans un nouveau terminal
cd backend
node test-match-creation.js
```

### **2. Test manuel :**
- Ouvrir `http://localhost:5000/api/test` dans le navigateur
- Devrait retourner un JSON de succès

### **3. Test des matchs :**
- Aller dans le frontend
- Créer un tournoi
- Générer des matchs
- Plus d'erreur 404 !

## 🎯 Résultat Attendu

- ✅ Port 5000 libéré automatiquement
- ✅ Serveur backend démarré sans erreur
- ✅ Message "Server running on port 5000"
- ✅ API accessible sur `http://localhost:5000/api/test`
- ✅ Création de matchs fonctionnelle

## 📊 Vérifications

### **Dans la Console :**
- ✅ Pas d'erreur `EADDRINUSE`
- ✅ Message de démarrage du serveur
- ✅ Port 5000 libre

### **Dans le Navigateur :**
- ✅ `http://localhost:5000/api/test` → JSON de succès
- ✅ `http://localhost:5000/api/matches` → Liste des matchs

## 🚀 Prochaines Étapes

1. **Utiliser le script automatique :**
   ```bash
   cd backend
   node start-server.js
   ```

2. **Tester la création de matchs :**
   ```bash
   cd backend
   node test-match-creation.js
   ```

3. **Tester dans le frontend :**
   - Créer un tournoi
   - Générer des matchs
   - Vérifier qu'ils se créent sans erreur

## ⚠️ Important

### **Pour Éviter ce Problème :**
- ✅ Utilisez `Ctrl+C` pour arrêter proprement le serveur
- ✅ Fermez les terminaux du serveur avant d'en ouvrir un nouveau
- ✅ Utilisez `node start-server.js` pour un démarrage intelligent

### **Si le Problème Persiste :**
1. Redémarrez votre terminal/IDE
2. Vérifiez qu'aucun autre processus Node.js ne tourne
3. Utilisez le script automatique `start-server.js`

## 📞 Support

Si le problème persiste :
1. Redémarrez votre ordinateur
2. Vérifiez les processus Node.js avec `tasklist | findstr node`
3. Utilisez un port différent en modifiant `server.ts` 