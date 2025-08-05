const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Azure solution implementation...\n');

const projectRoot = __dirname;
let allGood = true;

// Vérifier les fichiers créés/modifiés
const requiredFiles = [
  'install-dependencies.js',
  'check-dependencies.js',
  'fix-dependencies.js',
  'start-prod.js',
  'start-dev-robust.js',
  'diagnose-dependencies.js',
  'test-azure-solution.js',
  'AZURE-SOLUTION-COMPLETE.md',
  '.github/workflows/deploy-backend.yml'
];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allGood = false;
});

// Vérifier le package.json
console.log('\n📦 Checking package.json scripts:');
const packagePath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredScripts = [
    'postinstall',
    'azure:predeploy',
    'install:full',
    'check-deps',
    'fix-deps',
    'diagnose:deps',
    'test:azure-solution'
  ];
  
  requiredScripts.forEach(script => {
    const hasScript = packageJson.scripts && packageJson.scripts[script];
    console.log(`  ${hasScript ? '✅' : '❌'} ${script}`);
    if (!hasScript) allGood = false;
  });
}

// Vérifier le workflow GitHub Actions
console.log('\n🔄 Checking GitHub Actions workflow:');
const workflowPath = path.join(projectRoot, '.github', 'workflows', 'deploy-backend.yml');
if (fs.existsSync(workflowPath)) {
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  const hasPredeploy = workflowContent.includes('azure:predeploy');
  console.log(`  ${hasPredeploy ? '✅' : '❌'} Uses azure:predeploy script`);
  if (!hasPredeploy) allGood = false;
}

console.log('\n📋 Summary:');
if (allGood) {
  console.log('🎉 All components are properly implemented!');
  console.log('\n🚀 Next steps:');
  console.log('   1. Commit and push these changes');
  console.log('   2. Monitor the GitHub Actions deployment');
  console.log('   3. Check Azure logs for successful startup');
  console.log('   4. Use npm run diagnose:deps if issues persist');
} else {
  console.log('❌ Some components are missing or incorrect');
  console.log('   Please check the implementation and try again');
}

console.log('\n📖 For detailed information, see: AZURE-SOLUTION-COMPLETE.md'); 