const { exec } = require('child_process');

console.log('🔍 === VÉRIFICATION CONFIGURATION AZURE ===');

// Vérifier la configuration actuelle
exec('az webapp config show --resource-group 7oumaligue-rg --name 7oumaligue-backend --query "appCommandLine"', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ Erreur lors de la vérification:', error.message);
        console.log('💡 Assurez-vous d\'être connecté à Azure CLI: az login');
        return;
    }
    
    const currentCommand = stdout.trim().replace(/"/g, '');
    console.log('📋 Startup Command actuel:', currentCommand || 'Non configuré');
    
    if (currentCommand === 'npm run azure:deploy') {
        console.log('✅ Configuration correcte !');
    } else {
        console.log('⚠️ Configuration incorrecte');
        console.log('🔧 Pour corriger, exécutez :');
        console.log('az webapp config set --resource-group 7oumaligue-rg --name 7oumaligue-backend --startup-command "npm run azure:deploy"');
    }
});

// Vérifier les paramètres d'application
exec('az webapp config appsettings list --resource-group 7oumaligue-rg --name 7oumaligue-backend --query "[?name==\'WEBSITES_PORT\'].value"', (error, stdout, stderr) => {
    if (!error) {
        const port = stdout.trim().replace(/"/g, '');
        console.log('🌐 Port configuré:', port || 'Non configuré');
        
        if (port === '8080') {
            console.log('✅ Port correct !');
        } else {
            console.log('⚠️ Port incorrect, doit être 8080');
        }
    }
});

console.log('📊 Vérification terminée'); 