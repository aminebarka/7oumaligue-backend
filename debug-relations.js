const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugRelations() {
  console.log('🔍 Diagnostic des relations dans la base de données...\n');

  try {
    // 1. Vérifier les équipes
    console.log('1️⃣ Équipes dans la base:');
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        logo: true
      }
    });
    console.log(`✅ ${teams.length} équipes trouvées:`);
    teams.forEach(team => {
      console.log(`   - ${team.name} (ID: ${team.id})`);
    });

    // 2. Vérifier les tournois
    console.log('\n2️⃣ Tournois dans la base:');
    const tournaments = await prisma.tournament.findMany({
      select: {
        id: true,
        name: true,
        status: true
      }
    });
    console.log(`✅ ${tournaments.length} tournois trouvés:`);
    tournaments.forEach(tournament => {
      console.log(`   - ${tournament.name} (ID: ${tournament.id}, Status: ${tournament.status})`);
    });

    // 3. Vérifier les groupes
    console.log('\n3️⃣ Groupes dans la base:');
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        tournamentId: true
      },
      include: {
        tournament: {
          select: {
            name: true
          }
        }
      }
    });
    console.log(`✅ ${groups.length} groupes trouvés:`);
    groups.forEach(group => {
      console.log(`   - ${group.name} (ID: ${group.id}, Tournoi: ${group.tournament?.name || 'N/A'})`);
    });

    // 4. Vérifier les relations TournamentTeam
    console.log('\n4️⃣ Relations TournamentTeam:');
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      include: {
        team: {
          select: {
            name: true
          }
        },
        tournament: {
          select: {
            name: true
          }
        },
        group: {
          select: {
            name: true
          }
        }
      }
    });
    console.log(`✅ ${tournamentTeams.length} relations TournamentTeam trouvées:`);
    tournamentTeams.forEach(tt => {
      console.log(`   - ${tt.team?.name} dans ${tt.tournament?.name} (Groupe: ${tt.group?.name || 'N/A'})`);
    });

    // 5. Vérifier les matchs existants
    console.log('\n5️⃣ Matchs dans la base:');
    const matches = await prisma.match.findMany({
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        homeTeamId: true,
        awayTeamId: true,
        tournamentId: true,
        groupId: true,
        venue: true,
        date: true
      },
      include: {
        homeTeamRef: {
          select: {
            name: true
          }
        },
        awayTeamRef: {
          select: {
            name: true
          }
        },
        tournament: {
          select: {
            name: true
          }
        },
        group: {
          select: {
            name: true
          }
        }
      }
    });
    console.log(`✅ ${matches.length} matchs trouvés:`);
    matches.forEach(match => {
      console.log(`   - ${match.homeTeam} vs ${match.awayTeam} (ID: ${match.id})`);
      console.log(`     HomeTeamId: ${match.homeTeamId}, AwayTeamId: ${match.awayTeamId}`);
      console.log(`     Tournoi: ${match.tournament?.name || 'N/A'}, Groupe: ${match.group?.name || 'N/A'}`);
    });

    // 6. Vérifier les contraintes de clés étrangères
    console.log('\n6️⃣ Vérification des contraintes:');
    
    // Vérifier que toutes les équipes référencées existent
    const matchTeamIds = matches.flatMap(m => [m.homeTeamId, m.awayTeamId]).filter(id => id);
    const uniqueTeamIds = [...new Set(matchTeamIds)];
    
    console.log(`   - IDs d'équipes référencées dans les matchs: ${uniqueTeamIds.join(', ')}`);
    
    const existingTeamIds = teams.map(t => t.id);
    const missingTeamIds = uniqueTeamIds.filter(id => !existingTeamIds.includes(id));
    
    if (missingTeamIds.length > 0) {
      console.log(`   ❌ IDs d'équipes manquantes: ${missingTeamIds.join(', ')}`);
    } else {
      console.log('   ✅ Toutes les équipes référencées existent');
    }

    // Vérifier que tous les tournois référencés existent
    const matchTournamentIds = matches.map(m => m.tournamentId).filter(id => id);
    const uniqueTournamentIds = [...new Set(matchTournamentIds)];
    
    console.log(`   - IDs de tournois référencés dans les matchs: ${uniqueTournamentIds.join(', ')}`);
    
    const existingTournamentIds = tournaments.map(t => t.id);
    const missingTournamentIds = uniqueTournamentIds.filter(id => !existingTournamentIds.includes(id));
    
    if (missingTournamentIds.length > 0) {
      console.log(`   ❌ IDs de tournois manquants: ${missingTournamentIds.join(', ')}`);
    } else {
      console.log('   ✅ Tous les tournois référencés existent');
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le diagnostic
debugRelations(); 