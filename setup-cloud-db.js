const fs = require('fs');
const path = require('path');

console.log('☁️  Setting up cloud database configuration...');

// Cloud database options
const cloudOptions = [
    {
        name: 'Supabase (Free)',
        url: 'postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres',
        instructions: [
            '1. Go to https://supabase.com',
            '2. Create a new project',
            '3. Go to Settings → Database',
            '4. Copy the connection string',
            '5. Replace [YOUR_PASSWORD] and [PROJECT_ID]'
        ]
    },
    {
        name: 'Railway (Free tier)',
        url: 'postgresql://postgres:[PASSWORD]@containers-us-west-[ID].railway.app:5432/railway',
        instructions: [
            '1. Go to https://railway.app',
            '2. Create a new project',
            '3. Add PostgreSQL service',
            '4. Copy the connection string',
            '5. Replace [PASSWORD] and [ID]'
        ]
    },
    {
        name: 'Neon (Free tier)',
        url: 'postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]',
        instructions: [
            '1. Go to https://neon.tech',
            '2. Create a new project',
            '3. Copy the connection string',
            '4. Replace [USER], [PASSWORD], [HOST], [DATABASE]'
        ]
    }
];

console.log('📋 Available cloud database options:');
cloudOptions.forEach((option, index) => {
    console.log(`\n${index + 1}. ${option.name}`);
    console.log(`   URL: ${option.url}`);
    console.log('   Instructions:');
    option.instructions.forEach(instruction => {
        console.log(`     ${instruction}`);
    });
});

console.log('\n💡 Recommendation: Use Supabase (free and easy to set up)');

// Function to update .env with cloud database
function updateWithCloudDB(cloudUrl) {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace DATABASE_URL
    envContent = envContent.replace(
        /DATABASE_URL="[^"]*"/,
        `DATABASE_URL="${cloudUrl}"`
    );
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`\n✅ Updated DATABASE_URL to cloud database`);
    console.log(`🔗 URL: ${cloudUrl.replace(/:[^:@]*@/, ':***@')}`);
}

// Example: Update with a placeholder (user needs to replace with real URL)
const exampleUrl = 'postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres';
updateWithCloudDB(exampleUrl);

console.log('\n📝 Next steps:');
console.log('1. Choose a cloud database provider from the list above');
console.log('2. Set up your database and get the connection string');
console.log('3. Update the DATABASE_URL in .env with your real connection string');
console.log('4. Run: node test-database.js');
console.log('5. Run: npx prisma migrate deploy'); 