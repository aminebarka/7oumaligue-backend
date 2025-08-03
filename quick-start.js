const { spawn } = require('child_process');

console.log('🚀 Démarrage rapide du serveur...\n');

// Démarrer le serveur
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'inherit' // Afficher directement la sortie
});

serverProcess.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage:', error);
});

serverProcess.on('close', (code) => {
  console.log(`📝 Serveur arrêté avec le code: ${code}`);
}); 