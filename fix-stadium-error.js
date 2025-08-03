const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fixStadiumError() {
  console.log('🔧 Correction de l\'erreur "process is not defined"');
  console.log('=' .repeat(60));
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Vérifier la base de données
    console.log('\n📊 1. Vérification de la base de données...');
    const stadiums = await prisma.stadium.findMany({
      select: {
        id: true,
        name: true,
        city: true
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
    
    // 2. Tester l'API
    console.log('\n🌐 2. Test de l\'API...');
    try {
      const response = await axios.get('http://localhost:5000/api/stadiums/public', {
        timeout: 5000
      });
      console.log('✅ API accessible');
      console.log(`📊 Stades via API: ${response.data.data?.length || 0}`);
    } catch (error) {
      console.log('❌ Erreur API:', error.message);
      console.log('💡 Le serveur backend n\'est peut-être pas démarré');
    }
    
    // 3. Vérifier le fichier frontend
    console.log('\n🔧 3. Vérification du fichier frontend...');
    const frontendPath = path.join(__dirname, '../7oumaligue/src/components/Tournaments/CreateTournamentModal.tsx');
    
    if (fs.existsSync(frontendPath)) {
      console.log('✅ Fichier frontend trouvé');
      
      let content = fs.readFileSync(frontendPath, 'utf8');
      
      // Vérifier si l'erreur process.env est présente
      if (content.includes('process.env')) {
        console.log('⚠️ Référence à process.env détectée');
        console.log('💡 Correction automatique...');
        
        // Remplacer process.env par window.location.origin
        content = content.replace(
          /process\.env\.REACT_APP_API_URL \|\| 'http:\/\/localhost:5000'/g,
          "window.location.origin.replace('3000', '5000')"
        );
        
        fs.writeFileSync(frontendPath, content);
        console.log('✅ Fichier frontend corrigé');
      } else {
        console.log('✅ Aucune référence à process.env trouvée');
      }
    } else {
      console.log('❌ Fichier frontend non trouvé');
    }
    
    // 4. Instructions finales
    console.log('\n📋 Instructions de test:');
    console.log('1. Démarrer le serveur backend: npm run dev');
    console.log('2. Démarrer le frontend: cd ../7oumaligue && npm start');
    console.log('3. Ouvrir l\'application dans le navigateur');
    console.log('4. Aller dans Tournois → Créer un Nouveau Tournoi');
    console.log('5. Vérifier que la liste déroulante affiche les stades');
    
    if (stadiums.length > 0) {
      console.log('\n🎉 Correction terminée !');
      console.log('💡 Le problème "process is not defined" devrait être résolu');
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

fixStadiumError(); 