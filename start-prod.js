#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Vérifier si le build existe déjà
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  try {
    console.log('Compiling TypeScript...');
    const tscPath = path.join(__dirname, 'node_modules', 'typescript', 'bin', 'tsc');
    execSync(`node ${tscPath}`, { stdio: 'inherit' });
    console.log('✅ TypeScript compilation successful');
  } catch (error) {
    console.error('❌ TypeScript compilation failed');
    process.exit(1);
  }
}

// Démarrer le serveur
try {
  console.log('🌐 Starting server...');
  require('./dist/src/server');
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
} 