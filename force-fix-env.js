const fs = require('fs');
const path = require('path');

console.log('🔧 Force fixing environment variables...');

// Force create a clean .env file
const envPath = path.join(__dirname, '.env');

console.log('📝 Creating clean .env file...');

const envContent = `DATABASE_URL="postgresql://ftms_user:password@localhost:5432/ftms_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=8080
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
LOG_LEVEL="info"`;

// Write the file with explicit encoding
fs.writeFileSync(envPath, envContent, 'utf8');
console.log('✅ .env file created with clean content');

// Verify the file was written correctly
console.log('\n🔍 Verifying .env content:');
const writtenContent = fs.readFileSync(envPath, 'utf8');
console.log('File size:', writtenContent.length, 'characters');
console.log('First line:', writtenContent.split('\n')[0]);

// Test environment variable loading
console.log('\n🧪 Testing environment variable loading...');

// Clear any existing environment variables
delete process.env.DATABASE_URL;
delete process.env.JWT_SECRET;

// Load dotenv
require('dotenv').config({ path: envPath });

console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL value:', process.env.DATABASE_URL ? 
    process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'NOT SET');

if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL is now properly set!');
    console.log('🚀 You can now run: npx prisma migrate deploy');
} else {
    console.log('❌ DATABASE_URL is still not set');
    console.log('🔧 Trying alternative approach...');
    
    // Try setting it directly
    process.env.DATABASE_URL = "postgresql://ftms_user:password@localhost:5432/ftms_db";
    console.log('DATABASE_URL set directly:', !!process.env.DATABASE_URL);
}

// Test Prisma connection
console.log('\n🧪 Testing Prisma connection...');
async function testPrisma() {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.$connect();
        console.log('✅ Prisma connection successful!');
        
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Database query successful:', result);
        
        await prisma.$disconnect();
        console.log('✅ Ready for migrations!');
        
    } catch (error) {
        console.error('❌ Prisma connection failed:', error.message);
        console.log('💡 Please check your database connection');
    }
}

testPrisma(); 