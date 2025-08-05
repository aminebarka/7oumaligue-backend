#!/bin/bash

echo "🐳 Test Docker Local - 7ouma Ligue Backend"
echo "=========================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

# Vérifier si Docker est en cours d'exécution
if ! docker info &> /dev/null; then
    print_error "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker."
    exit 1
fi

print_status "Docker est disponible et en cours d'exécution"

# Nettoyer les anciens conteneurs et images si demandé
if [ "$1" = "--clean" ]; then
    print_status "Nettoyage des anciens conteneurs et images..."
    docker stop $(docker ps -q --filter ancestor=7oumaligue-backend) 2>/dev/null || true
    docker rm $(docker ps -aq --filter ancestor=7oumaligue-backend) 2>/dev/null || true
    docker rmi 7oumaligue-backend 2>/dev/null || true
    print_success "Nettoyage terminé"
fi

# Construire l'image
print_status "Construction de l'image Docker..."
if docker build -t 7oumaligue-backend .; then
    print_success "Image construite avec succès"
else
    print_error "Échec de la construction de l'image"
    exit 1
fi

# Variables d'environnement de test
export DATABASE_URL="postgresql://testuser:testpass@localhost:5432/7oumaligue_test"
export JWT_SECRET="test-jwt-secret-key-for-local-testing"
export STRIPE_SECRET_KEY="sk_test_test_stripe_key"
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="test@example.com"
export SMTP_PASS="test-password"
export NODE_ENV="test"
export PORT="8080"
export RATE_LIMIT_WINDOW_MS="900000"
export RATE_LIMIT_MAX_REQUESTS="1000"
export ENABLE_RATE_LIMIT="false"

print_status "Variables d'environnement de test configurées"

# Lancer le conteneur avec variables d'environnement
print_status "Démarrage du conteneur de test..."
print_status "Le serveur sera accessible sur http://localhost:3000"

docker run -it --rm \
  --name 7oumaligue-backend-test \
  -p 3000:8080 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
  -e SMTP_HOST="$SMTP_HOST" \
  -e SMTP_PORT="$SMTP_PORT" \
  -e SMTP_USER="$SMTP_USER" \
  -e SMTP_PASS="$SMTP_PASS" \
  -e NODE_ENV="$NODE_ENV" \
  -e PORT="$PORT" \
  -e RATE_LIMIT_WINDOW_MS="$RATE_LIMIT_WINDOW_MS" \
  -e RATE_LIMIT_MAX_REQUESTS="$RATE_LIMIT_MAX_REQUESTS" \
  -e ENABLE_RATE_LIMIT="$ENABLE_RATE_LIMIT" \
  7oumaligue-backend

# Le script se termine quand le conteneur s'arrête
print_status "Test terminé" 