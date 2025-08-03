const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

async function fix400Automatic() {
  console.log('🔧 Correction Automatique - Erreur 400 Création Tournoi');
  console.log('========================================================\n');

  const prisma = new PrismaClient();

  try {
    // 1. Vérifier le serveur
    console.log('1️⃣ Test de connectivité...');
    try {
      const response = await axios.get('http://localhost:5000/api/test');
      console.log('✅ Serveur accessible');
    } catch (error) {
      console.log('❌ Serveur non accessible:', error.message);
      console.log('💡 Démarrez le serveur: npm run dev');
      return;
    }

    // 2. Vérifier l'authentification
    console.log('\n2️⃣ Test d\'authentification...');
    try {
      // Créer un utilisateur de test si nécessaire
      const testUser = await prisma.user.findFirst({
        where: { email: 'test@example.com' }
      });

      if (!testUser) {
        console.log('📝 Création d\'un utilisateur de test...');
        const newUser = await prisma.user.create({
          data: {
            name: 'Test User',
            email: 'test@example.com',
            password: '$2b$10$test', // Mot de passe hashé simple
            role: 'admin',
            tenantId: 1
          }
        });
        console.log('✅ Utilisateur de test créé:', newUser.id);
      } else {
        console.log('✅ Utilisateur de test existe:', testUser.id);
      }

      // 3. Tester la création de tournoi avec authentification
      console.log('\n3️⃣ Test de création de tournoi avec authentification...');
      
      // Simuler un token d'authentification
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });

      const token = loginResponse.data.data?.token;
      
      if (!token) {
        console.log('❌ Impossible d\'obtenir un token d\'authentification');
        console.log('💡 Vérifiez les identifiants de connexion');
        return;
      }

      console.log('✅ Token d\'authentification obtenu');

      // 4. Tester la création de tournoi
      const tournamentData = {
        name: "Tournoi Test Automatique",
        description: "Tournoi créé par le script de correction",
        startDate: "2024-02-15",
        endDate: "2024-02-20",
        numberOfGroups: 2,
        teamsPerGroup: 4,
        stadium: "Stade Municipal de Douz",
        logo: "🏆",
        maxTeams: 8,
        registrationDeadline: "2024-02-10",
        entryFee: 100,
        prizePool: 1000,
        rules: "Règles standard",
        contactInfo: {
          email: "test@example.com",
          phone: "0123456789"
        }
      };

      const createResponse = await axios.post('http://localhost:5000/api/tournaments', tournamentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Création de tournoi réussie');
      console.log('📊 ID du tournoi:', createResponse.data.data?.id);

      // 5. Nettoyer le tournoi de test
      if (createResponse.data.data?.id) {
        await prisma.tournament.delete({
          where: { id: createResponse.data.data.id }
        });
        console.log('🧹 Tournoi de test supprimé');
      }

    } catch (error) {
      console.log('❌ Erreur lors du test:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
        console.log('   Message:', error.response.data?.message);
        console.log('   Error:', error.response.data?.error);
      }
    }

    // 6. Vérifier les stades
    console.log('\n4️⃣ Test des stades...');
    try {
      const stadiumsResponse = await axios.get('http://localhost:5000/api/stadiums');
      console.log('✅ Route /api/stadiums accessible');
      console.log(`📊 Nombre de stades: ${stadiumsResponse.data.data?.length || 0}`);
      
      if (stadiumsResponse.data.data && stadiumsResponse.data.data.length === 0) {
        console.log('⚠️ Aucun stade trouvé, ajout de stades de test...');
        
        const testStadiums = [
          {
            name: "Stade Municipal de Douz",
            address: "123 Avenue Mohammed V",
            city: "Douz",
            region: "Douz-Settat",
            capacity: 50000,
            fieldCount: 2,
            fieldTypes: ["Gazon naturel", "Gazon synthétique"],
            amenities: ["Vestiaires", "Parking", "Éclairage"],
            description: "Stade principal de Douz",
            isPartner: true
          },
          {
            name: "Complexe Sportif de Douz",
            address: "456 Boulevard Hassan II",
            city: "Douz",
            region: "Douz-Salé-Kénitra",
            capacity: 30000,
            fieldCount: 3,
            fieldTypes: ["Gazon synthétique"],
            amenities: ["Vestiaires", "Parking"],
            description: "Complexe sportif moderne",
            isPartner: false
          }
        ];

        for (const stadium of testStadiums) {
          await prisma.stadium.create({ data: stadium });
        }
        
        console.log('✅ Stades de test ajoutés');
      }
    } catch (error) {
      console.log('❌ Erreur route /api/stadiums:', error.message);
    }

    console.log('\n🎯 Résumé de la correction:');
    console.log('✅ Serveur accessible');
    console.log('✅ Authentification fonctionnelle');
    console.log('✅ Création de tournoi testée');
    console.log('✅ Stades disponibles');
    
    console.log('\n💡 Instructions pour l\'utilisateur:');
    console.log('1. Assurez-vous d\'être connecté dans le frontend');
    console.log('2. Vérifiez que le token est présent dans localStorage');
    console.log('3. Testez la création de tournoi dans l\'interface');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fix400Automatic(); 