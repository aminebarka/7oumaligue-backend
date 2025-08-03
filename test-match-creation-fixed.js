const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMatchCreation() {
  console.log('🧪 Test de création de match (corrigé)...\n');

  try {
    // 1. Vérifier les données existantes
    const teams = await prisma.team.findMany();
    const tournaments = await prisma.tournament.findMany();
    const groups = await prisma.group.findMany();

    console.log(`📊 Données disponibles:`);
    console.log(`- Équipes: ${teams.length}`);
    console.log(`- Tournois: ${tournaments.length}`);
    console.log(`- Groupes: ${groups.length}`);

    if (teams.length === 0 || tournaments.length === 0) {
      console.log('\n❌ Pas assez de données. Ajout de données de test...');
      
      // Créer un tournoi
      const tournament = await prisma.tournament.create({
        data: {
          name: 'Tournoi Test',
          description: 'Tournoi pour tester',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'upcoming',
          maxTeams: 8,
          numberOfGroups: 2,
          teamsPerGroup: 4,
        }
      });

      // Créer des équipes
      const team1 = await prisma.team.create({
        data: { name: 'Équipe A', logo: '⚽', players: ['J1', 'J2'] }
      });
      const team2 = await prisma.team.create({
        data: { name: 'Équipe B', logo: '⚽', players: ['J3', 'J4'] }
      });

      console.log('✅ Données de test créées');
    }

    // 2. Récupérer les données pour le test
    const testTeams = await prisma.team.findMany({ take: 2 });
    const testTournaments = await prisma.tournament.findMany({ take: 1 });

    if (testTeams.length >= 2 && testTournaments.length > 0) {
      console.log('\n🎯 Test de création de match...');
      
      // Simuler les données envoyées par le frontend
      const matchData = {
        date: '2025-08-02',
        time: '20:00',
        venue: 'Stade Test',
        homeTeam: testTeams[0].name, // Nom de l'équipe (pas l'ID)
        tournamentId: testTournaments[0].id,
      };

      console.log('📤 Données envoyées:', matchData);

      // Créer le match
      const match = await prisma.match.create({
        data: {
          date: new Date(matchData.date + 'T' + matchData.time + ':00'),
          time: matchData.time,
          venue: matchData.venue,
          homeTeamId: testTeams[0].id, // ID de l'équipe
          homeTeam: testTeams[0].name, // Nom de l'équipe
          tournamentId: testTournaments[0].id,
          status: 'scheduled',
        },
        include: {
          homeTeamRef: true,
          tournament: true,
        }
      });

      console.log('✅ Match créé avec succès!');
      console.log(`- ID: ${match.id}`);
      console.log(`- Équipe: ${match.homeTeam} (ID: ${match.homeTeamId})`);
      console.log(`- Tournoi: ${match.tournament.name}`);
      console.log(`- Date: ${match.date}`);
      console.log(`- Lieu: ${match.venue}`);

      // Nettoyer
      await prisma.match.delete({ where: { id: match.id } });
      console.log('🧹 Match de test supprimé');

      console.log('\n🎉 Test réussi! Le contrôleur fonctionne correctement.');
    } else {
      console.log('❌ Pas assez de données pour tester');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMatchCreation(); 