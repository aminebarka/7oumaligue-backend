#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 === FIX PRISMA WINDOWS ===');

try {
    console.log('\n📦 Nettoyage des caches...');
    
    // Supprimer les caches
    if (fs.existsSync('node_modules/.prisma')) {
        execSync('rmdir /s /q node_modules\\.prisma', { stdio: 'inherit' });
        console.log('✅ Cache Prisma supprimé');
    }
    
    if (fs.existsSync('node_modules/@prisma')) {
        execSync('rmdir /s /q node_modules\\@prisma', { stdio: 'inherit' });
        console.log('✅ Cache @prisma supprimé');
    }
    
    console.log('\n📦 Réinstallation de Prisma...');
    execSync('npm install prisma@latest @prisma/client@latest', { stdio: 'inherit' });
    
    console.log('\n🔧 Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('\n✅ Prisma fixé avec succès !');
    
} catch (error) {
    console.error('❌ Erreur lors du fix Prisma:', error.message);
    console.log('\n💡 Solution manuelle :');
    console.log('   1. Fermer tous les éditeurs/terminaux');
    console.log('   2. Supprimer node_modules');
    console.log('   3. npm install');
    console.log('   4. npx prisma generate');
} 