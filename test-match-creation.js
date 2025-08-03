const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testMatchCreation() {
  console.log('⚽ Test de création de matchs...\n');

  try {
    // Test 1: Vérifier que le serveur fonctionne
    console.log('1️⃣ Test de la route de base...');
    try {
      const response = await axios.get(`${BASE_URL}/test`);
      console.log('✅ Serveur fonctionne:', response.data);
    } catch (error) {
      console.log('❌ Serveur ne répond pas:', error.message);
      console.log('💡 Démarrez le serveur avec: npm run dev');
      return;
    }

    // Test 2: Récupérer des données réelles pour le test
    console.log('\n2️⃣ Récupération des données de test...');
    let teams = [];
    let tournaments = [];
    let groups = [];

    try {
      // Récupérer les équipes
      const teamsResponse = await axios.get(`${BASE_URL}/teams`);
      teams = teamsResponse.data?.data || [];
      console.log(`✅ ${teams.length} équipes trouvées`);

      // Récupérer les tournois
      const tournamentsResponse = await axios.get(`${BASE_URL}/tournaments`);
      tournaments = tournamentsResponse.data?.data || [];
      console.log(`✅ ${tournaments.length} tournois trouvés`);

      // Récupérer les groupes (si disponibles)
      try {
        const groupsResponse = await axios.get(`${BASE_URL}/groups`);
        groups = groupsResponse.data?.data || [];
        console.log(`✅ ${groups.length} groupes trouvés`);
      } catch (error) {
        console.log('⚠️ Pas de groupes disponibles');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des données:', error.message);
      console.log('💡 Vérifiez que vous avez des équipes et tournois dans la base de données');
      return;
    }

    // Test 3: Créer un match de test avec des données réelles
    console.log('\n3️⃣ Test de création de match...');
    
    if (teams.length < 2) {
      console.log('❌ Pas assez d\'équipes pour créer un match (minimum 2)');
      console.log('💡 Créez d\'abord des équipes dans le frontend');
      return;
    }

    if (tournaments.length === 0) {
      console.log('❌ Aucun tournoi trouvé');
      console.log('💡 Créez d\'abord un tournoi dans le frontend');
      return;
    }

    try {
      const matchData = {
        date: '2024-08-02',
        time: '15:00',
        venue: 'Stade Test',
        homeTeam: teams[0].id,
        tournamentId: tournaments[0].id,
        groupId: groups.length > 0 ? groups[0].id : undefined
      };

      console.log('📤 Données du match:', {
        ...matchData,
        homeTeamName: teams[0].name,
        tournamentName: tournaments[0].name
      });
      
      const createResponse = await axios.post(`${BASE_URL}/matches`, matchData);
      console.log('✅ Match créé avec succès:', {
        id: createResponse.data?.data?.id,
        date: createResponse.data?.data?.date,
        status: createResponse.data?.success
      });
    } catch (error) {
      console.log('❌ Erreur création match:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
      
      // Afficher plus de détails pour le debug
      if (error.response?.data?.message) {
        console.log('🔍 Détails de l\'erreur:', error.response.data.message);
      }
    }

    // Test 4: Récupérer les matchs
    console.log('\n4️⃣ Test de récupération des matchs...');
    try {
      const matchesResponse = await axios.get(`${BASE_URL}/matches`);
      console.log('✅ Matchs récupérés:', {
        count: matchesResponse.data?.data?.length || 0,
        status: matchesResponse.data?.success
      });
    } catch (error) {
      console.log('❌ Erreur récupération matchs:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter les tests
testMatchCreation(); 