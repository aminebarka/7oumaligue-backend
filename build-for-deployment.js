#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 === BUILD LOCAL POUR DÉPLOIEMENT AZURE ===');

try {
    console.log('\n📦 Étape 1: Nettoyage...');
    
    // Supprimer les anciens builds
    if (fs.existsSync('dist')) {
        execSync('rm -rf dist', { stdio: 'inherit' });
        console.log('✅ Ancien dossier dist supprimé');
    }
    
    console.log('\n📦 Étape 2: Installation des dépendances...');
    execSync('npm install --include=dev', { stdio: 'inherit' });
    console.log('✅ Dépendances installées');
    
    console.log('\n🔨 Étape 3: Build TypeScript...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build TypeScript terminé');
    
    console.log('\n🔍 Étape 4: Vérification du build...');
    if (fs.existsSync('dist/src/server.js')) {
        const stats = fs.statSync('dist/src/server.js');
        console.log('✅ Application compilée trouvée');
        console.log(`   Taille: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`   Date: ${stats.mtime}`);
    } else {
        throw new Error('dist/src/server.js non trouvé après le build');
    }
    
    console.log('\n📋 Étape 5: Vérification des fichiers critiques...');
    const criticalFiles = [
        'startup.sh',
        '.deployment',
        'package.json',
        'dist/src/server.js'
    ];
    
    criticalFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} - OK`);
        } else {
            console.log(`❌ ${file} - MANQUANT`);
        }
    });
    
    console.log('\n🎯 Étape 6: Préparation du déploiement...');
    console.log('📦 Fichiers prêts pour le déploiement :');
    console.log('   - dist/ (application compilée)');
    console.log('   - startup.sh (script de démarrage)');
    console.log('   - .deployment (configuration Azure)');
    console.log('   - package.json (dépendances)');
    
    console.log('\n✅ Build local terminé avec succès !');
    console.log('🚀 Prêt pour le déploiement Azure');
    console.log('\n📋 Prochaines étapes :');
    console.log('   1. git add .');
    console.log('   2. git commit -m "Build local pour déploiement Azure"');
    console.log('   3. git push origin main');
    console.log('   4. Configurer Azure Portal :');
    console.log('      - Startup Command: bash startup.sh');
    console.log('      - SCM_DO_BUILD_DURING_DEPLOYMENT: false');
    
} catch (error) {
    console.error('❌ Erreur lors du build:', error.message);
    process.exit(1);
} 