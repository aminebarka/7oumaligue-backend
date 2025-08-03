const axios = require('axios');

async function diagnosticStadiums() {
  console.log('🔍 Diagnostic - Problème 404 Stadiums');
  console.log('=====================================\n');
  
  try {
    // Test 1: Vérifier si le serveur répond
    console.log('1️⃣ Test de connectivité du serveur...');
    try {
      const response = await axios.get('http://localhost:5000/api/test', {
        timeout: 3000
      });
      console.log('✅ Serveur accessible');
      console.log('📊 Réponse:', response.data);
    } catch (error) {
      console.log('❌ Serveur non accessible:', error.message);
      console.log('💡 Démarrez le serveur avec: npm run dev');
      return;
    }
    
    // Test 2: Vérifier la route de test des stades
    console.log('\n2️⃣ Test de la route de test des stades...');
    try {
      const response = await axios.get('http://localhost:5000/api/stadiums/test', {
        timeout: 5000
      });
      console.log('✅ Route de test accessible');
      console.log('📊 Données:', response.data);
    } catch (error) {
      console.log('❌ Route de test échouée:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Test 3: Vérifier la route publique des stades
    console.log('\n3️⃣ Test de la route publique des stades...');
    try {
      const response = await axios.get('http://localhost:5000/api/stadiums/public', {
        timeout: 5000
      });
      console.log('✅ Route publique accessible');
      console.log(`📊 Nombre de stades: ${response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('📋 Stades disponibles:');
        response.data.data.forEach((stadium, index) => {
          console.log(`  ${index + 1}. ${stadium.name} - ${stadium.city}`);
        });
      } else {
        console.log('⚠️ Aucun stade via API');
      }
    } catch (error) {
      console.log('❌ Route publique échouée:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Test 4: Vérifier les routes disponibles
    console.log('\n4️⃣ Vérification des routes disponibles...');
    try {
      const response = await axios.get('http://localhost:5000/api/debug/routes', {
        timeout: 5000
      });
      console.log('✅ Routes disponibles:');
      const stadiumRoutes = response.data.routes.filter(route => 
        route.path.includes('stadium')
      );
      stadiumRoutes.forEach(route => {
        console.log(`   ${route.methods.join(',')} ${route.path}`);
      });
    } catch (error) {
      console.log('❌ Impossible de récupérer les routes:', error.message);
    }
    
    console.log('\n🎯 Solutions possibles:');
    console.log('1. Redémarrer le serveur: npm run dev');
    console.log('2. Vérifier que le port 5000 est libre');
    console.log('3. Vérifier les logs du serveur pour les erreurs');
    console.log('4. Tester avec curl: curl http://localhost:5000/api/stadiums/public');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

diagnosticStadiums(); 