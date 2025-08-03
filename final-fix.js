const { exec } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function finalFix() {
  console.log('🔧 Correction finale complète...\n');

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

    // 2. Test de compilation TypeScript
    console.log('\n2️⃣ Test de compilation TypeScript...');
    await new Promise((resolve, reject) => {
      exec('npx tsc --noEmit', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Erreurs de compilation:');
          console.log(stderr);
          reject(error);
        } else {
          console.log('✅ Compilation TypeScript réussie!');
          resolve();
        }
      });
    });

    // 3. Vérifier et ajouter des données de test
    console.log('\n3️⃣ Vérification des données...');
    const teams = await prisma.team.findMany();
    const tournaments = await prisma.tournament.findMany();

    if (teams.length === 0 || tournaments.length === 0) {
      console.log('📝 Ajout de données de test...');
      
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
      await prisma.team.create({
        data: { name: 'Équipe A', logo: '⚽', players: ['J1', 'J2'] }
      });
      await prisma.team.create({
        data: { name: 'Équipe B', logo: '⚽', players: ['J3', 'J4'] }
      });

      console.log('✅ Données de test créées');
    }

    // 4. Test de création de match
    console.log('\n4️⃣ Test de création de match...');
    const testTeams = await prisma.team.findMany({ take: 1 });
    const testTournaments = await prisma.tournament.findMany({ take: 1 });

    if (testTeams.length > 0 && testTournaments.length > 0) {
      const match = await prisma.match.create({
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

      console.log('✅ Match créé avec succès!');
      console.log(`- Équipe: ${match.homeTeam}`);
      console.log(`- Tournoi: ${testTournaments[0].name}`);

      // Nettoyer
      await prisma.match.delete({ where: { id: match.id } });
      console.log('🧹 Match de test supprimé');
    }

    console.log('\n🎉 Tous les problèmes sont résolus!');
    console.log('🚀 Le serveur devrait maintenant démarrer sans erreur.');
    console.log('⚽ La création de matchs fonctionne correctement.');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalFix(); 