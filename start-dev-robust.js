const { execSync } = require('child_process');
const path = require('path');

const projectRoot = __dirname;

try {
  // Tuer le port si nécessaire
  console.log('Clearing port 5000...');
  const killPortPath = path.join(projectRoot, 'node_modules', 'kill-port', 'dist', 'index.js');
  execSync(`node "${killPortPath}" 5000`, { stdio: 'inherit', cwd: projectRoot });
  console.log('✅ Port 5000 cleared');
} catch (error) {
  console.warn('⚠️ Could not clear port 5000, continuing...');
}

// Démarrer le serveur avec ts-node
try {
  console.log('🚀 Starting development server...');
  const tsNodePath = path.join(projectRoot, 'node_modules', 'ts-node', 'dist', 'bin.js');
  const nodemonPath = path.join(projectRoot, 'node_modules', 'nodemon', 'bin', 'nodemon.js');
  
  execSync(`"${nodemonPath}" --exec "${tsNodePath}" --files src/server.ts`, { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
    cwd: projectRoot
  });
} catch (error) {
  console.error('❌ Failed to start development server:', error);
  process.exit(1);
} 