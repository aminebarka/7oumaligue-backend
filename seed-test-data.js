const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Ajout de données de test...\n');
  
  try {
    // 1. Créer un tenant de test
    console.log('1. Création du tenant...');
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Organization',
      },
    });
    console.log('✅ Tenant créé:', tenant.name);

    // 2. Créer des équipes de test
    console.log('\n2. Création des équipes...');
    const teams = await Promise.all([
      prisma.team.create({
        data: {
          name: 'FC Lions',
          coachName: 'Coach Ahmed',
          players: ['Joueur 1', 'Joueur 2', 'Joueur 3'],
          wins: 5,
          draws: 2,
          losses: 1,
          goalsScored: 15,
          matchesPlayed: 8,
          tenantId: tenant.id,
        },
      }),
      prisma.team.create({
        data: {
          name: 'Eagles FC',
          coachName: 'Coach Youssef',
          players: ['Joueur 4', 'Joueur 5', 'Joueur 6'],
          wins: 4,
          draws: 3,
          losses: 1,
          goalsScored: 12,
          matchesPlayed: 8,
          tenantId: tenant.id,
        },
      }),
      prisma.team.create({
        data: {
          name: 'Titans United',
          coachName: 'Coach Karim',
          players: ['Joueur 7', 'Joueur 8', 'Joueur 9'],
          wins: 6,
          draws: 1,
          losses: 1,
          goalsScored: 18,
          matchesPlayed: 8,
          tenantId: tenant.id,
        },
      }),
    ]);
    console.log('✅ Équipes créées:', teams.length);

    // 3. Créer des joueurs de test
    console.log('\n3. Création des joueurs...');
    const players = await Promise.all([
      prisma.player.create({
        data: {
          name: 'Ahmed Ben Ali',
          position: 'Attaquant',
          level: 4,
          age: 25,
          jerseyNumber: 10,
          tenantId: tenant.id,
        },
      }),
      prisma.player.create({
        data: {
          name: 'Youssef El Amrani',
          position: 'Milieu',
          level: 3,
          age: 23,
          jerseyNumber: 8,
          tenantId: tenant.id,
        },
      }),
      prisma.player.create({
        data: {
          name: 'Karim Mansouri',
          position: 'Défenseur',
          level: 4,
          age: 27,
          jerseyNumber: 4,
          tenantId: tenant.id,
        },
      }),
    ]);
    console.log('✅ Joueurs créés:', players.length);

    // 4. Créer un tournoi de test
    console.log('\n4. Création du tournoi...');
    const tournament = await prisma.tournament.create({
      data: {
        name: 'Coupe du Printemps 2025',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-04-30'),
        prize: 'Trophée + 5000 DT',
        rules: 'Règlement standard de mini-foot',
        status: 'active',
        numberOfGroups: 2,
        drawCompleted: true,
        tenantId: tenant.id,
      },
    });
    console.log('✅ Tournoi créé:', tournament.name);

    // 5. Créer des groupes
    console.log('\n5. Création des groupes...');
    const groups = await Promise.all([
      prisma.group.create({
        data: {
          name: 'Groupe A',
          tournamentId: tournament.id,
          tenantId: tenant.id,
        },
      }),
      prisma.group.create({
        data: {
          name: 'Groupe B',
          tournamentId: tournament.id,
          tenantId: tenant.id,
        },
      }),
    ]);
    console.log('✅ Groupes créés:', groups.length);

    // 6. Ajouter des équipes aux groupes
    console.log('\n6. Ajout des équipes aux groupes...');
    await Promise.all([
      prisma.groupTeam.create({
        data: {
          groupId: groups[0].id,
          teamId: teams[0].id,
          tenantId: tenant.id,
        },
      }),
      prisma.groupTeam.create({
        data: {
          groupId: groups[0].id,
          teamId: teams[1].id,
          tenantId: tenant.id,
        },
      }),
      prisma.groupTeam.create({
        data: {
          groupId: groups[1].id,
          teamId: teams[2].id,
          tenantId: tenant.id,
        },
      }),
    ]);
    console.log('✅ Équipes ajoutées aux groupes');

    // 7. Créer des matchs de test
    console.log('\n7. Création des matchs...');
    const matches = await Promise.all([
      prisma.match.create({
        data: {
          date: new Date('2025-03-15'),
          time: '14:00',
          venue: 'Stade Municipal',
          homeTeam: teams[0].id,
          awayTeam: teams[1].id,
          homeScore: 2,
          awayScore: 1,
          status: 'completed',
          tournamentId: tournament.id,
          groupId: groups[0].id,
          tenantId: tenant.id,
        },
      }),
      prisma.match.create({
        data: {
          date: new Date('2025-03-22'),
          time: '16:00',
          venue: 'Stade Municipal',
          homeTeam: teams[1].id,
          awayTeam: teams[2].id,
          homeScore: 0,
          awayScore: 3,
          status: 'completed',
          tournamentId: tournament.id,
          groupId: groups[0].id,
          tenantId: tenant.id,
        },
      }),
    ]);
    console.log('✅ Matchs créés:', matches.length);

    console.log('\n🎉 Données de test ajoutées avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`   - Tenant: ${tenant.name}`);
    console.log(`   - Équipes: ${teams.length}`);
    console.log(`   - Joueurs: ${players.length}`);
    console.log(`   - Tournoi: ${tournament.name}`);
    console.log(`   - Groupes: ${groups.length}`);
    console.log(`   - Matchs: ${matches.length}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données de test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData().catch(console.error); 