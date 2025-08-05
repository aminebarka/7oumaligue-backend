#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 === TEST SANS DOCKER LOCAL ===');
console.log('📅 Date:', new Date().toISOString());

console.log('\n📋 Vérification de l\'environnement...');

// Vérifier si Docker est disponible
try {
    execSync('docker --version', { stdio: 'pipe' });
    console.log('✅ Docker disponible');
} catch (error) {
    console.log('⚠️  Docker non disponible - tests alternatifs');
}

console.log('\n🔧 Test des dépendances...');

// Vérifier les dépendances critiques
const requiredDeps = [
    'typescript',
    'ts-node',
    'express',
    'cors',
    'dotenv',
    '@prisma/client'
];

const missingDeps = [];

requiredDeps.forEach(dep => {
    try {
        require.resolve(dep);
        console.log(`✅ ${dep} - OK`);
    } catch (error) {
        console.log(`❌ ${dep} - MANQUANT`);
        missingDeps.push(dep);
    }
});

console.log('\n🔨 Test de compilation TypeScript...');
try {
    execSync('./node_modules/.bin/tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ Compilation TypeScript réussie');
} catch (error) {
    console.log('❌ Erreur de compilation TypeScript');
    console.log('   Erreur:', error.message);
}

console.log('\n📦 Test d\'installation...');
try {
    execSync('npm install --include=dev', { stdio: 'pipe' });
    console.log('✅ Installation réussie');
} catch (error) {
    console.log('❌ Erreur lors de l\'installation');
}

console.log('\n🔍 Vérification des fichiers critiques...');
const criticalFiles = [
    'Dockerfile',
    '.dockerignore',
    'package.json',
    'src/server.ts',
    'backend/.github/workflows/deploy-backend.yml'
];

criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} - Trouvé`);
    } else {
        console.log(`❌ ${file} - Manquant`);
    }
});

console.log('\n📊 Résumé :');
console.log('   Dépendances manquantes:', missingDeps.length);
console.log('   Fichiers critiques:', criticalFiles.filter(f => fs.existsSync(f)).length, '/', criticalFiles.length);

if (missingDeps.length === 0) {
    console.log('\n✅ Prêt pour le déploiement Azure !');
    console.log('\n🚀 Prochaines étapes :');
    console.log('   1. Configurer les secrets GitHub :');
    console.log('      - REGISTRY_USERNAME');
    console.log('      - REGISTRY_PASSWORD');
    console.log('   2. Créer Azure Container Registry');
    console.log('   3. Configurer Azure App Service pour Docker');
    console.log('   4. Push vers GitHub pour déclencher le workflow');
} else {
    console.log('\n❌ Problèmes détectés :');
    missingDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('\n💡 Solution : npm install --include=dev');
} 