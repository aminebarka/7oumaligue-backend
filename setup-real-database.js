const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 Setting up a real database connection...');
console.log('==========================================');

console.log('\n📋 Choose your database option:');
console.log('1. Supabase (Recommended - Free)');
console.log('2. Railway (Free tier)');
console.log('3. Neon (Free tier)');
console.log('4. Local PostgreSQL');
console.log('5. Manual DATABASE_URL input');

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function setupDatabase() {
    const choice = await askQuestion('\nEnter your choice (1-5): ');
    
    let databaseUrl = '';
    
    switch(choice) {
        case '1':
            console.log('\n🔧 Setting up Supabase...');
            console.log('1. Go to https://supabase.com');
            console.log('2. Sign up/Login');
            console.log('3. Create a new project');
            console.log('4. Go to Settings → Database');
            console.log('5. Copy the connection string');
            databaseUrl = await askQuestion('\nPaste your Supabase connection string: ');
            break;
            
        case '2':
            console.log('\n🔧 Setting up Railway...');
            console.log('1. Go to https://railway.app');
            console.log('2. Sign up/Login');
            console.log('3. Create a new project');
            console.log('4. Add PostgreSQL service');
            console.log('5. Copy the connection string');
            databaseUrl = await askQuestion('\nPaste your Railway connection string: ');
            break;
            
        case '3':
            console.log('\n🔧 Setting up Neon...');
            console.log('1. Go to https://neon.tech');
            console.log('2. Sign up/Login');
            console.log('3. Create a new project');
            console.log('4. Copy the connection string');
            databaseUrl = await askQuestion('\nPaste your Neon connection string: ');
            break;
            
        case '4':
            console.log('\n🔧 Setting up Local PostgreSQL...');
            console.log('Make sure PostgreSQL is installed and running');
            databaseUrl = await askQuestion('\nEnter your local PostgreSQL connection string: ');
            break;
            
        case '5':
            console.log('\n🔧 Manual DATABASE_URL input...');
            databaseUrl = await askQuestion('\nEnter your DATABASE_URL: ');
            break;
            
        default:
            console.log('❌ Invalid choice. Please run the script again.');
            rl.close();
            return;
    }
    
    if (databaseUrl.trim()) {
        // Update .env file
        const envPath = path.join(__dirname, '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Replace DATABASE_URL
        envContent = envContent.replace(
            /DATABASE_URL="[^"]*"/,
            `DATABASE_URL="${databaseUrl.trim()}"`
        );
        
        fs.writeFileSync(envPath, envContent, 'utf8');
        
        console.log('\n✅ DATABASE_URL updated successfully!');
        console.log('🔗 URL:', databaseUrl.replace(/:[^:@]*@/, ':***@'));
        
        // Test the connection
        console.log('\n🧪 Testing connection...');
        require('dotenv').config();
        
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            
            await prisma.$connect();
            console.log('✅ Database connection successful!');
            
            const result = await prisma.$queryRaw`SELECT 1 as test`;
            console.log('✅ Database query successful:', result);
            
            await prisma.$disconnect();
            console.log('✅ Ready for migrations!');
            
            console.log('\n🎉 SUCCESS! Your database is configured correctly.');
            console.log('🚀 You can now run: npx prisma migrate deploy');
            
        } catch (error) {
            console.error('❌ Connection failed:', error.message);
            console.log('\n💡 Please check:');
            console.log('   1. The connection string is correct');
            console.log('   2. The database server is accessible');
            console.log('   3. The credentials are valid');
        }
    } else {
        console.log('❌ No DATABASE_URL provided.');
    }
    
    rl.close();
}

setupDatabase(); 