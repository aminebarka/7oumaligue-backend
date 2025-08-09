const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔧 Fixing database connection...');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    
    const envContent = `# Database Configuration
DATABASE_URL="postgresql://ftms_user:password@localhost:5432/ftms_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=8080
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Stripe Configuration (optional)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Logging
LOG_LEVEL="info"
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created!');
} else {
    console.log('✅ .env file exists');
}

// Reload environment variables
require('dotenv').config({ path: envPath });

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set!');
    console.log('📝 Adding DATABASE_URL to .env file...');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const newContent = envContent + '\nDATABASE_URL="postgresql://ftms_user:password@localhost:5432/ftms_db"';
    fs.writeFileSync(envPath, newContent);
    
    // Reload again
    require('dotenv').config({ path: envPath });
    console.log('✅ DATABASE_URL added to .env file');
}

console.log('🔍 Current DATABASE_URL:', process.env.DATABASE_URL ? 
    process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'NOT SET');

// Test Prisma connection
async function testPrisma() {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        console.log('🧪 Testing Prisma connection...');
        await prisma.$connect();
        console.log('✅ Prisma connection successful!');
        
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Database query successful:', result);
        
        await prisma.$disconnect();
        console.log('✅ Ready to run migrations!');
        
    } catch (error) {
        console.error('❌ Prisma connection failed:', error.message);
        console.log('💡 Please check:');
        console.log('   1. Database server is running');
        console.log('   2. DATABASE_URL is correct in .env');
        console.log('   3. Database exists and is accessible');
    }
}

testPrisma(); 