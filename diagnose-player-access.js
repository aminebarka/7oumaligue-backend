const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:5000/api';
const prisma = new PrismaClient();

async function diagnosePlayerAccess() {
  console.log('🔍 Diagnostic complet de l\'accès Player...\n');
  
  try {
    // 1. Vérifier la base de données
    console.log('1. Vérification de la base de données...');
    const tenants = await prisma.tenant.findMany();
    const users = await prisma.user.findMany();
    const teams = await prisma.team.findMany();
    const players = await prisma.player.findMany();
    const tournaments = await prisma.tournament.findMany();
    const matches = await prisma.match.findMany();
    
    console.log('📊 État de la base de données:');
    console.log(`   - Tenants: ${tenants.length}`);
    console.log(`   - Utilisateurs: ${users.length}`);
    console.log(`   - Équipes: ${teams.length}`);
    console.log(`   - Joueurs: ${players.length}`);
    console.log(`   - Tournois: ${tournaments.length}`);
    console.log(`   - Matchs: ${matches.length}`);
    
    if (teams.length === 0 && players.length === 0 && tournaments.length === 0) {
      console.log('\n⚠️  Base de données vide! Ajout de données de test...');
      
      // Créer un tenant par défaut
      const tenant = await prisma.tenant.create({
        data: {
          name: '7ouma Ligue',
          description: 'Ligue de quartier'
        }
      });
      console.log('✅ Tenant créé:', tenant.name);
      
      // Créer des équipes
      const teamsData = [
        { name: 'FC Lions', coachName: 'Coach Ahmed', description: 'Équipe du quartier nord' },
        { name: 'Eagles FC', coachName: 'Coach Youssef', description: 'Équipe du quartier sud' },
        { name: 'Titans United', coachName: 'Coach Karim', description: 'Équipe du quartier est' }
      ];
      
      const createdTeams = [];
      for (const teamData of teamsData) {
        const team = await prisma.team.create({
          data: { ...teamData, tenantId: tenant.id }
        });
        createdTeams.push(team);
        console.log('✅ Équipe créée:', team.name);
      }
      
      // Créer des joueurs
      const playersData = [
        { name: 'Ahmed Ben Ali', position: 'Attaquant', level: 4, age: 25, jerseyNumber: 10, teamId: createdTeams[0].id },
        { name: 'Youssef El Amrani', position: 'Milieu', level: 3, age: 23, jerseyNumber: 8, teamId: createdTeams[0].id },
        { name: 'Karim Mansouri', position: 'Défenseur', level: 4, age: 27, jerseyNumber: 4, teamId: createdTeams[1].id }
      ];
      
      for (const playerData of playersData) {
        const player = await prisma.player.create({
          data: { ...playerData, tenantId: tenant.id }
        });
        console.log('✅ Joueur créé:', player.name);
      }
      
      // Créer un tournoi
      const tournament = await prisma.tournament.create({
        data: {
          name: 'Coupe du Printemps 2025',
          startDate: new Date('2025-03-01'),
          endDate: new Date('2025-04-30'),
          prize: 'Trophée + 5000 DT',
          rules: 'Règlement standard de mini-foot',
          numberOfGroups: 2,
          status: 'active',
          tenantId: tenant.id
        }
      });
      console.log('✅ Tournoi créé:', tournament.name);
      
      // Créer des matchs
      const matchesData = [
        {
          date: new Date('2025-03-15'),
          time: '14:00',
          venue: 'Stade Municipal',
          homeTeam: createdTeams[0].name,
          awayTeam: createdTeams[1].name,
          homeScore: 2,
          awayScore: 1,
          status: 'completed',
          tournamentId: tournament.id,
          tenantId: tenant.id
        }
      ];
      
      for (const matchData of matchesData) {
        const match = await prisma.match.create({
          data: matchData
        });
        console.log('✅ Match créé:', `${match.homeTeam} vs ${match.awayTeam}`);
      }
      
      console.log('\n✅ Données de test ajoutées!');
    } else {
      console.log('\n✅ Base de données contient des données');
    }
    
    // 2. Vérifier le serveur
    console.log('\n2. Vérification du serveur...');
    try {
      await axios.get(`${BASE_URL}/health`);
      console.log('✅ Serveur accessible');
    } catch (error) {
      console.log('❌ Serveur non accessible. Démarrez avec: npm run dev');
      return;
    }
    
    // 3. Créer un compte player de test
    console.log('\n3. Création d\'un compte player de test...');
    const playerData = {
      name: 'Test Player Access',
      email: 'playeraccess@test.com',
      password: 'password123',
      role: 'player'
    };
    
    let token;
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, playerData);
      token = registerResponse.data.data.token;
      console.log('✅ Compte player créé avec le rôle:', registerResponse.data.data.user.role);
    } catch (error) {
      console.log('⚠️  Compte existe déjà, tentative de connexion...');
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: playerData.email,
          password: playerData.password
        });
        token = loginResponse.data.data.token;
        console.log('✅ Connexion réussie avec le rôle:', loginResponse.data.data.user.role);
      } catch (loginError) {
        console.log('❌ Impossible de créer ou connecter le compte de test');
        return;
      }
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 4. Test détaillé de chaque endpoint
    console.log('\n4. Test détaillé des endpoints...');
    
    const endpoints = [
      { name: 'Tournois', url: '/tournaments' },
      { name: 'Équipes', url: '/teams' },
      { name: 'Joueurs', url: '/players' },
      { name: 'Matchs', url: '/matches' }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n🔍 Test de ${endpoint.name}...`);
      try {
        const response = await axios.get(`${BASE_URL}${endpoint.url}`, { headers });
        console.log(`✅ ${endpoint.name} - Status: ${response.status}`);
        console.log(`   - Données reçues: ${response.data.data?.length || 0} éléments`);
        
        if (response.data.data?.length > 0) {
          const firstItem = response.data.data[0];
          if (endpoint.name === 'Tournois') {
            console.log(`   - Premier tournoi: ${firstItem.name} (Status: ${firstItem.status})`);
          } else if (endpoint.name === 'Équipes') {
            console.log(`   - Première équipe: ${firstItem.name} (Coach: ${firstItem.coachName})`);
          } else if (endpoint.name === 'Joueurs') {
            console.log(`   - Premier joueur: ${firstItem.name} (${firstItem.position}, Niveau: ${firstItem.level})`);
          } else if (endpoint.name === 'Matchs') {
            console.log(`   - Premier match: ${firstItem.homeTeam} vs ${firstItem.awayTeam} (${firstItem.homeScore}-${firstItem.awayScore})`);
          }
        } else {
          console.log(`   ⚠️  Aucune donnée trouvée pour ${endpoint.name}`);
        }
        
      } catch (error) {
        console.log(`❌ Erreur ${endpoint.name}:`);
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.error || error.message}`);
        
        if (error.response?.status === 401) {
          console.log(`   - Problème: Token invalide ou expiré`);
        } else if (error.response?.status === 403) {
          console.log(`   - Problème: Permissions insuffisantes`);
        } else if (error.response?.status === 404) {
          console.log(`   - Problème: Endpoint non trouvé`);
        } else if (error.response?.status === 500) {
          console.log(`   - Problème: Erreur serveur`);
        }
      }
    }
    
    // 5. Vérifier les permissions spécifiques
    console.log('\n5. Test des permissions spécifiques...');
    
    // Test création (doit échouer)
    try {
      await axios.post(`${BASE_URL}/tournaments`, {
        name: 'Test Tournament',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        numberOfGroups: 2
      }, { headers });
      console.log('⚠️  Création tournoi autorisée (inattendu pour player)');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Création tournoi correctement refusée (403)');
      } else {
        console.log(`❌ Erreur inattendue création tournoi: ${error.response?.status}`);
      }
    }
    
    // Test modification (doit échouer)
    try {
      await axios.put(`${BASE_URL}/teams/test`, {
        name: 'Test Team Updated'
      }, { headers });
      console.log('⚠️  Modification équipe autorisée (inattendu pour player)');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Modification équipe correctement refusée (403)');
      } else {
        console.log(`❌ Erreur inattendue modification équipe: ${error.response?.status}`);
      }
    }
    
    console.log('\n🎯 Diagnostic terminé!');
    console.log('\n💡 Si vous voyez des erreurs 401/403, le problème est d\'authentification/permissions');
    console.log('💡 Si vous voyez des erreurs 500, le problème est serveur');
    console.log('💡 Si vous voyez 0 données, la base est vide');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosePlayerAccess().catch(console.error); 