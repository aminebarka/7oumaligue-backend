const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugMatchCreation() {
  console.log('🔍 Diagnostic de la création de match...\n');

  try {
    // 1. Vérifier les équipes existantes
    console.log('1️⃣ Équipes disponibles:');
    const teams = await prisma.team.findMany({
      select: { id: true, name: true }
    });
    console.log(teams);
    console.log('');

    // 2. Vérifier les tournois existants
    console.log('2️⃣ Tournois disponibles:');
    const tournaments = await prisma.tournament.findMany({
      select: { id: true, name: true }
    });
    console.log(tournaments);
    console.log('');

    // 3. Vérifier les groupes existants
    console.log('3️⃣ Groupes disponibles:');
    const groups = await prisma.group.findMany({
      select: { id: true, name: true, tournamentId: true }
    });
    console.log(groups);
    console.log('');

    // 4. Créer un match de test avec des données valides
    if (teams.length > 0 && tournaments.length > 0) {
      console.log('4️⃣ Test de création de match...');
      
      const testMatch = await prisma.match.create({
        data: {
          date: new Date(),
          time: '20:00',
          venue: 'Stade Test',
          homeTeamId: teams[0].id,
          homeTeam: teams[0].name,
          tournamentId: tournaments[0].id,
          status: 'scheduled',
        },
        include: {
          homeTeamRef: true,
          tournament: true,
        }
      });
      
      console.log('✅ Match créé avec succès:', testMatch);
      
      // Nettoyer le match de test
      await prisma.match.delete({
        where: { id: testMatch.id }
      });
      console.log('🧹 Match de test supprimé');
    } else {
      console.log('❌ Pas assez de données pour tester');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugMatchCreation(); 