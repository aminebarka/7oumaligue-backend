#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 === DÉMARRAGE FORCÉ DU SERVEUR ===');
console.log('📅 Date:', new Date().toISOString());
console.log('📁 Répertoire:', process.cwd());

// Vérifier que le fichier compilé existe
const serverPath = path.join(__dirname, 'dist', 'src', 'server.js');
if (!fs.existsSync(serverPath)) {
    console.log('❌ dist/src/server.js manquant');
    console.log('🔨 Tentative de build...');
    
    const build = spawn('npm', ['run', 'build'], { 
        stdio: 'inherit',
        cwd: __dirname 
    });
    
    build.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Build réussi, démarrage du serveur...');
            startServer();
        } else {
            console.log('❌ Build échoué');
            process.exit(1);
        }
    });
} else {
    console.log('✅ dist/src/server.js trouvé');
    startServer();
}

function startServer() {
    console.log('🚀 Démarrage du serveur...');
    console.log('🔧 Variables d\'environnement:');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'non défini');
    console.log('   PORT:', process.env.PORT || 'non défini');
    
    // Démarrer le serveur
    const server = spawn('node', [serverPath], { 
        stdio: 'inherit',
        env: { 
            ...process.env, 
            NODE_ENV: process.env.NODE_ENV || 'production',
            PORT: process.env.PORT || '8080'
        }
    });
    
    server.on('close', (code) => {
        console.log('🏁 Serveur arrêté avec code:', code);
        process.exit(code);
    });
    
    server.on('error', (error) => {
        console.error('❌ Erreur serveur:', error);
        process.exit(1);
    });
}