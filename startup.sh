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

echo "🚀 === DÉMARRAGE APPLICATION PRÉ-COMPILÉE ==="
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

echo "📦 Installation des dépendances npm (production uniquement)..."
if [ -f "package.json" ]; then
    echo "✅ package.json trouvé"
    
    # Installer uniquement les dépendances de production
    echo "📦 Installation des dépendances de production..."
    npm install --production
else
    echo "❌ package.json non trouvé"
    exit 1
fi

echo "🔨 Vérification du build pré-compilé..."
if [ -f "dist/src/server.js" ]; then
    echo "✅ Application pré-compilée trouvée"
    echo "   Taille: $(du -h dist/src/server.js | cut -f1)"
else
    echo "❌ Application pré-compilée manquante"
    echo "   Le build doit être fait localement avant le déploiement"
    exit 1
fi
echo "✅ Build pré-compilé vérifié"

echo "🚀 Démarrage de l'application pré-compilée..."
echo "🎯 Démarrage direct du serveur compilé..."

# Démarrer directement le serveur pré-compilé
exec node dist/src/server.js 