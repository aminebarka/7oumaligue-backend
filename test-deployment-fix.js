#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Deployment Fixes...\n');

async function testTypeScriptCompilation() {
  console.log('1️⃣ Testing TypeScript compilation...');
  
  return new Promise((resolve, reject) => {
    const tsc = spawn('npx', ['tsc'], { 
      stdio: 'pipe',
      cwd: __dirname 
    });

    let output = '';
    tsc.stdout.on('data', (data) => output += data);
    tsc.stderr.on('data', (data) => output += data);

    tsc.on('close', (code) => {
      if (code === 0) {
        console.log('✅ TypeScript compilation successful');
        resolve();
      } else {
        console.error('❌ TypeScript compilation failed:');
        console.error(output);
        reject(new Error(`TypeScript compilation failed with code ${code}`));
      }
    });
  });
}

async function testBuildScript() {
  console.log('2️⃣ Testing build script...');
  
  return new Promise((resolve, reject) => {
    const build = spawn('npm', ['run', 'build'], { 
      stdio: 'pipe',
      cwd: __dirname 
    });

    let output = '';
    build.stdout.on('data', (data) => output += data);
    build.stderr.on('data', (data) => output += data);

    build.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Build script successful');
        resolve();
      } else {
        console.error('❌ Build script failed:');
        console.error(output);
        reject(new Error(`Build script failed with code ${code}`));
      }
    });
  });
}

function testCompiledFiles() {
  console.log('3️⃣ Testing compiled files...');
  
  const distPath = path.join(__dirname, 'dist', 'src', 'server.js');
  
  if (fs.existsSync(distPath)) {
    console.log('✅ Compiled server.js exists');
    return true;
  } else {
    console.error('❌ Compiled server.js not found');
    return false;
  }
}

function testDependencies() {
  console.log('4️⃣ Testing dependencies...');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  // Check if kill-port is in dependencies
  if (packageJson.dependencies['kill-port']) {
    console.log('✅ kill-port is in dependencies');
  } else {
    console.error('❌ kill-port not found in dependencies');
    return false;
  }
  
  // Check if typescript is in dependencies
  if (packageJson.dependencies['typescript']) {
    console.log('✅ typescript is in dependencies');
  } else {
    console.error('❌ typescript not found in dependencies');
    return false;
  }
  
  return true;
}

function testStartScripts() {
  console.log('5️⃣ Testing start scripts...');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  if (packageJson.scripts.start === 'node start-prod.js') {
    console.log('✅ start script points to start-prod.js');
  } else {
    console.error('❌ start script not correctly configured');
    return false;
  }
  
  if (packageJson.scripts.build === 'npx tsc') {
    console.log('✅ build script uses npx tsc');
  } else {
    console.error('❌ build script not correctly configured');
    return false;
  }
  
  return true;
}

async function main() {
  try {
    await testTypeScriptCompilation();
    await testBuildScript();
    
    if (!testCompiledFiles()) {
      throw new Error('Compiled files test failed');
    }
    
    if (!testDependencies()) {
      throw new Error('Dependencies test failed');
    }
    
    if (!testStartScripts()) {
      throw new Error('Start scripts test failed');
    }
    
    console.log('\n🎉 All tests passed! Deployment fixes are ready.');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy to Azure');
    console.log('2. Set startup command to "npm start" in Azure Portal');
    console.log('3. Restart the app');
    console.log('4. Check logs for successful startup');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

main(); 