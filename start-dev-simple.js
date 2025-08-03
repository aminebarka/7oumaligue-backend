const { spawn } = require('child_process');

console.log('🚀 Démarrage du serveur en mode développement simple...');

// Démarrer le serveur avec ts-node en mode développement
const server = spawn('npx', ['ts-node', '--transpile-only', 'src/server.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    TS_NODE_TRANSPILE_ONLY: 'true'
  }
});

server.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage du serveur:', error);
});

server.on('close', (code) => {
  console.log(`🛑 Serveur arrêté avec le code: ${code}`);
});

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.kill('SIGTERM');
  process.exit(0);
}); 