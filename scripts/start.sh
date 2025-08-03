#!/bin/bash

# Script de démarrage automatique pour 7ouma Ligue Backend
# Usage: ./scripts/start.sh

set -e

echo "🚀 Démarrage de 7ouma Ligue Backend..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Aller dans le dossier backend
cd "$(dirname "$0")/.."

log_info "📁 Dossier de travail: $(pwd)"

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    log_info "📦 Installation des dépendances..."
    npm install
fi

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    log_info "📦 Installation de PM2..."
    npm install -g pm2
fi

# Vérifier si le fichier de configuration PM2 existe
if [ ! -f "ecosystem.config.js" ]; then
    log_error "Fichier ecosystem.config.js manquant!"
    exit 1
fi

# Arrêter le processus s'il existe déjà
log_info "🛑 Arrêt des processus existants..."
pm2 delete 7oumaligue-backend 2>/dev/null || true

# Démarrer le serveur avec PM2
log_info "🚀 Démarrage du serveur avec PM2..."
pm2 start ecosystem.config.js

# Attendre un peu pour que le serveur démarre
sleep 3

# Vérifier le statut
log_info "📊 Statut du serveur:"
pm2 status

# Vérifier si le serveur répond
log_info "🔍 Vérification de la santé du serveur..."
if curl -s http://localhost:5000/health > /dev/null; then
    log_success "✅ Serveur démarré avec succès!"
    log_info "🌐 API disponible sur: http://localhost:5000"
    log_info "📊 Dashboard PM2: pm2 monit"
    log_info "📝 Logs: pm2 logs 7oumaligue-backend"
else
    log_warning "⚠️ Le serveur ne répond pas encore. Vérifiez les logs avec: pm2 logs 7oumaligue-backend"
fi

# Démarrer la surveillance en arrière-plan
log_info "🔍 Démarrage de la surveillance..."
nohup node scripts/monitor.js > logs/monitor.log 2>&1 &

log_success "🎉 Configuration terminée!"
echo ""
echo "📋 Commandes utiles:"
echo "  pm2 status                    - Voir le statut"
echo "  pm2 logs 7oumaligue-backend   - Voir les logs"
echo "  pm2 monit                     - Dashboard en temps réel"
echo "  pm2 restart 7oumaligue-backend - Redémarrer"
echo "  pm2 stop 7oumaligue-backend   - Arrêter"
echo "  pm2 delete 7oumaligue-backend - Supprimer"
echo "" 