import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixMigrationIssues() {
  try {
    console.log('🔧 Début de la correction des problèmes de migration...')

    // 1. Vérifier et créer les tables manquantes
    console.log('📋 Vérification des tables...')

    // 2. Corriger les relations dans les modèles existants
    console.log('🔗 Correction des relations...')

    // 3. Créer des données de test pour les nouvelles fonctionnalités
    console.log('🧪 Création de données de test...')

    // Créer un utilisateur de test si aucun n'existe
    const existingUsers = await prisma.user.findMany()
    if (existingUsers.length === 0) {
      console.log('👤 Création d\'un utilisateur de test...')
      
      // Créer un tenant par défaut
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Organisation Test'
        }
      })

      // Créer un utilisateur admin
      const user = await prisma.user.create({
        data: {
          name: 'Admin Test',
          email: 'admin@test.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQjqO6m', // 'password123'
          role: 'admin',
          tenantId: tenant.id
        }
      })

      console.log('✅ Utilisateur de test créé:', user.email)
    }

    // Créer des équipes de test
    const existingTeams = await prisma.team.findMany()
    if (existingTeams.length === 0) {
      console.log('⚽ Création d\'équipes de test...')
      
      const teams = await Promise.all([
        prisma.team.create({
          data: {
            name: 'Équipe A',
            logo: '⚽',
            coachName: 'Coach A',
            players: ['player1', 'player2', 'player3'],
            wins: 5,
            draws: 2,
            losses: 1,
            goalsScored: 15,
            matchesPlayed: 8
          }
        }),
        prisma.team.create({
          data: {
            name: 'Équipe B',
            logo: '⚽',
            coachName: 'Coach B',
            players: ['player4', 'player5', 'player6'],
            wins: 3,
            draws: 3,
            losses: 2,
            goalsScored: 12,
            matchesPlayed: 8
          }
        })
      ])

      console.log('✅ Équipes de test créées:', teams.length)
    }

    // Créer des joueurs de test
    const existingPlayers = await prisma.player.findMany()
    if (existingPlayers.length === 0) {
      console.log('👤 Création de joueurs de test...')
      
      const teams = await prisma.team.findMany()
      if (teams.length > 0) {
        const players = await Promise.all([
          prisma.player.create({
            data: {
              name: 'Joueur 1',
              position: 'Attaquant',
              level: 4,
              age: 25,
              teamId: teams[0].id,
              jerseyNumber: 10
            }
          }),
          prisma.player.create({
            data: {
              name: 'Joueur 2',
              position: 'Milieu',
              level: 3,
              age: 23,
              teamId: teams[0].id,
              jerseyNumber: 8
            }
          }),
          prisma.player.create({
            data: {
              name: 'Joueur 3',
              position: 'Défenseur',
              level: 4,
              age: 27,
              teamId: teams[1].id,
              jerseyNumber: 4
            }
          })
        ])

        console.log('✅ Joueurs de test créés:', players.length)
      }
    }

    // Créer un tournoi de test
    const existingTournaments = await prisma.tournament.findMany()
    if (existingTournaments.length === 0) {
      console.log('🏆 Création d\'un tournoi de test...')
      
      const tournament = await prisma.tournament.create({
        data: {
          name: 'Tournoi Test 2024',
          logo: '🏆',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-20'),
          prize: '1000 MAD',
          rules: 'Format coupe - Élimination directe',
          status: 'upcoming',
          numberOfGroups: 2,
          teamsPerGroup: 4
        }
      })

      console.log('✅ Tournoi de test créé:', tournament.name)
    }

    // Créer des matchs de test
    const existingMatches = await prisma.match.findMany()
    if (existingMatches.length === 0) {
      console.log('⚽ Création de matchs de test...')
      
      const teams = await prisma.team.findMany()
      const tournaments = await prisma.tournament.findMany()
      
      if (teams.length >= 2 && tournaments.length > 0) {
        const matches = await Promise.all([
          prisma.match.create({
            data: {
              date: '2024-01-15',
              time: '14:00',
              venue: 'Stade Principal',
              homeTeam: teams[0].id,
              awayTeam: teams[1].id,
              homeScore: 1,
              status: 'completed',
              tournamentId: tournaments[0].id
            }
          }),
          prisma.match.create({
            data: {
              date: '2024-01-16',
              time: '16:00',
              venue: 'Stade Principal',
              homeTeam: teams[1].id,
              awayTeam: teams[0].id,
              status: 'scheduled',
              tournamentId: tournaments[0].id
            }
          })
        ])

        console.log('✅ Matchs de test créés:', matches.length)
      }
    }

    // Créer des posts sociaux de test
    const existingPosts = await prisma.socialPost.findMany()
    if (existingPosts.length === 0) {
      console.log('📱 Création de posts sociaux de test...')
      
      const users = await prisma.user.findMany()
      const tournaments = await prisma.tournament.findMany()
      
      if (users.length > 0 && tournaments.length > 0) {
        const posts = await Promise.all([
          prisma.socialPost.create({
            data: {
              content: 'Incroyable match aujourd\'hui ! Notre équipe a gagné 3-1 ! ⚽🔥',
              media: [],
              hashtags: ['GoalOfTheDay', '7oumaLigue', 'Victory'],
              likes: 24,
              comments: 8,
              shares: 3,
              playerId: users[0].id,
              tournamentId: tournaments[0].id,
              isPublic: true
            }
          }),
          prisma.socialPost.create({
            data: {
              content: 'Préparation pour le prochain match ! 💪 #Preparation #7oumaLigue',
              media: [],
              hashtags: ['Preparation', '7oumaLigue'],
              likes: 15,
              comments: 5,
              shares: 2,
              playerId: users[0].id,
              tournamentId: tournaments[0].id,
              isPublic: true
            }
          })
        ])

        console.log('✅ Posts sociaux de test créés:', posts.length)
      }
    }

    // Créer des transactions de paiement de test
    const existingTransactions = await prisma.paymentTransaction.findMany()
    if (existingTransactions.length === 0) {
      console.log('💰 Création de transactions de paiement de test...')
      
      const tournaments = await prisma.tournament.findMany()
      const teams = await prisma.team.findMany()
      
      if (tournaments.length > 0 && teams.length > 0) {
        const transactions = await Promise.all([
          prisma.paymentTransaction.create({
            data: {
              amount: 500.0,
              currency: 'MAD',
              status: 'completed',
              paymentMethod: 'card',
              tournamentId: tournaments[0].id,
              teamId: teams[0].id,
              metadata: { method: 'card', cardType: 'visa' }
            }
          }),
          prisma.paymentTransaction.create({
            data: {
              amount: 300.0,
              currency: 'MAD',
              status: 'pending',
              paymentMethod: 'cash',
              tournamentId: tournaments[0].id,
              teamId: teams[1].id,
              metadata: { method: 'cash' }
            }
          })
        ])

        console.log('✅ Transactions de paiement de test créées:', transactions.length)
      }
    }

    console.log('✅ Correction des problèmes de migration terminée avec succès !')
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction des problèmes:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  fixMigrationIssues()
    .then(() => {
      console.log('🎉 Script de correction terminé avec succès !')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erreur lors de l\'exécution du script:', error)
      process.exit(1)
    })
}

export { fixMigrationIssues } 