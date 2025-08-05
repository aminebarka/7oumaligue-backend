#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting 7ouma Ligue Backend in Development Mode...');

function startDevServer() {
  console.log('🌐 Starting development server on port 5000...');
  
  // Set development environment
  process.env.NODE_ENV = 'development';
  process.env.PORT = '5000';
  
  // Use ts-node for development (no compilation needed)
  const server = spawn('node', ['./node_modules/ts-node/dist/bin.js', '--files', 'src/server.ts'], {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env }
  });

  server.on('error', (error) => {
    console.error('❌ Development server startup error:', error.message);
    process.exit(1);
  });

  server.on('close', (code) => {
    console.log(`🔄 Development server process exited with code ${code}`);
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

startDevServer(); 