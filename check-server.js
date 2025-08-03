const axios = require('axios');

async function checkServer() {
  console.log('🔍 Vérification du serveur...');
  
  try {
    // Test 1: Serveur accessible
    console.log('\n1️⃣ Test de connectivité...');
    try {
      const response = await axios.get('http://localhost:5000/api/test');
      console.log('✅ Serveur accessible');
      console.log('📊 Réponse:', response.data);
    } catch (error) {
      console.log('❌ Serveur non accessible:', error.message);
      console.log('💡 Démarrez le serveur: npm run dev');
      return;
    }
    
    // Test 2: Route des stades
    console.log('\n2️⃣ Test de la route /api/stadiums...');
    try {
      const response = await axios.get('http://localhost:5000/api/stadiums');
      console.log('✅ Route /api/stadiums accessible');
      console.log(`📊 Nombre de stades: ${response.data.data?.length || 0}`);
    } catch (error) {
      console.log('❌ Route /api/stadiums non accessible:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Test 3: Route de test des stades
    console.log('\n3️⃣ Test de la route /api/stadiums/test...');
    try {
      const response = await axios.get('http://localhost:5000/api/stadiums/test');
      console.log('✅ Route /api/stadiums/test accessible');
      console.log('📊 Données:', response.data);
    } catch (error) {
      console.log('❌ Route /api/stadiums/test non accessible:', error.message);
    }
    
    console.log('\n🎯 Solutions:');
    console.log('1. Si le serveur ne répond pas: npm run dev');
    console.log('2. Si les routes ne fonctionnent pas: redémarrer le serveur');
    console.log('3. Si aucun stade: node add-stadiums-simple.js');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

checkServer(); 