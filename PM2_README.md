# 🚀 Guide PM2 - 7ouma Ligue Backend

Ce guide explique comment utiliser PM2 pour gérer automatiquement le serveur backend avec redémarrage automatique et surveillance.

## 📋 Prérequis

- Node.js installé
- npm installé
- PM2 installé globalement : `npm install -g pm2`

## 🚀 Démarrage rapide

### Option 1 : Démarrage automatique (Recommandé)

**Linux/Mac :**
```bash
npm run start:auto
```

**Windows :**
```bash
npm run start:auto:win
```

### Option 2 : Démarrage manuel

```bash
# Installer les dépendances
npm install

# Démarrer avec PM2
npm run pm2:start

# Vérifier le statut
npm run pm2:status
```

## 📊 Commandes PM2 utiles

### Gestion du serveur
```bash
npm run pm2:start      # Démarrer le serveur
npm run pm2:stop       # Arrêter le serveur
npm run pm2:restart    # Redémarrer le serveur
npm run pm2:delete     # Supprimer le processus
```

### Surveillance
```bash
npm run pm2:status     # Voir le statut
npm run pm2:logs       # Voir les logs
npm run pm2:monit      # Dashboard en temps réel
npm run monitor        # Démarrer la surveillance automatique
```

### Commandes PM2 directes
```bash
pm2 status                    # Statut de tous les processus
pm2 logs 7oumaligue-backend   # Logs du serveur
pm2 monit                     # Interface de surveillance
pm2 restart 7oumaligue-backend # Redémarrer
pm2 stop 7oumaligue-backend   # Arrêter
pm2 delete 7oumaligue-backend # Supprimer
```

## 🔍 Surveillance automatique

Le script `scripts/monitor.js` surveille automatiquement le serveur :

- **Vérification toutes les 30 secondes**
- **Redémarrage automatique** si le serveur ne répond pas
- **Logs détaillés** dans `logs/monitor.log`

### Démarrer la surveillance
```bash
npm run monitor
```

## 📁 Structure des logs

```
backend/
├── logs/
│   ├── combined.log    # Logs combinés PM2
│   ├── err.log         # Logs d'erreur PM2
│   ├── out.log         # Logs de sortie PM2
│   └── monitor.log     # Logs de surveillance
```

## ⚙️ Configuration PM2

Le fichier `ecosystem.config.js` configure :

- **Redémarrage automatique** en cas d'erreur
- **Limite mémoire** : 1GB
- **Logs avec timestamps**
- **Variables d'environnement**
- **Surveillance des fichiers**

## 🛠️ Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier les logs
npm run pm2:logs

# Redémarrer
npm run pm2:restart

# Supprimer et redémarrer
npm run pm2:delete
npm run pm2:start
```

### Problème de port
```bash
# Vérifier si le port 5000 est utilisé
lsof -i :5000

# Tuer le processus
kill -9 <PID>
```

### Problème de mémoire
```bash
# Vérifier l'utilisation mémoire
pm2 monit

# Redémarrer si nécessaire
npm run pm2:restart
```

## 🔄 Redémarrage automatique

PM2 redémarre automatiquement le serveur si :

- **Le processus crash**
- **La mémoire dépasse 1GB**
- **Le serveur ne répond pas** (via le script de surveillance)

## 📈 Monitoring en temps réel

```bash
pm2 monit
```

Affiche :
- **CPU et mémoire** utilisés
- **Logs en temps réel**
- **Statut des processus**
- **Redémarrages**

## 🚨 Alertes

Le système surveille :
- ✅ **Santé du serveur** (endpoint `/health`)
- ✅ **Disponibilité PM2**
- ✅ **Utilisation mémoire**
- ✅ **Erreurs de processus**

## 📝 Logs

### Voir les logs en temps réel
```bash
pm2 logs 7oumaligue-backend --lines 100
```

### Filtrer les erreurs
```bash
pm2 logs 7oumaligue-backend --err
```

### Logs avec timestamps
```bash
pm2 logs 7oumaligue-backend --timestamp
```

## 🎯 Avantages de PM2

- ✅ **Redémarrage automatique** en cas de crash
- ✅ **Surveillance mémoire et CPU**
- ✅ **Logs centralisés**
- ✅ **Dashboard en temps réel**
- ✅ **Gestion des variables d'environnement**
- ✅ **Surveillance continue**
- ✅ **Facilité de déploiement**

---

**💡 Conseil :** Utilisez `npm run start:auto` pour un démarrage complet avec surveillance automatique ! 