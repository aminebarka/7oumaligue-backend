#!/bin/bash

echo "🧹 === NETTOYAGE DES WORKFLOWS OBSOLÈTES ==="
echo "📅 Date: $(date)"

echo "\n📋 Suppression des workflows obsolètes..."

# Supprimer le workflow racine (s'il existe)
if [ -f "../../.github/workflows/deploy-docker.yml" ]; then
    echo "🗑️  Suppression de ../../.github/workflows/deploy-docker.yml"
    rm ../../.github/workflows/deploy-docker.yml
fi

# Supprimer les workflows obsolètes dans backend
if [ -f ".github/workflows/deploy-manual.yml" ]; then
    echo "🗑️  Suppression de .github/workflows/deploy-manual.yml"
    rm .github/workflows/deploy-manual.yml
fi

if [ -f ".github/workflows/main_7oumaligue-backend.yml" ]; then
    echo "🗑️  Suppression de .github/workflows/main_7oumaligue-backend.yml"
    rm .github/workflows/main_7oumaligue-backend.yml
fi

# Supprimer le dossier .github racine s'il est vide
if [ -d "../../.github" ] && [ -z "$(ls -A ../../.github)" ]; then
    echo "🗑️  Suppression du dossier .github racine vide"
    rm -rf ../../.github
fi

echo "\n✅ Nettoyage terminé !"

echo "\n📊 Structure finale des workflows :"
echo "   backend/.github/workflows/"
echo "   └── deploy-backend.yml (seul workflow actif)"

echo "\n🎯 Configuration finale :"
echo "   - Un seul workflow : deploy-backend.yml"
echo "   - Déploiement Docker automatisé"
echo "   - Déclenchement uniquement sur backend/**"
echo "   - Plus de conflits entre workflows"

echo "\n🔧 Prochaines étapes :"
echo "   1. Configurer les secrets GitHub :"
echo "      - REGISTRY_USERNAME"
echo "      - REGISTRY_PASSWORD"
echo "   2. Créer Azure Container Registry"
echo "   3. Configurer Azure App Service pour Docker"
echo "   4. Tester localement : npm run docker-test" 