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

echo "📦 Vérification des dépendances npm..."
if [ -f "package.json" ]; then
    echo "✅ package.json trouvé"
    
    # Installer les dépendances si node_modules n'existe pas
    if [ ! -d "node_modules" ]; then
        echo "📦 Installation des dépendances npm..."
        npm install
    else
        echo "✅ node_modules existe déjà"
    fi
    
    # Installer TypeScript globalement
    echo "🔧 Installation de TypeScript globalement..."
    npm install -g typescript@latest
    
    # Vérifier l'installation de TypeScript
    if command -v tsc &> /dev/null; then
        echo "✅ TypeScript installé globalement"
        echo "   Version: $(tsc --version)"
    else
        echo "❌ TypeScript non trouvé, installation locale..."
        npm install typescript@latest
    fi
else
    echo "❌ package.json non trouvé"
    exit 1
fi

echo "🔨 Vérification du build..."
if [ ! -f "dist/src/server.js" ]; then
    echo "⚠️ dist/src/server.js manquant, build en cours..."
    
    # Utiliser npx pour s'assurer que tsc est disponible
    npx tsc
    if [ ! -f "dist/src/server.js" ]; then
        echo "❌ Build échoué"
        echo "🔍 Tentative avec npm run build..."
        npm run build
        if [ ! -f "dist/src/server.js" ]; then
            echo "❌ Build échoué définitivement"
            exit 1
        fi
    fi
fi

echo "✅ Build vérifié"

echo "🚀 Démarrage de l'application..."
echo "🎯 Utilisation de npm start pour compilation et démarrage..."

# Démarrer avec npm start qui compile TypeScript et lance le serveur
exec npm start 