const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createSimpleUser() {
  console.log('👤 Création d\'un compte utilisateur simple...\n');
  
  try {
    // 1. Vérifier que le serveur fonctionne
    console.log('1. Vérification du serveur...');
    try {
      await axios.get(`${BASE_URL}/health`);
      console.log('✅ Serveur accessible');
    } catch (error) {
      console.log('❌ Serveur non accessible. Démarrez le serveur avec: npm run dev');
      return;
    }
    
    // 2. Créer un compte user
    console.log('\n2. Création du compte user...');
    const userData = {
      name: 'Simple User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    };
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, userData);
      console.log('✅ Compte user créé avec succès!');
      console.log('📋 Détails du compte:');
      console.log(`   - Nom: ${registerResponse.data.data.user.name}`);
      console.log(`   - Email: ${registerResponse.data.data.user.email}`);
      console.log(`   - Rôle: ${registerResponse.data.data.user.role}`);
      console.log(`   - Token: ${registerResponse.data.data.token ? 'Présent' : 'Absent'}`);
      
      const token = registerResponse.data.data.token;
      
      // 3. Tester l'accès aux données
      console.log('\n3. Test d\'accès aux données avec le rôle user...');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Test lecture des données (autorisé pour user)
      const endpoints = [
        { name: 'Tournois', url: '/tournaments' },
        { name: 'Équipes', url: '/teams' },
        { name: 'Joueurs', url: '/players' },
        { name: 'Matchs', url: '/matches' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${BASE_URL}${endpoint.url}`, { headers });
          console.log(`✅ ${endpoint.name} accessibles: ${response.data.data?.length || 0} éléments`);
        } catch (error) {
          console.log(`❌ Erreur accès ${endpoint.name}:`, error.response?.data?.error || error.message);
        }
      }
      
      // 4. Tester les restrictions (non autorisé pour user)
      console.log('\n4. Test des restrictions (doit échouer pour user)...');
      
      const restrictedEndpoints = [
        { name: 'Créer tournoi', url: '/tournaments', method: 'post' },
        { name: 'Créer équipe', url: '/teams', method: 'post' },
        { name: 'Créer joueur', url: '/players', method: 'post' }
      ];
      
      for (const endpoint of restrictedEndpoints) {
        try {
          await axios[endpoint.method](`${BASE_URL}${endpoint.url}`, {}, { headers });
          console.log(`⚠️  ${endpoint.name}: Accès autorisé (inattendu pour user)`);
        } catch (error) {
          if (error.response?.status === 403) {
            console.log(`✅ ${endpoint.name}: Accès correctement refusé (403)`);
          } else {
            console.log(`❌ ${endpoint.name}: Erreur inattendue:`, error.response?.status);
          }
        }
      }
      
      console.log('\n🎯 Test terminé!');
      console.log('\n💡 Le compte user peut:');
      console.log('   ✅ Consulter les tournois, équipes, joueurs, matchs');
      console.log('   ❌ Créer ou modifier des données (restrictions correctes)');
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du compte user:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

createSimpleUser().catch(console.error); 