#!/usr/bin/env node

const path = require('path');
const { execSync, spawn } = require('child_process');
const fs = require('fs');

const projectRoot = __dirname;

// 1. Vérifier l'existence de TypeScript
const tscPath = path.resolve(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
if (!fs.existsSync(tscPath)) {
  console.error('❌ Critical Error: TypeScript not found in node_modules');
  console.log('📦 Attempting to install dependencies...');
  try {
    execSync('npm install --production=false', { stdio: 'inherit', cwd: projectRoot });
    console.log('✅ Dependencies installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install dependencies:', installError);
    process.exit(1);
  }
}

// 2. Compiler TypeScript si le dossier dist n'existe pas
const distDir = path.resolve(projectRoot, 'dist');
if (!fs.existsSync(distDir)) {
  try {
    console.log('🛠️ Building TypeScript...');
    execSync(`node "${tscPath}"`, { stdio: 'inherit', cwd: projectRoot });
    console.log('✅ TypeScript compiled successfully');
  } catch (buildError) {
    console.error('❌ TypeScript compilation failed');
    process.exit(1);
  }
}

// 3. Démarrer le serveur avec gestion des erreurs
console.log('🚀 Starting server...');
const server = spawn('node', [path.resolve(distDir, 'src', 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' },
  cwd: projectRoot
});

server.on('error', (err) => {
  console.error('❌ Server failed to start:', err);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
  }
}); 