const fs = require('fs');
const path = require('path');

console.log('⚙️ === CONFIGURATION AZURE ===');

// Vérifier si on est en mode Azure
if (process.env.AZURE_DEPLOYMENT) {
    console.log('🌐 Mode Azure détecté');
    
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    // Lire le fichier .env existant s'il existe
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        console.log('📄 Fichier .env existant trouvé');
    } else {
        console.log('📄 Création d\'un nouveau fichier .env');
    }

    // Supprimer les anciennes configurations PORT et NODE_ENV
    envContent = envContent.replace(/PORT=.*\n/g, '');
    envContent = envContent.replace(/NODE_ENV=.*\n/g, '');
    
    // Ajouter les configurations Azure
    envContent += '\n# Azure Configuration\n';
    envContent += 'PORT=8080\n';
    envContent += 'NODE_ENV=production\n';
    envContent += 'AZURE_DEPLOYMENT=true\n';
    
    // Écrire le fichier .env
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Configuration Azure appliquée à .env');
    console.log('   - PORT=8080');
    console.log('   - NODE_ENV=production');
    console.log('   - AZURE_DEPLOYMENT=true');
} else {
    console.log('💻 Mode local détecté');
    console.log('   - Configuration locale préservée');
    console.log('   - PORT=5000 (défaut)');
    console.log('   - NODE_ENV=development (défaut)');
}

// Vérifier la configuration du serveur
const serverPath = path.join(__dirname, 'src', 'server.ts');
if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Vérifier si le serveur écoute sur 0.0.0.0 en production
    if (serverContent.includes('0.0.0.0') && serverContent.includes('production')) {
        console.log('✅ Configuration réseau correcte détectée');
    } else {
        console.log('⚠️ Configuration réseau à vérifier');
    }
} else {
    console.log('❌ Fichier server.ts non trouvé');
}

console.log('🎯 Configuration terminée'); 