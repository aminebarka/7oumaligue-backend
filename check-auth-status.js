const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

async function checkAuthStatus() {
  console.log('🔐 Vérification de l\'état d\'authentification');
  console.log('=============================================\n');

  const prisma = new PrismaClient();

  try {
    // 1. Vérifier les utilisateurs existants
    console.log('1️⃣ Vérification des utilisateurs...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true
      }
    });

    console.log(`📊 Nombre d'utilisateurs: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });

    if (users.length === 0) {
      console.log('⚠️ Aucun utilisateur trouvé, création d\'un utilisateur admin...');
      
      const adminUser = await prisma.user.create({
        data: {
          name: 'Admin Principal',
          email: 'admin@example.com',
          password: '$2b$10$test', // Mot de passe temporaire
          role: 'admin',
          tenantId: 1
        }
      });
      
      console.log('✅ Utilisateur admin créé:', adminUser.id);
    }

    // 2. Vérifier les tenants
    console.log('\n2️⃣ Vérification des tenants...');
    const tenants = await prisma.tenant.findMany();
    console.log(`📊 Nombre de tenants: ${tenants.length}`);
    
    if (tenants.length === 0) {
      console.log('⚠️ Aucun tenant trouvé, création d\'un tenant par défaut...');
      
      const defaultTenant = await prisma.tenant.create({
        data: {
          name: 'Tenant Principal',
          description: 'Tenant par défaut'
        }
      });
      
      console.log('✅ Tenant par défaut créé:', defaultTenant.id);
    }

    // 3. Tester l'authentification
    console.log('\n3️⃣ Test d\'authentification...');
    
    // Essayer de se connecter avec le premier utilisateur
    const testUser = users[0] || await prisma.user.findFirst();
    
    if (testUser) {
      try {
        console.log(`🔑 Tentative de connexion avec: ${testUser.email}`);
        
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email: testUser.email,
          password: 'password123' // Mot de passe par défaut
        });

        if (loginResponse.data.success) {
          console.log('✅ Connexion réussie');
          console.log('📋 Token obtenu:', loginResponse.data.data?.token ? 'Oui' : 'Non');
          
          // Tester la création de tournoi avec le token
          const token = loginResponse.data.data?.token;
          if (token) {
            console.log('\n4️⃣ Test de création de tournoi avec authentification...');
            
            const tournamentData = {
              name: "Tournoi Test Auth",
              startDate: "2024-02-15",
              endDate: "2024-02-20",
              numberOfGroups: 2,
              stadium: "Stade Test"
            };

            try {
              const createResponse = await axios.post('http://localhost:5000/api/tournaments', tournamentData, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              console.log('✅ Création de tournoi réussie avec authentification');
              console.log('📊 ID du tournoi:', createResponse.data.data?.id);

              // Nettoyer le tournoi de test
              if (createResponse.data.data?.id) {
                await prisma.tournament.delete({
                  where: { id: createResponse.data.data.id }
                });
                console.log('🧹 Tournoi de test supprimé');
              }

            } catch (error) {
              console.log('❌ Erreur création tournoi avec token:', error.message);
              if (error.response) {
                console.log('   Status:', error.response.status);
                console.log('   Data:', error.response.data);
              }
            }
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
    }

    // 4. Instructions pour l'utilisateur
    console.log('\n💡 Instructions pour résoudre l\'erreur 400:');
    console.log('1. Ouvrez le frontend: http://localhost:3000');
    console.log('2. Allez dans "Connexion" ou "Login"');
    console.log('3. Connectez-vous avec:');
    console.log('   - Email: admin@example.com');
    console.log('   - Mot de passe: password123');
    console.log('4. Vérifiez que le token est stocké dans localStorage');
    console.log('5. Testez la création de tournoi');

    // 5. Vérifier localStorage dans le navigateur
    console.log('\n🔍 Pour vérifier le token dans le navigateur:');
    console.log('1. Ouvrez les outils de développement (F12)');
    console.log('2. Allez dans l\'onglet "Console"');
    console.log('3. Tapez: console.log(localStorage.getItem("token"))');
    console.log('4. Si le résultat est "null", vous n\'êtes pas connecté');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAuthStatus(); 