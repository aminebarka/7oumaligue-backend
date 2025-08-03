const axios = require('axios');

async function diagnosticTournament400() {
  console.log('🔍 Diagnostic - Erreur 400 Création Tournoi');
  console.log('===========================================\n');
  
  try {
    // Test 1: Vérifier le serveur
    console.log('1️⃣ Test de connectivité...');
    try {
      const response = await axios.get('http://localhost:5000/api/test');
      console.log('✅ Serveur accessible');
    } catch (error) {
      console.log('❌ Serveur non accessible:', error.message);
      console.log('💡 Démarrez le serveur: npm run dev');
      return;
    }
    
    // Test 2: Vérifier les stades
    console.log('\n2️⃣ Test des stades...');
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
    }
    
    // Test 3: Simuler la création d'un tournoi
    console.log('\n3️⃣ Test de création de tournoi...');
    try {
      const tournamentData = {
        name: "Tournoi Test",
        description: "Tournoi de test",
        startDate: "2024-01-15",
        endDate: "2024-01-20",
        numberOfGroups: 2,
        teamsPerGroup: 4,
        stadium: "Stade Municipal de Douz",
        logo: "🏆",
        maxTeams: 8,
        registrationDeadline: "2024-01-10",
        entryFee: 100,
        prizePool: 1000,
        rules: "Règles standard",
        contactInfo: {
          email: "test@example.com",
          phone: "0123456789"
        }
      };
      
      const response = await axios.post('http://localhost:5000/api/tournaments', tournamentData);
      console.log('✅ Création de tournoi réussie');
      console.log('📊 ID du tournoi:', response.data.data?.id);
    } catch (error) {
      console.log('❌ Erreur création tournoi:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
        console.log('   Message:', error.response.data?.message);
        console.log('   Error:', error.response.data?.error);
      }
    }
    
    console.log('\n🎯 Solutions possibles:');
    console.log('1. Vérifier les données envoyées par le frontend');
    console.log('2. Vérifier les logs du serveur backend');
    console.log('3. Vérifier la validation des données');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

diagnosticTournament400(); 