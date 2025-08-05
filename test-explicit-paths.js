#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 === TEST DES CHEMINS EXPLICITES ===');

const tscPath = './node_modules/.bin/tsc';
const tsNodePath = './node_modules/.bin/ts-node';

console.log('\n📋 Vérification des binaires locaux...');

// Vérifier TypeScript
if (fs.existsSync(tscPath)) {
    console.log('✅ TypeScript trouvé:', tscPath);
    try {
        const version = execSync(`${tscPath} --version`, { encoding: 'utf8' });
        console.log('   Version:', version.trim());
    } catch (error) {
        console.log('❌ Erreur lors de l\'exécution de TypeScript');
    }
} else {
    console.log('❌ TypeScript non trouvé:', tscPath);
}

// Vérifier ts-node
if (fs.existsSync(tsNodePath)) {
    console.log('✅ ts-node trouvé:', tsNodePath);
} else {
    console.log('❌ ts-node non trouvé:', tsNodePath);
}

console.log('\n🔨 Test de compilation avec chemin explicite...');
try {
    execSync(`${tscPath} --noEmit`, { stdio: 'inherit' });
    console.log('✅ Compilation TypeScript réussie avec chemin explicite');
} catch (error) {
    console.log('❌ Erreur de compilation TypeScript');
}

console.log('\n📦 Test d\'installation complète...');
try {
    execSync('npm install --include=dev', { stdio: 'inherit' });
    console.log('✅ Installation complète réussie');
} catch (error) {
    console.log('❌ Erreur lors de l\'installation');
}

console.log('\n🎯 Test de build avec npm run build...');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build réussi avec npm run build');
} catch (error) {
    console.log('❌ Erreur lors du build');
}

console.log('\n📊 Résumé des chemins :');
console.log('   TypeScript:', fs.existsSync(tscPath) ? '✅ Trouvé' : '❌ Manquant');
console.log('   ts-node:', fs.existsSync(tsNodePath) ? '✅ Trouvé' : '❌ Manquant');
console.log('   dist/src/server.js:', fs.existsSync('dist/src/server.js') ? '✅ Trouvé' : '❌ Manquant');

console.log('\n🚀 Prêt pour le déploiement Azure avec chemins explicites !'); 