const { execSync } = require('child_process');
const path = require('path');

try {
  // Tuer le port si nécessaire
  const killPortPath = path.join(__dirname, 'node_modules', 'kill-port', 'dist', 'index.js');
  execSync(`node ${killPortPath} 5000`, { stdio: 'inherit' });
  console.log('✅ Port 5000 cleared');
} catch (error) {
  console.warn('⚠️ Could not clear port 5000, continuing...');
}

// Démarrer le serveur avec ts-node
try {
  const tsNodePath = path.join(__dirname, 'node_modules', 'ts-node', 'dist', 'bin.js');
  const nodemonPath = path.join(__dirname, 'node_modules', 'nodemon', 'bin', 'nodemon.js');
  
  console.log('🚀 Starting development server...');
  execSync(`${nodemonPath} --exec ${tsNodePath} --files src/server.ts`, { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
} catch (error) {
  console.error('❌ Failed to start development server:', error);
  process.exit(1);
} 