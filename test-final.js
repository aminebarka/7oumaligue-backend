const fs = require('fs');
const path = require('path');

console.log('🧪 Final test - Verifying everything works...');

// Step 1: Check .env file
console.log('\n1️⃣  Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const hasDbUrl = content.includes('DATABASE_URL=');
    console.log('   .env exists: ✅');
    console.log('   DATABASE_URL present:', hasDbUrl ? '✅' : '❌');
} else {
    console.log('   .env exists: ❌');
}

// Step 2: Load environment variables
console.log('\n2️⃣  Loading environment variables...');
require('dotenv').config();
console.log('   DATABASE_URL loaded:', !!process.env.DATABASE_URL);
console.log('   JWT_SECRET loaded:', !!process.env.JWT_SECRET);

// Step 3: Test Prisma connection
console.log('\n3️⃣  Testing Prisma connection...');
async function testPrisma() {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.$connect();
        console.log('   Database connection: ✅');
        
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('   Database query: ✅');
        
        await prisma.$disconnect();
        console.log('   Prisma client: ✅');
        
        return true;
    } catch (error) {
        console.log('   Database connection: ❌');
        console.log('   Error:', error.message);
        return false;
    }
}

// Step 4: Test Prisma migrations
console.log('\n4️⃣  Testing Prisma migrations...');
async function testMigrations() {
    try {
        const { execSync } = require('child_process');
        console.log('   Running: npx prisma migrate deploy');
        
        const result = execSync('npx prisma migrate deploy', { 
            cwd: __dirname,
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        console.log('   Migrations: ✅');
        return true;
    } catch (error) {
        console.log('   Migrations: ❌');
        console.log('   Error:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    const dbTest = await testPrisma();
    const migrationTest = await testMigrations();
    
    console.log('\n📋 Final Results:');
    console.log('   Database connection:', dbTest ? '✅' : '❌');
    console.log('   Prisma migrations:', migrationTest ? '✅' : '❌');
    
    if (dbTest && migrationTest) {
        console.log('\n🎉 SUCCESS! Everything is working correctly!');
        console.log('🚀 Your backend is ready for deployment.');
    } else {
        console.log('\n⚠️  Some issues remain. Please check the errors above.');
    }
}

runAllTests(); 