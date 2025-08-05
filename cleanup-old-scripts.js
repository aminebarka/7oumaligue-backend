const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up old diagnostic scripts...\n');

const projectRoot = __dirname;

// Liste des anciens scripts qui peuvent être supprimés
const oldScripts = [
  'analyze-azure-logs.js',
  'check-azure-config.js',
  'check-build.js',
  'check-startup-command.js',
  'configure-azure.js',
  'deploy-to-azure.js',
  'diagnose-azure.js',
  'pre-deploy.js',
  'test-azure-local.sh',
  'test-deployment-fix.js',
  'test-dependencies.js',
  'test-explicit-paths.js',
  'test-startup.js',
  'test-without-docker.js',
  'verify-deployment.js'
];

console.log('📁 Checking for old scripts to remove:');
let removedCount = 0;

oldScripts.forEach(script => {
  const fullPath = path.join(projectRoot, script);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`  🗑️ Removed: ${script}`);
      removedCount++;
    } catch (error) {
      console.log(`  ❌ Failed to remove: ${script}`);
    }
  } else {
    console.log(`  ⏭️ Not found: ${script}`);
  }
});

console.log(`\n📋 Summary:`);
console.log(`  Removed ${removedCount} old scripts`);
console.log(`  Kept ${oldScripts.length - removedCount} scripts (not found)`);

console.log('\n✅ Cleanup completed!');
console.log('📖 The new solution uses:');
console.log('   - install-dependencies.js');
console.log('   - start-prod.js (updated)');
console.log('   - start-dev-robust.js (updated)');
console.log('   - diagnose-dependencies.js');
console.log('   - test-azure-solution.js');
console.log('   - verify-solution.js'); 