#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 === CONFIGURATION AZURE AUTOMATIQUE ===');

try {
    console.log('\n📋 Configuration du Startup Command...');
    
    // Configuration du Startup Command
    const startupCommand = 'az webapp config set --resource-group 7oumaligue-rg --name 7oumaligue-backend --startup-file "bash startup.sh"';
    
    console.log('   Exécution:', startupCommand);
    execSync(startupCommand, { stdio: 'inherit' });
    
    console.log('✅ Startup Command configuré avec succès');
    
    console.log('\n📋 Configuration des paramètres d\'application...');
    
    // Configuration des paramètres d'application
    const appSettings = [
        'WEBSITES_PORT=8080',
        'NODE_ENV=production',
        'AZURE_DEPLOYMENT=true'
    ];
    
    appSettings.forEach(setting => {
        const [key, value] = setting.split('=');
        const command = `az webapp config appsettings set --resource-group 7oumaligue-rg --name 7oumaligue-backend --settings ${key}="${value}"`;
        
        console.log(`   Configuration: ${key}=${value}`);
        execSync(command, { stdio: 'inherit' });
    });
    
    console.log('✅ Paramètres d\'application configurés');
    
    console.log('\n📋 Redémarrage de l\'App Service...');
    
    // Redémarrage de l'App Service
    const restartCommand = 'az webapp restart --resource-group 7oumaligue-rg --name 7oumaligue-backend';
    execSync(restartCommand, { stdio: 'inherit' });
    
    console.log('✅ App Service redémarré');
    
    console.log('\n🎯 Configuration terminée !');
    console.log('📊 Vérification des logs :');
    console.log('   az webapp log tail --resource-group 7oumaligue-rg --name 7oumaligue-backend');
    
} catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    console.log('\n💡 Configuration manuelle requise :');
    console.log('   1. Azure Portal → App Service → 7oumaligue-backend');
    console.log('   2. Configuration → General Settings');
    console.log('   3. Startup Command: bash startup.sh');
    console.log('   4. Save + Restart');
} 