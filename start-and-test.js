const { spawn } = require('child_process');
const axios = require('axios');

async function startServerAndTest() {
  console.log('🚀 Démarrage du serveur backend...');
  
  // Démarrer le serveur
  const server = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });
  
  server.stdout.on('data', (data) => {
    console.log(`📡 Serveur: ${data.toString().trim()}`);
  });
  
  server.stderr.on('data', (data) => {
    console.log(`❌ Erreur serveur: ${data.toString().trim()}`);
  });
  
  // Attendre que le serveur démarre
  console.log('⏳ Attente du démarrage du serveur...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    // Test de connectivité
    console.log('🧪 Test de l\'API...');
    const response = await axios.get('http://localhost:5000/api/test', {
      timeout: 10000
    });
    console.log('✅ Serveur accessible:', response.data);
    
    // Test des stades
    const stadiumsResponse = await axios.get('http://localhost:5000/api/stadiums/public', {
      timeout: 10000
    });
    console.log('✅ API des stades accessible:', stadiumsResponse.data);
    
    console.log('🎉 Tous les tests réussis !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    // Arrêter le serveur
    server.kill();
    console.log('🛑 Serveur arrêté');
  }
}

startServerAndTest(); 