#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Azure Deployment Verification Script\n');

function checkPackageJson() {
  console.log('1️⃣ Checking package.json configuration...');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  // Check build script
  if (packageJson.scripts.build === 'node ./node_modules/typescript/bin/tsc') {
    console.log('✅ Build script correctly configured');
  } else {
    console.error('❌ Build script not correctly configured');
    return false;
  }
  
  // Check start script
  if (packageJson.scripts.start === 'node start-prod.js') {
    console.log('✅ Start script correctly configured');
  } else {
    console.error('❌ Start script not correctly configured');
    return false;
  }
  
  // Check dependencies
  if (packageJson.dependencies['typescript']) {
    console.log('✅ TypeScript in dependencies');
  } else {
    console.error('❌ TypeScript not in dependencies');
    return false;
  }
  
  if (packageJson.dependencies['kill-port']) {
    console.log('✅ kill-port in dependencies');
  } else {
    console.error('❌ kill-port not in dependencies');
    return false;
  }
  
  return true;
}

function checkRequiredFiles() {
  console.log('2️⃣ Checking required files...');
  
  const requiredFiles = [
    'start-prod.js',
    'start-dev-simple.js',
    'test-startup.js',
    'tsconfig.json'
  ];
  
  for (const file of requiredFiles) {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`✅ ${file} exists`);
    } else {
      console.error(`❌ ${file} missing`);
      return false;
    }
  }
  
  return true;
}

function checkAzureConfig() {
  console.log('3️⃣ Checking Azure configuration files...');
  
  const azureFiles = [
    'azure-deploy.yml',
    'web.config',
    'azure.appsettings.json'
  ];
  
  for (const file of azureFiles) {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`✅ ${file} exists`);
    } else {
      console.warn(`⚠️  ${file} missing (may not be critical)`);
    }
  }
  
  return true;
}

function main() {
  console.log('🔍 Verifying Azure deployment readiness...\n');
  
  let allChecksPassed = true;
  
  if (!checkPackageJson()) {
    allChecksPassed = false;
  }
  
  if (!checkRequiredFiles()) {
    allChecksPassed = false;
  }
  
  if (!checkAzureConfig()) {
    allChecksPassed = false;
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allChecksPassed) {
    console.log('🎉 All checks passed! Ready for Azure deployment.');
    console.log('\n📋 Next steps:');
    console.log('1. Commit and push your changes to trigger deployment');
    console.log('2. Set Azure Portal startup command to: npm start');
    console.log('3. Restart the Azure App Service');
    console.log('4. Check Azure logs for successful startup');
  } else {
    console.log('❌ Some checks failed. Please fix the issues above.');
    console.log('\n🔧 Fix the issues and run this script again.');
  }
  
  console.log('\n📖 For detailed instructions, see: AZURE-DEPLOYMENT-COMPLETE-FIX.md');
}

main(); 