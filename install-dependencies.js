const path = require('path');
const fs = require('fs');

console.log('🔧 Checking dependencies...');

// Vérifier si node_modules existe déjà
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️ node_modules not found. Installing dependencies...');
  
  // Utiliser execSync de manière conditionnelle
  try {
    const { execSync } = require('child_process');
    execSync('npm install --production=false', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error);
    process.exit(1);
  }
} else {
  console.log('✅ node_modules already exists. Skipping installation.');
}

// Générer le client Prisma
console.log('⚙️ Generating Prisma client...');
try {
  const { execSync } = require('child_process');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Prisma generation failed:', error);
  process.exit(1);
} 