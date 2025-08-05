const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔧 Updating with real Supabase connection...');
console.log('==========================================');

console.log('\n📋 Instructions:');
console.log('1. Go to https://supabase.com');
console.log('2. Create a new project');
console.log('3. Go to Settings → Database');
console.log('4. Copy the Connection string (URI)');
console.log('5. Paste it below');

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function updateSupabase() {
    const databaseUrl = await askQuestion('\nPaste your Supabase connection string: ');
    
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
            console.log('🚀 You can now run: npx prisma migrate dev --name init');
            
        } catch (error) {
            console.error('❌ Connection failed:', error.message);
            console.log('\n💡 Please check:');
            console.log('   1. The connection string is correct');
            console.log('   2. You copied the full URI from Supabase');
            console.log('   3. The project is active in Supabase');
        }
    } else {
        console.log('❌ No DATABASE_URL provided.');
    }
    
    rl.close();
}

updateSupabase(); 