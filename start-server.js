#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting 7ouma Ligue Backend Server...');

// Check if TypeScript is compiled
const distPath = path.join(__dirname, 'dist', 'src', 'server.js');
const srcPath = path.join(__dirname, 'src', 'server.ts');

async function checkAndCompile() {
  try {
    // Check if dist directory exists and has content
    if (!fs.existsSync(distPath)) {
      console.log('📦 TypeScript compilation needed...');
      await compileTypeScript();
    } else {
      console.log('✅ TypeScript already compiled');
    }
  } catch (error) {
    console.log('⚠️  Compilation check failed, attempting to compile...');
    await compileTypeScript();
  }
}

function compileTypeScript() {
  return new Promise((resolve, reject) => {
    console.log('🔨 Compiling TypeScript...');
    const tsc = spawn('npx', ['tsc'], { 
      stdio: 'inherit',
      cwd: __dirname 
    });

    tsc.on('close', (code) => {
      if (code === 0) {
        console.log('✅ TypeScript compilation successful');
        resolve();
      } else {
        console.error('❌ TypeScript compilation failed');
        reject(new Error(`TypeScript compilation failed with code ${code}`));
      }
    });

    tsc.on('error', (error) => {
      console.error('❌ TypeScript compilation error:', error.message);
      reject(error);
    });
  });
}

function startServer() {
  console.log('🌐 Starting server on port 8080...');
  
  // Set production environment
  process.env.NODE_ENV = 'production';
  process.env.PORT = '8080';
  
  const server = spawn('node', [distPath], {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env }
  });

  server.on('error', (error) => {
    console.error('❌ Server startup error:', error.message);
    process.exit(1);
  });

  server.on('close', (code) => {
    console.log(`🔄 Server process exited with code ${code}`);
    if (code !== 0) {
      process.exit(code);
    }
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    server.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    server.kill('SIGINT');
  });
}

async function main() {
  try {
    await checkAndCompile();
    startServer();
  } catch (error) {
    console.error('💥 Startup failed:', error.message);
    process.exit(1);
  }
}

main();