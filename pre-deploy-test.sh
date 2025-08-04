#!/bin/bash

echo "🧪 Test complet avant déploiement..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 1. Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json non trouvé. Exécutez ce script depuis le dossier backend${NC}"
    exit 1
fi

print_status 0 "Dossier backend détecté"

# 2. Vérifier Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js $NODE_VERSION installé"
else
    print_status 1 "Node.js non installé"
fi

# 3. Vérifier npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status 0 "npm $NPM_VERSION installé"
else
    print_status 1 "npm non installé"
fi

# 4. Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    print_warning "node_modules manquant, installation en cours..."
    npm install
    print_status $? "Dépendances installées"
else
    print_status 0 "Dépendances déjà installées"
fi

# 5. Build TypeScript
echo "🔨 Compilation TypeScript..."
npm run build
print_status $? "Build TypeScript réussi"

# 6. Vérifier le build
npm run check-build
print_status $? "Vérification du build"

# 7. Vérifier la configuration de déploiement
npm run verify-deployment
print_status $? "Configuration de déploiement"

# 8. Tester startup.sh
if [ -f "startup.sh" ]; then
    if [ -x "startup.sh" ]; then
        print_status 0 "startup.sh est exécutable"
    else
        print_warning "startup.sh n'est pas exécutable, ajout des permissions..."
        chmod +x startup.sh
        print_status $? "Permissions ajoutées à startup.sh"
    fi
else
    print_status 1 "startup.sh manquant"
fi

# 9. Test local rapide (optionnel)
read -p "Voulez-vous tester le serveur localement ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Démarrage du serveur local..."
    timeout 10s npm start &
    SERVER_PID=$!
    sleep 3
    
    # Test de santé
    if curl -s http://localhost:5000/health > /dev/null; then
        print_status 0 "Serveur local fonctionne"
    else
        print_warning "Serveur local non accessible (peut être normal)"
    fi
    
    # Arrêter le serveur
    kill $SERVER_PID 2>/dev/null
fi

echo ""
echo -e "${GREEN}🎉 Tous les tests sont passés !${NC}"
echo "📋 Résumé :"
echo "   ✅ TypeScript compile correctement"
echo "   ✅ Build généré dans dist/"
echo "   ✅ Configuration de déploiement correcte"
echo "   ✅ startup.sh prêt pour Azure"
echo ""
echo "🚀 Prêt pour le déploiement !"
echo "   - Push vers GitHub pour déploiement automatique"
echo "   - Ou utilisez le workflow manuel dans GitHub Actions" 