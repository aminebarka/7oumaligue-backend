const axios = require('axios');

async function testStadiums() {
  console.log('🧪 Test Simple - Stades');
  console.log('========================\n');
  
  try {
    // Test 1: Vérifier le serveur
    console.log('1️⃣ Test du serveur...');
    try {
      const response = await axios.get('http://localhost:5000/api/test');
      console.log('✅ Serveur accessible');
    } catch (error) {
      console.log('❌ Serveur non accessible:', error.message);
      console.log('💡 Démarrez le serveur: npm run dev');
      return;
    }
    
    // Test 2: Route simple des stades
    console.log('\n2️⃣ Test de la route /api/stadiums...');
    try {
      const response = await axios.get('http://localhost:5000/api/stadiums');
      console.log('✅ Route /api/stadiums accessible');
      console.log(`📊 Nombre de stades: ${response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('📋 Stades disponibles:');
        response.data.data.forEach((stadium, index) => {
          console.log(`  ${index + 1}. ${stadium.name} - ${stadium.city}`);
        });
      } else {
        console.log('⚠️ Aucun stade trouvé');
        console.log('💡 Ajoutez des stades: node add-stadiums-simple.js');
      }
    } catch (error) {
      console.log('❌ Erreur route /api/stadiums:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    console.log('\n🎯 Instructions:');
    console.log('1. Si aucun stade: node add-stadiums-simple.js');
    console.log('2. Redémarrer le serveur: npm run dev');
    console.log('3. Tester le frontend');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testStadiums(); 