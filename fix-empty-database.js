const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixEmptyDatabase() {
  console.log('🔧 Diagnostic et réparation de la base de données...\n');
  
  try {
    // 1. Vérifier l'état actuel
    console.log('📊 État actuel de la base de données:');
    const tenants = await prisma.tenant.findMany();
    const users = await prisma.user.findMany();
    const teams = await prisma.team.findMany();
    const players = await prisma.player.findMany();
    const tournaments = await prisma.tournament.findMany();
    const matches = await prisma.match.findMany();
    
    console.log(`   - Tenants: ${tenants.length}`);
    console.log(`   - Utilisateurs: ${users.length}`);
    console.log(`   - Équipes: ${teams.length}`);
    console.log(`   - Joueurs: ${players.length}`);
    console.log(`   - Tournois: ${tournaments.length}`);
    console.log(`   - Matchs: ${matches.length}`);
    
    // 2. Si la base est vide, créer des données de test
    if (teams.length === 0 && players.length === 0 && tournaments.length === 0) {
      console.log('\n⚠️  Base de données vide! Ajout de données de test...\n');
      
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
        {
          name: 'FC Lions',
          coachName: 'Coach Ahmed',
          description: 'Équipe du quartier nord'
        },
        {
          name: 'Eagles FC', 
          coachName: 'Coach Youssef',
          description: 'Équipe du quartier sud'
        },
        {
          name: 'Titans United',
          coachName: 'Coach Karim', 
          description: 'Équipe du quartier est'
        }
      ];
      
      const createdTeams = [];
      for (const teamData of teamsData) {
        const team = await prisma.team.create({
          data: {
            ...teamData,
            tenantId: tenant.id
          }
        });
        createdTeams.push(team);
        console.log('✅ Équipe créée:', team.name);
      }
      
      // Créer des joueurs
      const playersData = [
        {
          name: 'Ahmed Ben Ali',
          position: 'Attaquant',
          level: 4,
          age: 25,
          jerseyNumber: 10,
          teamId: createdTeams[0].id
        },
        {
          name: 'Youssef El Amrani',
          position: 'Milieu',
          level: 3,
          age: 23,
          jerseyNumber: 8,
          teamId: createdTeams[0].id
        },
        {
          name: 'Karim Mansouri',
          position: 'Défenseur',
          level: 4,
          age: 27,
          jerseyNumber: 4,
          teamId: createdTeams[1].id
        },
        {
          name: 'Sami Ben Salah',
          position: 'Attaquant',
          level: 5,
          age: 24,
          jerseyNumber: 9,
          teamId: createdTeams[1].id
        },
        {
          name: 'Hassan El Kaddouri',
          position: 'Gardien',
          level: 3,
          age: 26,
          jerseyNumber: 1,
          teamId: createdTeams[2].id
        }
      ];
      
      const createdPlayers = [];
      for (const playerData of playersData) {
        const player = await prisma.player.create({
          data: {
            ...playerData,
            tenantId: tenant.id
          }
        });
        createdPlayers.push(player);
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
      
      // Créer des groupes
      const groups = [];
      for (let i = 1; i <= 2; i++) {
        const group = await prisma.group.create({
          data: {
            name: `Groupe ${i}`,
            tournamentId: tournament.id
          }
        });
        groups.push(group);
        console.log('✅ Groupe créé:', group.name);
      }
      
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
          groupId: groups[0].id
        },
        {
          date: new Date('2025-03-20'),
          time: '16:00',
          venue: 'Terrain Municipal',
          homeTeam: createdTeams[1].name,
          awayTeam: createdTeams[2].name,
          homeScore: 0,
          awayScore: 2,
          status: 'completed',
          tournamentId: tournament.id,
          groupId: groups[0].id
        },
        {
          date: new Date('2025-03-25'),
          time: '15:00',
          venue: 'Stade Municipal',
          homeTeam: createdTeams[2].name,
          awayTeam: createdTeams[0].name,
          homeScore: 1,
          awayScore: 1,
          status: 'completed',
          tournamentId: tournament.id,
          groupId: groups[1].id
        }
      ];
      
      for (const matchData of matchesData) {
        const match = await prisma.match.create({
          data: {
            ...matchData,
            tenantId: tenant.id
          }
        });
        console.log('✅ Match créé:', `${match.homeTeam} vs ${match.awayTeam}`);
      }
      
      console.log('\n🎉 Base de données réparée avec succès!');
      console.log('\n📊 Données ajoutées:');
      console.log(`   - 1 Tenant`);
      console.log(`   - ${createdTeams.length} Équipes`);
      console.log(`   - ${createdPlayers.length} Joueurs`);
      console.log(`   - 1 Tournoi`);
      console.log(`   - ${groups.length} Groupes`);
      console.log(`   - ${matchesData.length} Matchs`);
      
    } else {
      console.log('\n✅ La base de données contient déjà des données!');
      console.log('💡 Le problème pourrait être lié aux permissions ou au tenant.');
    }
    
    // 3. Vérifier les utilisateurs et leurs rôles
    console.log('\n👥 Utilisateurs existants:');
    for (const user of users) {
      console.log(`   - ${user.name} (${user.email}) - Rôle: ${user.role}`);
    }
    
    if (users.length === 0) {
      console.log('\n⚠️  Aucun utilisateur trouvé!');
      console.log('💡 Créez un compte via l\'interface web.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmptyDatabase().catch(console.error); 