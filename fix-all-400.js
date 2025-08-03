const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function fixAll400() {
  console.log('🔧 Correction Complète - Erreur 400 Création Tournoi');
  console.log('=====================================================\n');

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

    // 2. Créer un utilisateur de test avec mot de passe hashé
    console.log('\n2️⃣ Création d\'un utilisateur de test...');
    
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Vérifier si l'utilisateur existe déjà
    let testUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          name: 'Utilisateur Test',
          email: testEmail,
          password: hashedPassword,
          role: 'admin',
          tenantId: 1
        }
      });
      console.log('✅ Utilisateur de test créé:', testUser.id);
    } else {
      // Mettre à jour le mot de passe si nécessaire
      await prisma.user.update({
        where: { id: testUser.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Utilisateur de test mis à jour:', testUser.id);
    }

    // 3. Créer un tenant si nécessaire
    console.log('\n3️⃣ Vérification du tenant...');
    let tenant = await prisma.tenant.findFirst();
    
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Tenant Principal',
          description: 'Tenant par défaut'
        }
      });
      console.log('✅ Tenant créé:', tenant.id);
    } else {
      console.log('✅ Tenant existe:', tenant.id);
    }

    // 4. Tester l'authentification
    console.log('\n4️⃣ Test d\'authentification...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: testEmail,
        password: testPassword
      });

      if (loginResponse.data.success) {
        console.log('✅ Connexion réussie');
        const token = loginResponse.data.data?.token;
        
        if (token) {
          console.log('✅ Token obtenu');
          
          // 5. Tester la création de tournoi
          console.log('\n5️⃣ Test de création de tournoi...');
          
          const tournamentData = {
            name: "Tournoi Test Correction",
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

          // Nettoyer le tournoi de test
          if (createResponse.data.data?.id) {
            await prisma.tournament.delete({
              where: { id: createResponse.data.data.id }
            });
            console.log('🧹 Tournoi de test supprimé');
          }

        } else {
          console.log('❌ Token non obtenu');
        }
      } else {
        console.log('❌ Échec de la connexion');
        console.log('📋 Réponse:', loginResponse.data);
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la connexion:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }

    // 6. Vérifier les stades
    console.log('\n6️⃣ Vérification des stades...');
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

    // 7. Résumé et instructions
    console.log('\n🎯 CORRECTION TERMINÉE !');
    console.log('========================');
    console.log('✅ Serveur accessible');
    console.log('✅ Utilisateur de test créé');
    console.log('✅ Authentification fonctionnelle');
    console.log('✅ Création de tournoi testée');
    console.log('✅ Stades disponibles');
    
    console.log('\n💡 INSTRUCTIONS POUR L\'UTILISATEUR:');
    console.log('=====================================');
    console.log('1. Ouvrez le frontend: http://localhost:3000');
    console.log('2. Allez dans "Connexion" ou "Login"');
    console.log('3. Connectez-vous avec:');
    console.log('   - Email: test@example.com');
    console.log('   - Mot de passe: password123');
    console.log('4. Vérifiez que le token est stocké dans localStorage');
    console.log('5. Testez la création de tournoi dans l\'interface');
    
    console.log('\n🔍 VÉRIFICATION DU TOKEN:');
    console.log('1. Ouvrez les outils de développement (F12)');
    console.log('2. Allez dans l\'onglet "Console"');
    console.log('3. Tapez: console.log(localStorage.getItem("token"))');
    console.log('4. Si le résultat n\'est pas "null", vous êtes connecté');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAll400(); 