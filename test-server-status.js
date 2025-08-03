const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testServerStatus() {
  console.log('🔍 Test du statut du serveur backend...\n');

  try {
    // Test 1: Route de base
    console.log('1️⃣ Test de la route de base...');
    try {
      const response = await axios.get(`${BASE_URL}/test`);
      console.log('✅ Serveur fonctionne:', response.data);
    } catch (error) {
      console.log('❌ Serveur ne répond pas:', error.message);
      console.log('💡 Assurez-vous que le serveur backend est démarré avec: npm run dev');
      return;
    }

    // Test 2: Route des matchs (sans token)
    console.log('\n2️⃣ Test de la route des matchs (sans token)...');
    try {
      const matchesResponse = await axios.get(`${BASE_URL}/matches`);
      console.log('✅ Route des matchs fonctionne (sans auth)');
    } catch (error) {
      console.log('❌ Route des matchs échoue:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }

    // Test 3: Route des matchs (avec token factice)
    console.log('\n3️⃣ Test de la route des matchs (avec token factice)...');
    try {
      const matchesWithTokenResponse = await axios.get(`${BASE_URL}/matches`, {
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });
      console.log('✅ Route des matchs fonctionne avec token');
    } catch (error) {
      console.log('❌ Route des matchs avec token échoue:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }

    // Test 4: POST des matchs (sans token)
    console.log('\n4️⃣ Test POST des matchs (sans token)...');
    try {
      const createMatchResponse = await axios.post(`${BASE_URL}/matches`, {
        date: '2024-01-15',
        time: '14:00',
        venue: 'Stade Test',
        homeTeam: 'Équipe A',
        awayTeam: 'Équipe B',
        tournamentId: '1'
      });
      console.log('✅ POST des matchs fonctionne (sans auth)');
    } catch (error) {
      console.log('❌ POST des matchs échoue:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }

    // Test 5: POST des matchs (avec token factice)
    console.log('\n5️⃣ Test POST des matchs (avec token factice)...');
    try {
      const createMatchWithTokenResponse = await axios.post(`${BASE_URL}/matches`, {
        date: '2024-01-15',
        time: '14:00',
        venue: 'Stade Test',
        homeTeam: 'Équipe A',
        awayTeam: 'Équipe B',
        tournamentId: '1'
      }, {
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });
      console.log('✅ POST des matchs fonctionne avec token');
    } catch (error) {
      console.log('❌ POST des matchs avec token échoue:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter les tests
testServerStatus(); 