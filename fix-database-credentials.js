const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing database credentials...');

// Common PostgreSQL configurations
const configs = [
    {
        name: 'Default PostgreSQL',
        url: 'postgresql://postgres:postgres@localhost:5432/ftms_db'
    },
    {
        name: 'Custom user',
        url: 'postgresql://ftms_user:ftms_password@localhost:5432/ftms_db'
    },
    {
        name: 'No password',
        url: 'postgresql://postgres@localhost:5432/ftms_db'
    },
    {
        name: 'Different database name',
        url: 'postgresql://postgres:postgres@localhost:5432/7oumaligue_db'
    }
];

console.log('📋 Available configurations:');
configs.forEach((config, index) => {
    console.log(`  ${index + 1}. ${config.name}`);
    console.log(`     ${config.url.replace(/:[^:@]*@/, ':***@')}`);
});

// Update .env file with the first configuration
const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace DATABASE_URL with the first configuration
const newDbUrl = configs[0].url;
envContent = envContent.replace(
    /DATABASE_URL="[^"]*"/,
    `DATABASE_URL="${newDbUrl}"`
);

fs.writeFileSync(envPath, envContent, 'utf8');

console.log(`\n✅ Updated DATABASE_URL to: ${newDbUrl.replace(/:[^:@]*@/, ':***@')}`);

// Test the connection
console.log('\n🧪 Testing connection...');
require('dotenv').config();

async function testConnection() {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.$connect();
        console.log('✅ Database connection successful!');
        
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Database query successful:', result);
        
        await prisma.$disconnect();
        console.log('✅ Ready for migrations!');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\n💡 Try these solutions:');
        console.log('   1. Check if PostgreSQL is running');
        console.log('   2. Verify the username/password');
        console.log('   3. Make sure the database exists');
        console.log('   4. Try a different configuration from the list above');
    }
}

testConnection(); 