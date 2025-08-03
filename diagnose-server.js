const { exec, spawn } = require('child_process');
const axios = require('axios');

async function diagnoseServer() {
  console.log('🔍 Diagnostic du serveur...\n');

  try {
    // 1. Vérifier si le serveur est en cours d'exécution
    console.log('1️⃣ Vérification du serveur...');
    
    try {
      const response = await axios.get('http://localhost:5000/health', { timeout: 5000 });
      console.log('✅ Serveur en cours d\'exécution');
      console.log('📊 Statut:', response.data);
    } catch (error) {
      console.log('❌ Serveur non accessible');
      console.log('💡 Démarrage du serveur...');
      
      // Démarrer le serveur
      const serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      // Attendre que le serveur démarre
      await new Promise((resolve) => {
        serverProcess.stdout.on('data', (data) => {
          const output = data.toString();
          console.log('📝 Serveur:', output.trim());
          if (output.includes('Server running on port 5000') || output.includes('Listening on port 5000')) {
            resolve();
          }
        });

        serverProcess.stderr.on('data', (data) => {
          console.log('❌ Erreur serveur:', data.toString());
        });

        // Timeout après 10 secondes
        setTimeout(() => {
          console.log('⏰ Timeout - serveur non démarré');
          resolve();
        }, 10000);
      });
    }

    // 2. Tester les routes
    console.log('\n2️⃣ Test des routes...');
    
    const routes = [
      { name: 'Health Check', url: 'http://localhost:5000/health', method: 'GET' },
      { name: 'Test API', url: 'http://localhost:5000/api/test', method: 'GET' },
      { name: 'Matches', url: 'http://localhost:5000/api/matches', method: 'GET' },
    ];

    for (const route of routes) {
      try {
        const response = await axios({
          method: route.method,
          url: route.url,
          timeout: 5000
        });
        console.log(`✅ ${route.name}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${route.name}: ${error.response?.status || 'Erreur'}`);
        if (error.response?.data) {
          console.log(`   Détails:`, error.response.data);
        }
      }
    }

    // 3. Test de création de match
    console.log('\n3️⃣ Test de création de match...');
    
    try {
      const matchData = {
        date: '2025-08-02',
        time: '20:00',
        venue: 'Stade Test',
        homeTeam: 'Équipe A',
        tournamentId: 'test-tournament-id'
      };

      const response = await axios.post('http://localhost:5000/api/matches', matchData, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Création de match réussie:', response.status);
    } catch (error) {
      console.log('❌ Erreur création match:', error.response?.status || 'Erreur');
      if (error.response?.data) {
        console.log('   Détails:', error.response.data);
      }
    }

    console.log('\n🎯 Diagnostic terminé!');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

diagnoseServer(); 