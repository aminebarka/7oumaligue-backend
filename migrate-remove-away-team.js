const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateRemoveAwayTeam() {
  console.log('🔄 Migration: Suppression des champs awayTeam...\n');

  try {
    // 1. Supprimer tous les matchs existants (car ils ont des champs awayTeam)
    console.log('1️⃣ Suppression des matchs existants...');
    const deletedMatches = await prisma.match.deleteMany({});
    console.log(`✅ ${deletedMatches.count} matchs supprimés`);

    // 2. Vérifier que les équipes existent toujours
    console.log('\n2️⃣ Vérification des équipes...');
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true
      }
    });
    console.log(`✅ ${teams.length} équipes trouvées`);

    // 3. Vérifier que les tournois existent toujours
    console.log('\n3️⃣ Vérification des tournois...');
    const tournaments = await prisma.tournament.findMany({
      select: {
        id: true,
        name: true
      }
    });
    console.log(`✅ ${tournaments.length} tournois trouvés`);

    // 4. Vérifier que les groupes existent toujours
    console.log('\n4️⃣ Vérification des groupes...');
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        tournamentId: true
      }
    });
    console.log(`✅ ${groups.length} groupes trouvés`);

    console.log('\n🎉 Migration terminée avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`- ${deletedMatches.count} matchs supprimés`);
    console.log(`- ${teams.length} équipes conservées`);
    console.log(`- ${tournaments.length} tournois conservés`);
    console.log(`- ${groups.length} groupes conservés`);
    
    console.log('\n🧪 Vous pouvez maintenant tester avec:');
    console.log('node add-test-data.js');
    console.log('node test-match-creation.js');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateRemoveAwayTeam(); 