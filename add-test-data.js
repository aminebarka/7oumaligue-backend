const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestData() {
  console.log('🧪 Ajout de données de test...\n');

  try {
    // 1. Créer des équipes de test
    console.log('1️⃣ Création des équipes de test...');
    
    const teams = [
      {
        name: 'Équipe Rouge',
        logo: '🔴',
        coachName: 'Coach Rouge',
        players: ['Joueur 1', 'Joueur 2', 'Joueur 3']
      },
      {
        name: 'Équipe Bleue',
        logo: '🔵',
        coachName: 'Coach Bleu',
        players: ['Joueur 4', 'Joueur 5', 'Joueur 6']
      },
      {
        name: 'Équipe Verte',
        logo: '🟢',
        coachName: 'Coach Vert',
        players: ['Joueur 7', 'Joueur 8', 'Joueur 9']
      },
      {
        name: 'Équipe Jaune',
        logo: '🟡',
        coachName: 'Coach Jaune',
        players: ['Joueur 10', 'Joueur 11', 'Joueur 12']
      }
    ];

    const createdTeams = [];
    for (const team of teams) {
      const createdTeam = await prisma.team.create({
        data: team
      });
      createdTeams.push(createdTeam);
      console.log(`✅ Équipe créée: ${createdTeam.name} (ID: ${createdTeam.id})`);
    }

    // 2. Créer un tournoi de test
    console.log('\n2️⃣ Création du tournoi de test...');
    
    const tournament = await prisma.tournament.create({
      data: {
        name: 'Tournoi de Test 2024',
        description: 'Tournoi de test pour vérifier la création de matchs',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-08-31'),
        maxTeams: 8,
        status: 'active',
        logo: '🏆'
      }
    });
    console.log(`✅ Tournoi créé: ${tournament.name} (ID: ${tournament.id})`);

    // 3. Créer des groupes de test
    console.log('\n3️⃣ Création des groupes de test...');
    
    const groups = [
      {
        name: 'Groupe A',
        tournamentId: tournament.id
      },
      {
        name: 'Groupe B',
        tournamentId: tournament.id
      }
    ];

    const createdGroups = [];
    for (const group of groups) {
      const createdGroup = await prisma.group.create({
        data: group
      });
      createdGroups.push(createdGroup);
      console.log(`✅ Groupe créé: ${createdGroup.name} (ID: ${createdGroup.id})`);
    }

    // 4. Ajouter les équipes au tournoi
    console.log('\n4️⃣ Ajout des équipes au tournoi...');
    
    for (let i = 0; i < createdTeams.length; i++) {
      const groupIndex = i % 2; // Répartir les équipes entre les 2 groupes
      
      await prisma.tournamentTeam.create({
        data: {
          tournamentId: tournament.id,
          teamId: createdTeams[i].id,
          groupId: createdGroups[groupIndex].id
        }
      });
      console.log(`✅ Équipe ${createdTeams[i].name} ajoutée au ${createdGroups[groupIndex].name}`);
    }

    // 5. Créer un match de test
    console.log('\n5️⃣ Création d\'un match de test...');
    
    const testMatch = await prisma.match.create({
      data: {
        date: new Date('2024-08-02T15:00:00Z'),
        time: '15:00',
        venue: 'Stade de Test',
        homeTeamId: createdTeams[0].id, // Utiliser homeTeamId pour la relation
        homeTeam: createdTeams[0].name, // Garder le nom pour l'affichage
        tournamentId: tournament.id,
        groupId: createdGroups[0].id,
        status: 'scheduled'
      }
    });
    console.log(`✅ Match créé: ${createdTeams[0].name} (ID: ${testMatch.id})`);

    console.log('\n🎉 Données de test ajoutées avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`- ${createdTeams.length} équipes créées`);
    console.log(`- 1 tournoi créé`);
    console.log(`- ${createdGroups.length} groupes créés`);
    console.log(`- 1 match de test créé`);
    
    console.log('\n🧪 Vous pouvez maintenant tester avec:');
    console.log('node test-match-creation.js');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données de test:', error);
    
    if (error.code === 'P2002') {
      console.log('💡 Certaines données existent déjà. Essayez de supprimer les données existantes d\'abord.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
addTestData(); 