const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔍 Verifying complete setup...');

// Check .env file
const envPath = path.join(__dirname, '.env');
console.log('\n📁 Environment file check:');
console.log('  .env exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    const dbUrlLine = lines.find(line => line.startsWith('DATABASE_URL='));
    const jwtLine = lines.find(line => line.startsWith('JWT_SECRET='));
    
    console.log('  DATABASE_URL found:', !!dbUrlLine);
    console.log('  JWT_SECRET found:', !!jwtLine);
    
    if (dbUrlLine) {
        const dbUrl = dbUrlLine.replace('DATABASE_URL=', '').replace(/"/g, '');
        console.log('  DATABASE_URL value:', dbUrl ? dbUrl.replace(/:[^:@]*@/, ':***@') : 'EMPTY');
    }
}

// Check package.json dependencies
console.log('\n📦 Dependencies check:');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredDeps = ['express-validator', 'express-rate-limit', 'canvas'];
    const requiredDevDeps = ['@types/express-validator', '@types/express-rate-limit'];
    
    console.log('  Required dependencies:');
    requiredDeps.forEach(dep => {
        const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
        console.log(`    ${dep}: ${hasDep ? '✅' : '❌'}`);
    });
    
    console.log('  Required dev dependencies:');
    requiredDevDeps.forEach(dep => {
        const hasDep = packageJson.devDependencies && packageJson.devDependencies[dep];
        console.log(`    ${dep}: ${hasDep ? '✅' : '❌'}`);
    });
}

// Check Prisma schema
console.log('\n🗄️  Prisma schema check:');
const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const hasDatasource = schema.includes('datasource db');
    const hasEnvUrl = schema.includes('env("DATABASE_URL")');
    
    console.log('  Schema file exists: ✅');
    console.log('  Datasource defined:', hasDatasource ? '✅' : '❌');
    console.log('  DATABASE_URL env var:', hasEnvUrl ? '✅' : '❌');
}

// Test environment variables
console.log('\n🔧 Environment variables check:');
console.log('  DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('  JWT_SECRET set:', !!process.env.JWT_SECRET);
console.log('  NODE_ENV set:', !!process.env.NODE_ENV);

// Test database connection
console.log('\n🧪 Database connection test:');
async function testDB() {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.$connect();
        console.log('  Database connection: ✅');
        
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('  Database query: ✅');
        
        await prisma.$disconnect();
        console.log('  Prisma client: ✅');
        
    } catch (error) {
        console.log('  Database connection: ❌');
        console.log('  Error:', error.message);
    }
}

testDB().then(() => {
    console.log('\n📋 Summary:');
    console.log('  If all checks pass, your setup should work!');
    console.log('  If any ❌ appear, fix those issues first.');
    console.log('\n🚀 Next steps:');
    console.log('  1. Configure GitHub secrets (DATABASE_URL, JWT_SECRET)');
    console.log('  2. Push to main branch');
    console.log('  3. Check GitHub Actions logs');
}); 