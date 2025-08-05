#!/bin/bash

echo "🚀 === DÉPLOIEMENT FIX COMPLET AZURE ==="
echo "📅 Date: $(date)"

echo "\n📦 Étape 1: Nettoyage et réinstallation..."
rm -rf node_modules package-lock.json
npm install

echo "\n🔧 Étape 2: Test des dépendances..."
npm run test-deps

echo "\n🔨 Étape 3: Build TypeScript..."
npm run build

echo "\n✅ Étape 4: Test de démarrage..."
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

echo "\n📋 Étape 5: Vérification de la configuration..."
npm run check-startup

echo "\n🚀 Étape 6: Préparation du déploiement..."
git add .
git commit -m "Fix: TypeScript et ts-node dans dependencies - npm start compile et démarre"
git push origin main

echo "\n📊 Étape 7: Configuration Azure requise..."
echo "⚠️ IMPORTANT: Configure le Startup Command dans Azure Portal"
echo "   App Service → Configuration → General Settings"
echo "   Startup Command: bash startup.sh"
echo "   Save + Restart"

echo "\n🎯 Résultat attendu dans les logs Azure:"
echo "   🚀 === DÉMARRAGE AZURE AVEC INSTALLATION COMPLÈTE ==="
echo "   🔧 Désactivation du loader Azure..."
echo "   📦 Installation des dépendances système..."
echo "   ✅ Dépendances système installées"
echo "   🔧 Installation de TypeScript globalement..."
echo "   ✅ TypeScript installé globalement"
echo "   🔨 Vérification du build..."
echo "   ✅ Build vérifié"
echo "   🚀 Démarrage de l'application..."
echo "   > 7oumaligue-backend@1.0.0 start"
echo "   > tsc && node dist/src/server.js"
echo "   ✅ Server running on 0.0.0.0:8080"

echo "\n✅ Déploiement fix complet terminé !"
echo "🔧 Prochaines étapes:"
echo "   1. Configure le Startup Command dans Azure Portal"
echo "   2. Redémarre l'App Service"
echo "   3. Vérifie les logs pour confirmer le succès" 