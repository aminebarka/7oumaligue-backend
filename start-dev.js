const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage du serveur 7ouma Ligue...');

// Configuration par défaut si .env n'existe pas
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/7oumaligue';
  console.log('📝 Utilisation de la configuration par défaut pour la base de données');
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = '7ouma-ligue-super-secret-key-2025';
  console.log('🔐 Utilisation de la clé JWT par défaut');
}

if (!process.env.PORT) {
  process.env.PORT = '5000';
  console.log('🌐 Port par défaut: 5000');
}

// Démarrer le serveur avec nodemon
const server = spawn('npx', ['nodemon', '--exec', 'ts-node', '--files', 'src/server.ts'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

server.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage du serveur:', error);
});

server.on('close', (code) => {
  console.log(`🛑 Serveur arrêté avec le code: ${code}`);
});

// Gestion de l'arrêt propre
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