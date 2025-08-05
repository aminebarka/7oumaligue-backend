#!/bin/bash

echo "🚀 === DÉPLOIEMENT WINDOWS COMPATIBLE ==="
echo "📅 Date: $(date)"

echo "\n📦 Étape 1: Fix Prisma..."
npm run fix-prisma

echo "\n📦 Étape 2: Nettoyage et réinstallation..."
rm -rf node_modules package-lock.json
npm install --include=dev

echo "\n🔧 Étape 3: Test des dépendances..."
npm run test-deps

echo "\n🔨 Étape 4: Build TypeScript..."
npm run build

echo "\n✅ Étape 5: Test de démarrage..."
npm start &
SERVER_PID=$!
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Serveur démarré avec succès"
    kill $SERVER_PID
else
    echo "❌ Erreur de démarrage du serveur"
    exit 1
fi

echo "\n📋 Étape 6: Vérification de la configuration..."
npm run check-startup

echo "\n🚀 Étape 7: Préparation du déploiement..."
git add .
git commit -m "Fix: Windows compatibility - node ./node_modules/.bin/tsc"
git push origin main

echo "\n📊 Étape 8: Configuration Azure requise..."
echo "⚠️ IMPORTANT: Configure le Startup Command dans Azure Portal"
echo "   App Service → Configuration → General Settings"
echo "   Startup Command: bash startup.sh"
echo "   Save + Restart"

echo "\n🎯 Résultat attendu dans les logs Azure:"
echo "   🚀 === DÉMARRAGE AZURE AVEC INSTALLATION COMPLÈTE ==="
echo "   🔧 Désactivation du loader Azure..."
echo "   📦 Installation des dépendances système..."
echo "   ✅ Dépendances système installées"
echo "   📦 Installation complète des dépendances (incluant devDependencies)..."
echo "   ✅ TypeScript installé localement"
echo "   🔨 Build avec chemin explicite..."
echo "   ✅ Build vérifié avec chemin explicite"
echo "   🚀 Démarrage de l'application..."
echo "   > 7oumaligue-backend@1.0.0 start"
echo "   > node ./node_modules/.bin/tsc && node dist/src/server.js"
echo "   ✅ Server running on 0.0.0.0:8080"

echo "\n✅ Déploiement Windows compatible terminé !"
echo "🔧 Prochaines étapes:"
echo "   1. Configure le Startup Command dans Azure Portal"
echo "   2. Redémarre l'App Service"
echo "   3. Vérifie les logs pour confirmer le succès" 