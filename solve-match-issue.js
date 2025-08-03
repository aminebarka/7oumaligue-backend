const { exec } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function solveMatchIssue() {
  console.log('🔧 Résolution du problème de création de match...\n');

  try {
    // 1. Régénérer le client Prisma
    console.log('1️⃣ Régénération du client Prisma...');
    await new Promise((resolve, reject) => {
      exec('npx prisma generate', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Erreur Prisma:', error);
          reject(error);
        } else {
          console.log('✅ Client Prisma régénéré');
          resolve();
        }
      });
    });

    // 2. Vérifier les données existantes
    console.log('\n2️⃣ Vérification des données...');
    const teams = await prisma.team.findMany();
    const tournaments = await prisma.tournament.findMany();
    const groups = await prisma.group.findMany();

    console.log(`- Équipes: ${teams.length}`);
    console.log(`- Tournois: ${tournaments.length}`);
    console.log(`- Groupes: ${groups.length}`);

    // 3. Si pas de données, en ajouter
    if (teams.length === 0 || tournaments.length === 0) {
      console.log('\n3️⃣ Ajout de données de test...');
      
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

      // Créer un groupe
      const group = await prisma.group.create({
        data: {
          name: 'Groupe Test',
          tournamentId: tournament.id,
        }
      });

      console.log('✅ Données de test créées');
    }

    // 4. Test de création de match
    console.log('\n4️⃣ Test de création de match...');
    const testTeams = await prisma.team.findMany({ take: 1 });
    const testTournaments = await prisma.tournament.findMany({ take: 1 });

    if (testTeams.length > 0 && testTournaments.length > 0) {
      const testMatch = await prisma.match.create({
        data: {
          date: new Date(),
          time: '20:00',
          venue: 'Stade Test',
          homeTeamId: testTeams[0].id,
          homeTeam: testTeams[0].name,
          tournamentId: testTournaments[0].id,
          status: 'scheduled',
        }
      });

      console.log('✅ Match de test créé avec succès!');
      console.log(`- ID: ${testMatch.id}`);
      console.log(`- Équipe: ${testMatch.homeTeam}`);
      console.log(`- Tournoi: ${testTournaments[0].name}`);

      // Nettoyer
      await prisma.match.delete({ where: { id: testMatch.id } });
      console.log('🧹 Match de test supprimé');
    }

    console.log('\n🎉 Problème résolu! Le serveur devrait maintenant fonctionner.');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

solveMatchIssue(); 