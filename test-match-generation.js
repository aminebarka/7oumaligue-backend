const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testMatchGeneration() {
  console.log('⚽ Test de génération de matchs entre groupes...\n');

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

    // Test 2: Récupérer les tournois
    console.log('\n2️⃣ Récupération des tournois...');
    try {
      const tournamentsResponse = await axios.get(`${BASE_URL}/tournaments`);
      const tournaments = tournamentsResponse.data?.data || [];
      console.log(`✅ ${tournaments.length} tournois trouvés`);
      
      if (tournaments.length === 0) {
        console.log('❌ Aucun tournoi trouvé');
        console.log('💡 Créez d\'abord un tournoi avec des équipes et des groupes');
        return;
      }

      // Prendre le premier tournoi
      const tournament = tournaments[0];
      console.log(`🎯 Tournoi sélectionné: ${tournament.name} (ID: ${tournament.id})`);

      // Test 3: Vérifier les groupes du tournoi
      console.log('\n3️⃣ Vérification des groupes...');
      try {
        const tournamentResponse = await axios.get(`${BASE_URL}/tournaments/${tournament.id}`);
        const tournamentDetails = tournamentResponse.data?.data;
        
        if (!tournamentDetails.groups || tournamentDetails.groups.length === 0) {
          console.log('❌ Aucun groupe trouvé dans ce tournoi');
          console.log('💡 Ajoutez des groupes au tournoi d\'abord');
          return;
        }

        console.log(`✅ ${tournamentDetails.groups.length} groupes trouvés:`);
        tournamentDetails.groups.forEach(group => {
          const teamCount = group.groupTeams?.length || 0;
          console.log(`   - ${group.name}: ${teamCount} équipes`);
        });

        // Test 4: Générer les matchs
        console.log('\n4️⃣ Génération des matchs...');
        try {
          const generateResponse = await axios.post(`${BASE_URL}/tournaments/${tournament.id}/generate-matches`, {
            matchTime: '15:00'
          });
          
          console.log('✅ Matchs générés avec succès:', {
            message: generateResponse.data?.message,
            totalMatches: generateResponse.data?.data?.totalMatches,
            groupMatches: generateResponse.data?.data?.groupMatches
          });

          // Test 5: Vérifier les matchs créés
          console.log('\n5️⃣ Vérification des matchs créés...');
          try {
            const matchesResponse = await axios.get(`${BASE_URL}/matches?tournamentId=${tournament.id}`);
            const matches = matchesResponse.data?.data || [];
            
            console.log(`✅ ${matches.length} matchs trouvés:`);
            
            matches.forEach((match, index) => {
              console.log(`   ${index + 1}. ${match.homeTeam}`);
              console.log(`      Date: ${match.date}, Heure: ${match.time}`);
              console.log(`      Groupe: ${match.group?.name || 'N/A'}`);
              console.log(`      Status: ${match.status}`);
              console.log(`      HomeTeamId: ${match.homeTeamId}`);
              console.log(`      Relations: HomeTeamRef=${match.homeTeamRef?.name || 'N/A'}`);
              console.log('');
            });

            // Vérifier que les relations fonctionnent
            const matchesWithRelations = matches.filter(m => m.homeTeamRef && m.awayTeamRef);
            console.log(`✅ ${matchesWithRelations.length}/${matches.length} matchs ont des relations correctes`);

          } catch (error) {
            console.log('❌ Erreur lors de la récupération des matchs:', {
              status: error.response?.status,
              message: error.response?.data?.message || error.message
            });
          }

        } catch (error) {
          console.log('❌ Erreur lors de la génération des matchs:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
          });
        }

      } catch (error) {
        console.log('❌ Erreur lors de la récupération des détails du tournoi:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });
      }

    } catch (error) {
      console.log('❌ Erreur lors de la récupération des tournois:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter les tests
testMatchGeneration(); 