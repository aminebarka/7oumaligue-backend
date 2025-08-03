const { PrismaClient } = require('@prisma/client');

async function getStadiumsFromDB() {
  console.log('🏟️ Récupération des stades depuis la base de données...');
  
  const prisma = new PrismaClient();
  
  try {
    // Récupérer tous les stades
    const stadiums = await prisma.stadium.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        region: true,
        capacity: true,
        fieldCount: true,
        fieldTypes: true,
        amenities: true,
        description: true,
        isPartner: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`📊 Nombre de stades trouvés: ${stadiums.length}`);
    
    if (stadiums.length === 0) {
      console.log('⚠️ Aucun stade trouvé en base de données');
      console.log('💡 Ajoutez des stades avec: node add-stadiums.js');
    } else {
      console.log('\n📋 Liste des stades:');
      stadiums.forEach((stadium, index) => {
        console.log(`\n${index + 1}. ${stadium.name}`);
        console.log(`   📍 Adresse: ${stadium.address}`);
        console.log(`   🏙️ Ville: ${stadium.city}`);
        console.log(`   🏛️ Région: ${stadium.region}`);
        console.log(`   👥 Capacité: ${stadium.capacity} personnes`);
        console.log(`   ⚽ Terrains: ${stadium.fieldCount}`);
        console.log(`   🏟️ Types: ${stadium.fieldTypes?.join(', ') || 'Non spécifié'}`);
        console.log(`   🏢 Équipements: ${stadium.amenities?.join(', ') || 'Non spécifié'}`);
        console.log(`   🤝 Partenaire: ${stadium.isPartner ? 'Oui' : 'Non'}`);
        if (stadium.description) {
          console.log(`   📝 Description: ${stadium.description}`);
        }
        console.log(`   📅 Créé le: ${new Date(stadium.createdAt).toLocaleDateString()}`);
      });
    }
    
    // Test de l'API publique
    console.log('\n🌐 Test de l\'API publique...');
    try {
      const axios = require('axios');
      const response = await axios.get('http://localhost:5000/api/stadiums/public');
      console.log('✅ API publique accessible');
      console.log(`📊 Stades via API: ${response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('📋 Stades via API:');
        response.data.data.forEach((stadium, index) => {
          console.log(`  ${index + 1}. ${stadium.name} - ${stadium.city}`);
        });
      }
    } catch (error) {
      console.log('❌ Erreur API publique:', error.message);
      console.log('💡 Assurez-vous que le serveur est démarré: npm run dev');
    }
    
    console.log('\n🎉 Récupération terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getStadiumsFromDB(); 