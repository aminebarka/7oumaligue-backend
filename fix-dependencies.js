const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing dependencies...\n');

const projectRoot = __dirname;

// Supprimer node_modules et package-lock.json
console.log('🧹 Cleaning up...');
try {
  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  const packageLockPath = path.join(projectRoot, 'package-lock.json');
  
  if (fs.existsSync(nodeModulesPath)) {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log('✅ Removed node_modules');
  }
  
  if (fs.existsSync(packageLockPath)) {
    fs.unlinkSync(packageLockPath);
    console.log('✅ Removed package-lock.json');
  }
} catch (error) {
  console.error('❌ Failed to clean up:', error);
}

// Réinstaller les dépendances
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install --production=false', { stdio: 'inherit', cwd: projectRoot });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error);
  process.exit(1);
}

// Générer le client Prisma
console.log('\n⚙️ Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: projectRoot });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Prisma generation failed:', error);
  process.exit(1);
}

// Vérifier les dépendances critiques
console.log('\n🔍 Verifying critical dependencies...');
try {
  execSync('npm run check-deps', { stdio: 'inherit', cwd: projectRoot });
  console.log('✅ All critical dependencies verified');
} catch (error) {
  console.error('❌ Dependency verification failed:', error);
  process.exit(1);
}

console.log('\n🎉 Dependencies fixed successfully!');
console.log('💡 You can now run: npm start'); 