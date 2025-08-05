const path = require('path');
const fs = require('fs');

const dependenciesToCheck = [
  'typescript',
  'ts-node',
  'prisma',
  'kill-port'
];

console.log('🔍 Checking critical dependencies...');

let allDependenciesExist = true;
const nodeModulesPath = path.resolve(__dirname, 'node_modules');

dependenciesToCheck.forEach(dep => {
  const depPath = path.join(nodeModulesPath, dep);
  if (!fs.existsSync(depPath)) {
    console.error(`❌ Missing dependency: ${dep}`);
    allDependenciesExist = false;
  }
});

if (!allDependenciesExist) {
  console.error('🚨 Critical dependencies missing!');
  console.log('💡 Run: npm run install:full');
  process.exit(1);
} else {
  console.log('✅ All critical dependencies are present');
} 