#!/usr/bin/env node

console.log('🔍 === TEST DES DÉPENDANCES CRITIQUES ===');

const requiredDeps = [
    'typescript',
    'ts-node',
    'express',
    'cors',
    'dotenv',
    '@prisma/client'
];

const missingDeps = [];

console.log('📦 Vérification des dépendances...');

requiredDeps.forEach(dep => {
    try {
        require.resolve(dep);
        console.log(`✅ ${dep} - OK`);
    } catch (error) {
        console.log(`❌ ${dep} - MANQUANT`);
        missingDeps.push(dep);
    }
});

console.log('\n🔧 Test de TypeScript...');
try {
    const { execSync } = require('child_process');
    const tscVersion = execSync('npx tsc --version', { encoding: 'utf8' });
    console.log(`✅ TypeScript disponible: ${tscVersion.trim()}`);
} catch (error) {
    console.log('❌ TypeScript non disponible');
    missingDeps.push('typescript');
}

console.log('\n🔧 Test de compilation...');
try {
    const { execSync } = require('child_process');
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ Compilation TypeScript réussie');
} catch (error) {
    console.log('❌ Erreur de compilation TypeScript');
    console.log('   Erreur:', error.message);
}

if (missingDeps.length > 0) {
    console.log('\n❌ Dépendances manquantes:');
    missingDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('\n💡 Solution:');
    console.log('   npm install');
    process.exit(1);
} else {
    console.log('\n✅ Toutes les dépendances sont disponibles !');
    console.log('🚀 Prêt pour le déploiement Azure');
} 