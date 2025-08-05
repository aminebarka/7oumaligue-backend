#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting 7ouma Ligue Backend in Production Mode...');

// Check if TypeScript is compiled
const distPath = path.join(__dirname, 'dist', 'src', 'server.js');

async function ensureCompiled() {
  if (!fs.existsSync(distPath)) {
    console.log('📦 TypeScript compilation needed...');
    return new Promise((resolve, reject) => {
      const tsc = spawn('node', ['./node_modules/typescript/bin/tsc'], { 
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
    });
  } else {
    console.log('✅ TypeScript already compiled');
  }
}

function startServer() {
  // Use port 3000 for local testing (Azure will use 8080)
  const port = process.env.PORT || '3000';
  console.log(`🌐 Starting server on port ${port}...`);
  
  // Set production environment
  process.env.NODE_ENV = 'production';
  process.env.PORT = port;
  
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
    await ensureCompiled();
    startServer();
  } catch (error) {
    console.error('💥 Startup failed:', error.message);
    process.exit(1);
  }
}

main(); 