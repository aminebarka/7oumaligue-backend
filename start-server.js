const { spawn, exec } = require('child_process');

console.log('🚀 Démarrage intelligent du serveur backend...\n');

// Fonction pour vérifier si le port 5000 est libre
function checkPort5000() {
  return new Promise((resolve) => {
    exec('netstat -ano | findstr :5000', (error, stdout) => {
      if (error || !stdout) {
        console.log('✅ Port 5000 libre');
        resolve(true);
      } else {
        console.log('⚠️ Port 5000 occupé, tentative de libération...');
        resolve(false);
      }
    });
  });
}

// Fonction pour tuer le processus sur le port 5000
function killProcessOnPort5000() {
  return new Promise((resolve) => {
    exec('netstat -ano | findstr :5000', (error, stdout) => {
      if (error || !stdout) {
        console.log('✅ Aucun processus à arrêter');
        resolve();
        return;
      }
      
      const lines = stdout.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const pidMatch = lastLine.match(/\s+(\d+)$/);
      
      if (pidMatch) {
        const pid = pidMatch[1];
        console.log(`🎯 Arrêt du processus PID: ${pid}`);
        
        exec(`taskkill /PID ${pid} /F`, (killError) => {
          if (killError) {
            console.log('❌ Erreur lors de l\'arrêt:', killError.message);
            console.log('💡 Fermez manuellement le terminal du serveur');
          } else {
            console.log('✅ Processus arrêté');
          }
          resolve();
        });
      } else {
        console.log('❌ Impossible d\'extraire le PID');
        resolve();
      }
    });
  });
}

// Fonction pour démarrer le serveur
function startServer() {
  console.log('📡 Démarrage du serveur backend...');
  
  const server = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true
  });

  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📤 Serveur:', output);
    
    if (output.includes('Server running on port 5000') || output.includes('🚀')) {
      console.log('✅ Serveur démarré avec succès!');
      console.log('🌐 Accessible sur: http://localhost:5000');
      console.log('📋 API Test: http://localhost:5000/api/test');
    }
  });

  server.stderr.on('data', (data) => {
    const error = data.toString();
    console.error('❌ Erreur serveur:', error);
    
    if (error.includes('EADDRINUSE')) {
      console.log('🔧 Port 5000 occupé, redémarrage automatique...');
      setTimeout(async () => {
        await killProcessOnPort5000();
        setTimeout(() => {
          console.log('🔄 Redémarrage du serveur...');
          startServer();
        }, 2000);
      }, 1000);
    }
  });

  server.on('error', (error) => {
    console.error('❌ Erreur de démarrage:', error);
  });

  server.on('close', (code) => {
    console.log(`📴 Serveur fermé avec le code: ${code}`);
  });
}

// Fonction principale
async function main() {
  console.log('🔍 Vérification du port 5000...');
  
  const isPortFree = await checkPort5000();
  
  if (!isPortFree) {
    console.log('🔄 Libération du port 5000...');
    await killProcessOnPort5000();
    
    // Attendre un peu avant de redémarrer
    setTimeout(() => {
      console.log('🚀 Démarrage du serveur...');
      startServer();
    }, 2000);
  } else {
    console.log('🚀 Démarrage du serveur...');
    startServer();
  }
}

// Exécuter le script
main().catch(console.error);