#!/bin/bash

echo "🚀 === DÉMARRAGE AZURE AVEC INSTALLATION COMPLÈTE ==="
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
    pkg-config \
    curl \
    git

echo "✅ Dépendances système installées"

echo "🔍 Vérification de la configuration..."
echo "   NODE_ENV: ${NODE_ENV:-non défini}"
echo "   PORT: ${PORT:-non défini}"
echo "   NODE_OPTIONS: ${NODE_OPTIONS:-désactivé}"

echo "📦 Installation des dépendances npm..."
if [ -f "package.json" ]; then
    echo "✅ package.json trouvé"
    
    # Installer TOUTES les dépendances (incluant devDependencies)
    echo "📦 Installation complète des dépendances (incluant devDependencies)..."
    npm install --include=dev
    
    # Vérifier que TypeScript est installé localement
    if [ -f "./node_modules/.bin/tsc" ]; then
        echo "✅ TypeScript installé localement"
        echo "   Version: $(./node_modules/.bin/tsc --version)"
    else
        echo "❌ TypeScript non trouvé localement"
        echo "🔧 Installation explicite de TypeScript..."
        npm install typescript@latest --include=dev
    fi
else
    echo "❌ package.json non trouvé"
    exit 1
fi

echo "🔨 Build avec chemin explicite..."
if [ ! -f "dist/src/server.js" ]; then
    echo "⚠️ dist/src/server.js manquant, build en cours..."
    
    # Utiliser le chemin explicite pour tsc
    ./node_modules/.bin/tsc
    if [ ! -f "dist/src/server.js" ]; then
        echo "❌ Build échoué avec chemin explicite"
        echo "🔍 Tentative avec npm run build..."
        npm run build
        if [ ! -f "dist/src/server.js" ]; then
            echo "❌ Build échoué définitivement"
            exit 1
        fi
    fi
fi
echo "✅ Build vérifié avec chemin explicite"

echo "🚀 Démarrage de l'application..."
echo "🎯 Utilisation de npm start pour compilation et démarrage..."

# Démarrer avec npm start qui compile TypeScript et lance le serveur
exec npm start 