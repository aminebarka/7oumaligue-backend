const { exec } = require('child_process');

console.log('🔍 Recherche du processus utilisant le port 5000...');

// Fonction pour tuer le processus sur le port 5000
function killProcessOnPort5000() {
  // Commande pour trouver le PID du processus sur le port 5000
  const findCommand = 'netstat -ano | findstr :5000';
  
  exec(findCommand, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Erreur lors de la recherche:', error.message);
      return;
    }
    
    if (!stdout) {
      console.log('✅ Aucun processus trouvé sur le port 5000');
      console.log('🚀 Vous pouvez maintenant démarrer le serveur avec: npm run dev');
      return;
    }
    
    console.log('📋 Processus trouvés sur le port 5000:');
    console.log(stdout);
    
    // Extraire le PID de la dernière ligne (le plus récent)
    const lines = stdout.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    const pidMatch = lastLine.match(/\s+(\d+)$/);
    
    if (pidMatch) {
      const pid = pidMatch[1];
      console.log(`🎯 Tentative d'arrêt du processus PID: ${pid}`);
      
      // Tuer le processus
      const killCommand = `taskkill /PID ${pid} /F`;
      exec(killCommand, (killError, killStdout, killStderr) => {
        if (killError) {
          console.log('❌ Erreur lors de l\'arrêt du processus:', killError.message);
          console.log('💡 Essayez de fermer manuellement le terminal qui exécute le serveur');
        } else {
          console.log('✅ Processus arrêté avec succès!');
          console.log('🚀 Vous pouvez maintenant démarrer le serveur avec: npm run dev');
        }
      });
    } else {
      console.log('❌ Impossible d\'extraire le PID');
      console.log('💡 Fermez manuellement le terminal qui exécute le serveur backend');
    }
  });
}

// Exécuter la fonction
killProcessOnPort5000(); 