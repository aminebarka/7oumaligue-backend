#!/bin/bash

echo "🧪 Test du script startup.sh..."

# Vérifier que startup.sh existe
if [ ! -f "startup.sh" ]; then
    echo "❌ startup.sh n'existe pas"
    exit 1
fi

# Vérifier que startup.sh est exécutable
if [ ! -x "startup.sh" ]; then
    echo "⚠️ startup.sh n'est pas exécutable, ajout des permissions..."
    chmod +x startup.sh
fi

# Vérifier que dist/src/server.js existe
if [ ! -f "dist/src/server.js" ]; then
    echo "⚠️ dist/src/server.js n'existe pas, build en cours..."
    npm run build
fi

# Vérifier que package.json a le script start
if grep -q '"start"' package.json; then
    echo "✅ package.json a le script start"
else
    echo "❌ package.json n'a pas de script start"
    exit 1
fi

echo "✅ Configuration correcte pour le déploiement Azure"
echo "�� Prêt à déployer !" 