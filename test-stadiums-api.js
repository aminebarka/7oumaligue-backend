const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testStadiumsAPI() {
  console.log('🧪 Test des API des stades...\n');

  try {
    // Test 1: Route de test simple
    console.log('1️⃣ Test de la route /api/test...');
    try {
      const testResponse = await axios.get(`${BASE_URL}/test`);
      console.log('✅ Route /api/test fonctionne:', testResponse.data);
    } catch (error) {
      console.log('❌ Route /api/test échoue:', error.message);
    }

    // Test 2: Route de test des stades (sans auth)
    console.log('\n2️⃣ Test de la route /api/stadiums/test...');
    try {
      const stadiumTestResponse = await axios.get(`${BASE_URL}/stadiums/test`);
      console.log('✅ Route /api/stadiums/test fonctionne:', {
        success: stadiumTestResponse.data.success,
        count: stadiumTestResponse.data.data?.length || 0
      });
    } catch (error) {
      console.log('❌ Route /api/stadiums/test échoue:', error.message);
    }

    // Test 3: Route des stades avec auth (sans token)
    console.log('\n3️⃣ Test de la route /api/stadiums (sans token)...');
    try {
      const stadiumsResponse = await axios.get(`${BASE_URL}/stadiums`);
      console.log('✅ Route /api/stadiums fonctionne:', {
        success: stadiumsResponse.data.success,
        count: stadiumsResponse.data.data?.length || 0
      });
    } catch (error) {
      console.log('❌ Route /api/stadiums échoue:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }

    // Test 4: Route des stades avec un token factice
    console.log('\n4️⃣ Test de la route /api/stadiums (avec token factice)...');
    try {
      const stadiumsWithTokenResponse = await axios.get(`${BASE_URL}/stadiums`, {
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });
      console.log('✅ Route /api/stadiums avec token fonctionne');
    } catch (error) {
      console.log('❌ Route /api/stadiums avec token échoue:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter les tests
testStadiumsAPI(); 