#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

console.log('🚀 === DÉMARRAGE FORCÉ DU SERVEUR ===');
console.log('📅 Date:', new Date().toISOString());
console.log('📁 Répertoire:', process.cwd());

// Fonction pour vérifier si un port est disponible
const checkPort = (port) => new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
        server.close();
        resolve(true);
    });
    server.listen(port);
});

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

async function startServer() {
    console.log('🚀 Démarrage du serveur...');
    console.log('🔧 Variables d\'environnement:');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'non défini');
    console.log('   PORT:', process.env.PORT || 'non défini');
    
    // Déterminer le port à utiliser
    const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 8080 : 5000);
    
    // Vérifier si le port est disponible
    const portAvailable = await checkPort(port);
    if (!portAvailable) {
        console.error(`🚨 Port ${port} est occupé! Tentative avec un port alternatif...`);
        const newPort = process.env.NODE_ENV === 'production' ? 8081 : 5001;
        console.log(`🔄 Utilisation du port de secours: ${newPort}`);
        startApp(newPort);
    } else {
        console.log(`✅ Port ${port} disponible`);
        startApp(port);
    }
}

function startApp(port) {
    console.log(`🎯 Démarrage sur le port ${port}`);
    
    // Démarrer le serveur
    const server = spawn('node', [serverPath], { 
        stdio: 'inherit',
        env: { 
            ...process.env, 
            NODE_ENV: process.env.NODE_ENV || 'production',
            PORT: port.toString()
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