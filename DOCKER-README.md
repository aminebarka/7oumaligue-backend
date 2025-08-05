# Docker Setup pour 7ouma Ligue Backend

## Prérequis

- Docker et Docker Compose installés
- Variables d'environnement configurées

## Variables d'environnement

Créez un fichier `.env` à la racine du projet backend avec les variables suivantes :

```env
# Configuration de la base de données
DATABASE_URL="postgresql://username:password@localhost:5432/7oumaligue"

# Configuration JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Configuration Stripe (paiements)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Configuration SMTP (emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Configuration du serveur
PORT=8080
NODE_ENV=production

# Configuration CORS
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"

# Configuration Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
ENABLE_RATE_LIMIT=true

# Configuration des logs
LOG_LEVEL="info"
```

## Commandes Docker

### Construction de l'image
```bash
docker build -t 7oumaligue-backend .
```

### Démarrage avec Docker Compose
```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter les services
docker-compose down
```

### Démarrage manuel
```bash
# Construire l'image
docker build -t 7oumaligue-backend .

# Lancer le conteneur
docker run -d \
  --name 7oumaligue-backend \
  -p 8080:8080 \
  --env-file .env \
  7oumaligue-backend
```

## Migration de la base de données

Après le premier démarrage, vous devrez exécuter les migrations Prisma :

```bash
# Accéder au conteneur
docker exec -it 7oumaligue-backend sh

# Exécuter les migrations
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate
```

## Développement local

Pour le développement, vous pouvez monter le code source :

```bash
docker run -d \
  --name 7oumaligue-backend-dev \
  -p 8080:8080 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/prisma:/app/prisma \
  --env-file .env \
  7oumaligue-backend
```

## Optimisations incluses

- **Multi-stage build** : Réduit la taille de l'image finale
- **Utilisateur non-root** : Améliore la sécurité
- **Dépendances système** : Inclut les packages nécessaires pour canvas, bcrypt, etc.
- **Cache optimisé** : Les dépendances sont installées avant le code source
- **Variables d'environnement** : Toutes les variables nécessaires sont définies

## Dépannage

### Problèmes courants

1. **Erreur de connexion à la base de données**
   - Vérifiez que PostgreSQL est démarré
   - Vérifiez les variables d'environnement DATABASE_URL

2. **Erreur de permissions**
   - L'utilisateur nodejs a les permissions nécessaires
   - Vérifiez les logs avec `docker logs 7oumaligue-backend`

3. **Erreur de compilation TypeScript**
   - Vérifiez que tous les fichiers source sont présents
   - Vérifiez la configuration tsconfig.json

### Logs et debugging

```bash
# Voir les logs en temps réel
docker logs -f 7oumaligue-backend

# Accéder au conteneur pour debugging
docker exec -it 7oumaligue-backend sh

# Vérifier les processus
docker exec 7oumaligue-backend ps aux
``` 