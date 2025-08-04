#!/bin/bash

echo "🚀 === DÉMARRAGE AZURE AVEC CONTOURNEMENT LOADER ==="
echo "📅 Date: $(date)"
echo "📁 Répertoire: $(pwd)"

# Désactiver le loader Azure qui cause des conflits
echo "🔧 Désactivation du loader Azure..."
unset NODE_OPTIONS
export NODE_OPTIONS=""

echo "📦 Installation des dépendances système..."
# Mise à jour des paquets
apt-get update -qq

# Installation des dépendances critiques pour canvas, sharp, etc.
apt-get install -y -qq \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpng-dev \
    pkg-config

echo "✅ Dépendances système installées"

echo "🔍 Vérification de la configuration..."
echo "   NODE_ENV: ${NODE_ENV:-non défini}"
echo "   PORT: ${PORT:-non défini}"
echo "   NODE_OPTIONS: ${NODE_OPTIONS:-désactivé}"

echo "📦 Vérification des dépendances npm..."
if [ -f "package.json" ]; then
    echo "✅ package.json trouvé"
    npm list --depth=0 --silent || echo "⚠️ Certaines dépendances peuvent être manquantes"
else
    echo "❌ package.json non trouvé"
    exit 1
fi

echo "🔨 Vérification du build..."
if [ ! -f "dist/src/server.js" ]; then
    echo "⚠️ dist/src/server.js manquant, build en cours..."
    npm run build
    if [ ! -f "dist/src/server.js" ]; then
        echo "❌ Build échoué"
        exit 1
    fi
fi

echo "✅ Build vérifié"

echo "🚀 Démarrage de l'application..."
echo "🎯 Utilisation de start-server.js pour contourner les conflits..."

# Démarrer avec start-server.js qui gère les ports et l'écoute réseau
exec node start-server.js 