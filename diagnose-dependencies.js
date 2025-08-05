const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Diagnosing dependencies and binaries...\n');

const projectRoot = __dirname;

// Vérifier les binaires critiques
const criticalBinaries = [
  { name: 'TypeScript', path: 'node_modules/typescript/bin/tsc' },
  { name: 'kill-port', path: 'node_modules/kill-port/dist/index.js' },
  { name: 'ts-node', path: 'node_modules/ts-node/dist/bin.js' },
  { name: 'nodemon', path: 'node_modules/nodemon/bin/nodemon.js' },
  { name: 'prisma', path: 'node_modules/prisma/dist/index.js' }
];

console.log('📦 Checking critical binaries:');
criticalBinaries.forEach(binary => {
  const fullPath = path.join(projectRoot, binary.path);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${binary.name}: ${exists ? 'Found' : 'Missing'} (${binary.path})`);
});

// Vérifier le dossier dist
const distPath = path.join(projectRoot, 'dist');
const distExists = fs.existsSync(distPath);
console.log(`\n📁 Build directory: ${distExists ? '✅ Found' : '❌ Missing'} (dist/)`);

if (distExists) {
  const serverPath = path.join(distPath, 'src', 'server.js');
  const serverExists = fs.existsSync(serverPath);
  console.log(`  Server file: ${serverExists ? '✅ Found' : '❌ Missing'} (dist/src/server.js)`);
}

// Vérifier package.json
const packagePath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`\n📋 Package info:`);
  console.log(`  Name: ${packageJson.name}`);
  console.log(`  Version: ${packageJson.version}`);
  console.log(`  Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
  console.log(`  DevDependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);
}

// Vérifier node_modules
const nodeModulesPath = path.join(projectRoot, 'node_modules');
const nodeModulesExists = fs.existsSync(nodeModulesPath);
console.log(`\n📦 node_modules: ${nodeModulesExists ? '✅ Found' : '❌ Missing'}`);

if (nodeModulesExists) {
  try {
    const nodeModulesSize = execSync('du -sh node_modules', { cwd: projectRoot, encoding: 'utf8' }).trim();
    console.log(`  Size: ${nodeModulesSize}`);
  } catch (error) {
    console.log(`  Size: Unable to determine`);
  }
}

// Vérifier les variables d'environnement
console.log(`\n🌍 Environment:`);
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
console.log(`  PORT: ${process.env.PORT || 'Not set'}`);
console.log(`  Current directory: ${process.cwd()}`);

console.log('\n🔍 Diagnosis complete!'); 