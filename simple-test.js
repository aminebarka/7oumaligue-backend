const axios = require('axios');

async function simpleTest() {
  console.log('🧪 Test simple de connectivité...');
  
  try {
    // Test 1: Vérifier si le serveur répond
    console.log('1. Test de connectivité au serveur...');
    const response = await axios.get('http://localhost:5000/api/test', {
      timeout: 5000
    });
    console.log('✅ Serveur accessible:', response.data);
    
    // Test 2: Vérifier la base de données
    console.log('2. Test de la base de données...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const stadiums = await prisma.stadium.findMany({
      select: { id: true, name: true, city: true }
    });
    
    console.log('✅ Base de données accessible');
    console.log(`📊 Nombre de stades: ${stadiums.length}`);
    
    if (stadiums.length === 0) {
      console.log('⚠️ Aucun stade trouvé en base. Exécutez: node add-stadiums.js');
    } else {
      stadiums.forEach(stadium => {
        console.log(`  - ${stadium.name} (${stadium.city})`);
      });
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Le serveur n\'est pas démarré. Exécutez: npm run dev');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Impossible de se connecter à localhost:5000');
    } else {
      console.log('💡 Erreur inconnue. Vérifiez les logs du serveur.');
    }
  }
}

simpleTest(); 