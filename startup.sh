#!/bin/bash

echo "🚀 === DÉMARRAGE DE L'APPLICATION ==="
echo "📅 Date: $(date)"
echo "📁 Répertoire actuel: $(pwd)"
echo "🔍 Contenu du répertoire:"
ls -la

echo ""
echo "📦 Vérification de package.json..."
if [ -f "package.json" ]; then
    echo "✅ package.json trouvé"
    echo "📋 Scripts disponibles:"
    npm run --silent 2>/dev/null || echo "⚠️ Impossible de lister les scripts"
else
    echo "❌ package.json non trouvé"
    exit 1
fi

echo ""
echo "🔨 Vérification du build..."
if [ -f "dist/src/server.js" ]; then
    echo "✅ dist/src/server.js trouvé"
    echo "📏 Taille: $(ls -lh dist/src/server.js | awk '{print $5}')"
else
    echo "❌ dist/src/server.js manquant"
    echo "🔨 Tentative de build..."
    npm run build
    if [ ! -f "dist/src/server.js" ]; then
        echo "❌ Build échoué"
        exit 1
    fi
fi

echo ""
echo "🚀 Démarrage avec npm start..."
echo "🔍 Variables d'environnement:"
echo "   NODE_ENV: ${NODE_ENV:-non défini}"
echo "   PORT: ${PORT:-non défini}"
echo "   PWD: $(pwd)"

# Démarrer l'application
exec npm start 