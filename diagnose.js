const http = require('http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseSystem() {
  console.log('🔍 Diagnostic du système...\n');

  // 1. Vérifier les variables d'environnement
  console.log('1. Variables d\'environnement:');
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar}: ${envVar === 'DATABASE_URL' ? 'Définie' : process.env[envVar]}`);
    } else {
      console.log(`   ❌ ${envVar}: Non définie`);
    }
  }

  // 2. Vérifier la connexion à la base de données
  console.log('\n2. Connexion à la base de données:');
  try {
    await prisma.$connect();
    console.log('   ✅ Connexion à la base de données réussie');
    
    // Test des tables principales
    const tenants = await prisma.tenant.findMany({ take: 1 });
    console.log(`   ✅ Table tenants: ${tenants.length} enregistrement(s)`);
    
    const teams = await prisma.team.findMany({ take: 1 });
    console.log(`   ✅ Table teams: ${teams.length} enregistrement(s)`);
    
  } catch (error) {
    console.log('   ❌ Erreur de connexion à la base de données:', error.message);
  }

  // 3. Vérifier si le serveur répond
  console.log('\n3. Test du serveur:');
  const serverUrl = 'http://localhost:5000/health';
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.get(serverUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
    });
    
    console.log(`   ✅ Serveur répond (status: ${response.statusCode})`);
  } catch (error) {
    console.log('   ❌ Serveur non accessible:', error.message);
  }

  // 4. Vérifier les ports utilisés
  console.log('\n4. Ports utilisés:');
  const { exec } = require('child_process');
  
  exec('netstat -ano | findstr :5000', (error, stdout, stderr) => {
    if (stdout) {
      console.log('   ✅ Port 5000 est utilisé');
      console.log('   📋 Détails:', stdout.trim());
    } else {
      console.log('   ❌ Port 5000 n\'est pas utilisé');
    }
  });

  // 5. Recommandations
  console.log('\n5. Recommandations:');
  
  if (!process.env.DATABASE_URL) {
    console.log('   🔧 Exécutez: npm run setup:env');
  }
  
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    console.log('   🔧 Créez un fichier .env avec les variables requises');
  }
  
  console.log('   🔧 Pour démarrer le serveur: npm run dev');
  console.log('   🔧 Pour tester la base de données: npm run test:db');

  await prisma.$disconnect();
}

diagnoseSystem().catch(console.error); 