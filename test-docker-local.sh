#!/bin/bash

echo "🐳 === TEST DOCKER LOCAL ==="
echo "📅 Date: $(date)"

echo "\n🔨 Étape 1: Build de l'image Docker..."
docker build -t 7oumaligue-backend .

if [ $? -eq 0 ]; then
    echo "✅ Build Docker réussi"
else
    echo "❌ Erreur lors du build Docker"
    exit 1
fi

echo "\n🚀 Étape 2: Test de l'image Docker..."
docker run -d --name test-backend -p 8080:8080 \
    -e NODE_ENV=production \
    -e PORT=8080 \
    7oumaligue-backend

if [ $? -eq 0 ]; then
    echo "✅ Container démarré avec succès"
    
    echo "\n⏳ Attente du démarrage du serveur..."
    sleep 10
    
    echo "\n🔍 Test de connexion..."
    if curl -f http://localhost:8080 > /dev/null 2>&1; then
        echo "✅ Serveur répond sur http://localhost:8080"
    else
        echo "❌ Serveur ne répond pas"
    fi
    
    echo "\n📊 Logs du container:"
    docker logs test-backend
    
    echo "\n🧹 Nettoyage..."
    docker stop test-backend
    docker rm test-backend
    
    echo "✅ Test Docker local terminé avec succès"
else
    echo "❌ Erreur lors du démarrage du container"
    exit 1
fi 