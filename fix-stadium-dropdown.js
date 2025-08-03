const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

async function fixStadiumDropdown() {
  console.log('🔧 Diagnostic et correction de la liste déroulante des stades');
  console.log('=' .repeat(60));
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Vérifier la base de données
    console.log('\n📊 1. Vérification de la base de données...');
    const stadiums = await prisma.stadium.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        capacity: true
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`✅ Stades en base: ${stadiums.length}`);
    
    if (stadiums.length === 0) {
      console.log('⚠️ Aucun stade en base de données');
      console.log('💡 Ajout de stades de test...');
      
      const testStadiums = [
        {
          name: "Stade Municipal de Douz",
          address: "123 Avenue Mohammed V",
          city: "Douz",
          region: "Douz-Settat",
          capacity: 5000,
          fieldCount: 3,
          fieldTypes: ["5v5", "7v7", "11v11"],
          amenities: ["parking", "shower", "cafe"],
          images: ["https://example.com/stadium1.jpg"],
          contactInfo: { phone: "+212-5-22-123456" },
          pricing: { "5v5": 200, "7v7": 300, "default": 250 },
          description: "Stade municipal moderne avec 3 terrains",
          isPartner: true,
          ownerId: 1
        },
        {
          name: "Complexe Sportif Al Amal",
          address: "456 Boulevard Hassan II",
          city: "Douz",
          region: "Douz-Salé-Kénitra",
          capacity: 3000,
          fieldCount: 2,
          fieldTypes: ["5v5", "7v7"],
          amenities: ["parking", "shower", "cafe"],
          images: ["https://example.com/stadium2.jpg"],
          contactInfo: { phone: "+212-5-37-789012" },
          pricing: { "5v5": 150, "7v7": 250, "default": 200 },
          description: "Complexe sportif avec 2 terrains",
          isPartner: false,
          ownerId: 1
        }
      ];
      
      for (const stadium of testStadiums) {
        await prisma.stadium.create({ data: stadium });
        console.log(`✅ Ajouté: ${stadium.name} - ${stadium.city}`);
      }
    } else {
      console.log('📋 Stades disponibles:');
      stadiums.forEach((stadium, index) => {
        console.log(`  ${index + 1}. ${stadium.name} - ${stadium.city}`);
      });
    }
    
    // 2. Tester l'API publique
    console.log('\n🌐 2. Test de l\'API publique...');
    try {
      const response = await axios.get('http://localhost:5000/api/stadiums/public', {
        timeout: 5000
      });
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
      console.log('💡 Le serveur backend n\'est peut-être pas démarré');
    }
    
    // 3. Vérifier le service frontend
    console.log('\n🔧 3. Vérification du service frontend...');
    const frontendServicePath = '../7oumaligue/src/services/advancedApi.ts';
    const fs = require('fs');
    
    if (fs.existsSync(frontendServicePath)) {
      console.log('✅ Service frontend trouvé');
      
      // Vérifier que le service utilise la bonne route
      const serviceContent = fs.readFileSync(frontendServicePath, 'utf8');
      if (serviceContent.includes('/stadiums/public')) {
        console.log('✅ Service utilise la route publique');
      } else {
        console.log('⚠️ Service n\'utilise pas la route publique');
      }
    } else {
      console.log('❌ Service frontend non trouvé');
    }
    
    // 4. Instructions de correction
    console.log('\n📋 Instructions de correction:');
    console.log('1. Démarrer le serveur backend: npm run dev');
    console.log('2. Vérifier que l\'API répond: curl http://localhost:5000/api/stadiums/public');
    console.log('3. Ouvrir l\'application frontend');
    console.log('4. Aller dans Tournois → Créer un Nouveau Tournoi');
    console.log('5. Ouvrir la console (F12) pour voir les logs');
    console.log('6. Vérifier que la liste déroulante affiche les stades');
    
    if (stadiums.length > 0) {
      console.log('\n🎉 Base de données prête !');
      console.log('💡 Le problème vient probablement du serveur backend ou du frontend');
    } else {
      console.log('\n⚠️ Aucun stade en base de données');
      console.log('💡 Ajoutez des stades avec: node add-stadiums.js');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixStadiumDropdown(); 