require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    console.log('📝 Please create a .env file with your database connection string');
    console.log('   Example: DATABASE_URL="postgresql://username:password@localhost:5432/7oumaligue_db"');
    return;
  }

  console.log('✅ DATABASE_URL found:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@'));
  
  const prisma = new PrismaClient();
  
  try {
    // Test the connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test successful:', result);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Common solutions:');
    console.log('   1. Check if your database server is running');
    console.log('   2. Verify the DATABASE_URL in your .env file');
    console.log('   3. Make sure the database exists');
    console.log('   4. Check your database credentials');
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection(); 