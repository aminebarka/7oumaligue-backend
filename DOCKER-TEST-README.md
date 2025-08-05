# Tests Docker Locaux - 7ouma Ligue Backend

## 🐳 Scripts de Test Docker

### Scripts disponibles

#### Linux/macOS (Bash)
```bash
# Test Docker local standard
npm run docker-test

# Test Docker local avec nettoyage
npm run docker-test:clean

# Construction de l'image
npm run docker-build

# Lancement simple du conteneur
npm run docker-run
```

#### Windows (PowerShell)
```powershell
# Test Docker local standard
npm run docker-test:win

# Test Docker local avec nettoyage
npm run docker-test:win:clean
```

#### Docker Compose
```bash
# Démarrer tous les services
npm run docker-compose:up

# Arrêter tous les services
npm run docker-compose:down

# Voir les logs
npm run docker-compose:logs
```

## 🚀 Utilisation

### Test Local Rapide

1. **Linux/macOS** :
   ```bash
   npm run docker-test
   ```

2. **Windows** :
   ```powershell
   npm run docker-test:win
   ```

### Test avec Nettoyage

Si vous voulez nettoyer les anciens conteneurs et images :

1. **Linux/macOS** :
   ```bash
   npm run docker-test:clean
   ```

2. **Windows** :
   ```powershell
   npm run docker-test:win:clean
   ```

### Test avec Docker Compose

Pour un test complet avec base de données :

```bash
# Démarrer tous les services
npm run docker-compose:up

# Vérifier les logs
npm run docker-compose:logs

# Arrêter les services
npm run docker-compose:down
```

## 🔧 Variables d'Environnement de Test

Les scripts utilisent automatiquement ces variables de test :

```env
DATABASE_URL=postgresql://testuser:testpass@localhost:5432/7oumaligue_test
JWT_SECRET=test-jwt-secret-key-for-local-testing
STRIPE_SECRET_KEY=sk_test_test_stripe_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=test@example.com
SMTP_PASS=test-password
NODE_ENV=test
PORT=8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
ENABLE_RATE_LIMIT=false
```

## 🌐 Accès au Serveur

- **Port local** : `http://localhost:3000`
- **Port conteneur** : `8080`
- **Mapping** : `3000:8080`

## 📋 Vérifications Automatiques

Les scripts vérifient automatiquement :

1. ✅ **Docker installé** - Vérifie que Docker est disponible
2. ✅ **Docker en cours d'exécution** - Vérifie que le daemon Docker fonctionne
3. ✅ **Construction de l'image** - Build l'image avec toutes les dépendances
4. ✅ **Variables d'environnement** - Configure les variables de test
5. ✅ **Démarrage du conteneur** - Lance le serveur avec les bonnes configurations

## 🐛 Dépannage

### Erreurs courantes

#### 1. Docker non installé
```bash
# Installer Docker Desktop
# https://www.docker.com/products/docker-desktop
```

#### 2. Docker non démarré
```bash
# Démarrer Docker Desktop
# Ou sur Linux : sudo systemctl start docker
```

#### 3. Port déjà utilisé
```bash
# Vérifier les processus sur le port 3000
lsof -i :3000

# Tuer le processus si nécessaire
kill -9 <PID>
```

#### 4. Erreur de permissions (Linux)
```bash
# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer la session
newgrp docker
```

### Logs et Debugging

```bash
# Voir les logs du conteneur
docker logs 7oumaligue-backend-test

# Accéder au conteneur
docker exec -it 7oumaligue-backend-test sh

# Vérifier les processus
docker exec 7oumaligue-backend-test ps aux
```

## 🔄 Workflow de Développement

### 1. Développement Local
```bash
# Démarrer le serveur de développement
npm run dev
```

### 2. Test Docker
```bash
# Tester l'image Docker
npm run docker-test
```

### 3. Test avec Base de Données
```bash
# Tester avec PostgreSQL
npm run docker-compose:up
```

### 4. Production
```bash
# Construire pour la production
npm run docker-build

# Lancer en production
docker run -d -p 8080:8080 --env-file .env 7oumaligue-backend
```

## 📝 Notes Importantes

- Les scripts de test utilisent des variables d'environnement de test
- Le serveur est accessible sur `http://localhost:3000`
- Les conteneurs sont automatiquement supprimés après arrêt (`--rm`)
- Le mode interactif permet de voir les logs en temps réel
- Les erreurs sont affichées avec des couleurs pour faciliter le debugging 