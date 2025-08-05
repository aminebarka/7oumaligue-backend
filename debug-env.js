const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging environment variables...');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
console.log('📁 .env file path:', envPath);
console.log('📁 .env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    console.log('📄 .env file content:');
    const content = fs.readFileSync(envPath, 'utf8');
    console.log(content);
    
    // Check for DATABASE_URL
    const lines = content.split('\n');
    const dbUrlLine = lines.find(line => line.startsWith('DATABASE_URL='));
    
    if (dbUrlLine) {
        console.log('✅ DATABASE_URL found in .env');
        const dbUrl = dbUrlLine.replace('DATABASE_URL=', '').replace(/"/g, '');
        console.log('🔗 DATABASE_URL value:', dbUrl.replace(/:[^:@]*@/, ':***@'));
        
        if (!dbUrl || dbUrl === '') {
            console.log('❌ DATABASE_URL is empty!');
        } else {
            console.log('✅ DATABASE_URL has a value');
        }
    } else {
        console.log('❌ DATABASE_URL not found in .env');
    }
} else {
    console.log('❌ .env file does not exist!');
}

// Test dotenv loading
console.log('\n🧪 Testing dotenv loading...');
try {
    require('dotenv').config();
    console.log('✅ dotenv loaded successfully');
    console.log('🔍 process.env.DATABASE_URL:', process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'NOT SET');
} catch (error) {
    console.error('❌ Error loading dotenv:', error.message);
}

// Fix the issue
console.log('\n🔧 Fixing DATABASE_URL...');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    const envContent = `DATABASE_URL="postgresql://ftms_user:password@localhost:5432/ftms_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
NODE_ENV=development`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created');
} else {
    console.log('📝 Updating existing .env file...');
    let content = fs.readFileSync(envPath, 'utf8');
    
    // Remove existing DATABASE_URL line if it exists
    const lines = content.split('\n').filter(line => !line.startsWith('DATABASE_URL='));
    
    // Add correct DATABASE_URL at the beginning
    const newContent = `DATABASE_URL="postgresql://ftms_user:password@localhost:5432/ftms_db"
${lines.join('\n')}`;
    
    fs.writeFileSync(envPath, newContent);
    console.log('✅ .env file updated');
}

// Test again
console.log('\n🧪 Testing after fix...');
require('dotenv').config();
console.log('🔍 process.env.DATABASE_URL:', process.env.DATABASE_URL ? 
    process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'NOT SET');

if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL is now properly set!');
    console.log('🚀 You can now run: npx prisma migrate deploy');
} else {
    console.log('❌ DATABASE_URL is still not set');
} 