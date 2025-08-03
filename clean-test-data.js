const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanTestData() {
  console.log('🧹 Nettoyage des données de test...\n');

  try {
    // 1. Supprimer les matchs de test
    console.log('1️⃣ Suppression des matchs de test...');
    const deletedMatches = await prisma.match.deleteMany({
      where: {
        venue: {
          contains: 'Test'
        }
      }
    });
    console.log(`✅ ${deletedMatches.count} matchs supprimés`);

    // 2. Supprimer les équipes de test
    console.log('2️⃣ Suppression des équipes de test...');
    const deletedTeams = await prisma.team.deleteMany({
      where: {
        name: {
          in: ['Équipe Rouge', 'Équipe Bleue', 'Équipe Verte', 'Équipe Jaune']
        }
      }
    });
    console.log(`✅ ${deletedTeams.count} équipes supprimées`);

    // 3. Supprimer les tournois de test
    console.log('3️⃣ Suppression des tournois de test...');
    const deletedTournaments = await prisma.tournament.deleteMany({
      where: {
        name: {
          contains: 'Test'
        }
      }
    });
    console.log(`✅ ${deletedTournaments.count} tournois supprimés`);

    // 4. Supprimer les groupes de test
    console.log('4️⃣ Suppression des groupes de test...');
    const deletedGroups = await prisma.group.deleteMany({
      where: {
        name: {
          in: ['Groupe A', 'Groupe B']
        }
      }
    });
    console.log(`✅ ${deletedGroups.count} groupes supprimés`);

    console.log('\n🎉 Nettoyage terminé avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`- ${deletedMatches.count} matchs supprimés`);
    console.log(`- ${deletedTeams.count} équipes supprimées`);
    console.log(`- ${deletedTournaments.count} tournois supprimés`);
    console.log(`- ${deletedGroups.count} groupes supprimés`);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
cleanTestData(); 