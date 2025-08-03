const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestData() {
  console.log('🚀 Ajout de données de test...\n');

  try {
    // 1. Créer un tournoi de test
    console.log('1️⃣ Création du tournoi...');
    const tournament = await prisma.tournament.create({
      data: {
        name: 'Tournoi Test',
        description: 'Tournoi pour tester la création de matchs',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
        status: 'upcoming',
        maxTeams: 8,
        numberOfGroups: 2,
        teamsPerGroup: 4,
      }
    });
    console.log('✅ Tournoi créé:', tournament.name);

    // 2. Créer des équipes de test
    console.log('\n2️⃣ Création des équipes...');
    const teams = [];
    for (let i = 1; i <= 4; i++) {
      const team = await prisma.team.create({
        data: {
          name: `Équipe Test ${i}`,
          logo: '⚽',
          players: ['Joueur 1', 'Joueur 2', 'Joueur 3'],
        }
      });
      teams.push(team);
      console.log(`✅ Équipe créée: ${team.name}`);
    }

    // 3. Créer des groupes
    console.log('\n3️⃣ Création des groupes...');
    const groups = [];
    for (let i = 1; i <= 2; i++) {
      const group = await prisma.group.create({
        data: {
          name: `Groupe ${i}`,
          tournamentId: tournament.id,
        }
      });
      groups.push(group);
      console.log(`✅ Groupe créé: ${group.name}`);
    }

    // 4. Ajouter les équipes aux groupes
    console.log('\n4️⃣ Ajout des équipes aux groupes...');
    for (let i = 0; i < teams.length; i++) {
      const groupIndex = Math.floor(i / 2); // 2 équipes par groupe
      await prisma.groupTeam.create({
        data: {
          groupId: groups[groupIndex].id,
          teamId: teams[i].id,
        }
      });
      console.log(`✅ ${teams[i].name} ajoutée au ${groups[groupIndex].name}`);
    }

    console.log('\n🎉 Données de test créées avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`- Tournoi: ${tournament.name} (ID: ${tournament.id})`);
    console.log(`- Équipes: ${teams.length} créées`);
    console.log(`- Groupes: ${groups.length} créés`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestData(); 