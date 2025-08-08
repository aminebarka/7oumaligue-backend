const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing backend startup issues...');

// Step 1: Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/7oumaligue_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-for-production-7oumaligue"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=8080
HOST=0.0.0.0
NODE_ENV=production

# API Configuration
API_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS Origins
CORS_ORIGINS="http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://gray-tree-0ae561303.2.azurestaticapps.net"

# Logging
LOG_LEVEL=info
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file already exists');
}

// Step 2: Ensure dependencies are installed
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
}

// Step 3: Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
}

// Step 4: Build the application
console.log('🏗️ Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built');
} catch (error) {
  console.error('❌ Failed to build application:', error.message);
}

// Step 5: Test the server startup
console.log('🧪 Testing server startup...');
try {
  // Test if the server can start without database connection
  const testServer = require('./dist/src/server.js');
  console.log('✅ Server can be imported successfully');
} catch (error) {
  console.error('❌ Server import failed:', error.message);
}

console.log('🎉 Setup complete! You can now start the server with:');
console.log('npm start'); 