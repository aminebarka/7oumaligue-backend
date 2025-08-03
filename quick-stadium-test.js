const axios = require('axios');

async function quickTest() {
  console.log('🧪 Test rapide des stades...');
  
  try {
    // Test route publique
    const response = await axios.get('http://localhost:5000/api/stadiums/public');
    console.log('✅ Route publique fonctionne');
    console.log(`📊 Nombre de stades: ${response.data.data?.length || 0}`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('📋 Stades disponibles:');
      response.data.data.forEach((stadium, index) => {
        console.log(`  ${index + 1}. ${stadium.name} - ${stadium.city}`);
      });
    } else {
      console.log('⚠️ Aucun stade trouvé');
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
    }
  }
}

quickTest(); 