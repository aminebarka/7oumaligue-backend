import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAdvancedData() {
  console.log('🌱 Insertion des données de test pour les fonctionnalités avancées...')

  try {
    // Créer des posts sociaux de test
    console.log('📱 Création des posts sociaux...')
    await prisma.socialPost.createMany({
      data: [
        {
          content: 'Incroyable match aujourd\'hui ! Notre équipe a gagné 3-1 ! ⚽🔥',
          media: [],
          hashtags: ['GoalOfTheDay', '7oumaLigue', 'Victory'],
          likes: 24,
          comments: 8,
          shares: 3,
          playerId: '1',
          teamId: '1'
        },
        {
          content: 'But magnifique de notre capitaine ! 🎯 #BeautifulGoal',
          media: ['https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=But+Magnifique'],
          hashtags: ['BeautifulGoal', 'Captain', '7oumaLigue'],
          likes: 45,
          comments: 12,
          shares: 7,
          playerId: '2'
        },
        {
          content: 'Préparation pour le match de demain ! 💪 #Preparation #7oumaLigue',
          media: [
            'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Entrainement',
            'https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Equipe'
          ],
          hashtags: ['Preparation', '7oumaLigue', 'Training'],
          likes: 18,
          comments: 5,
          shares: 2,
          teamId: '2'
        }
      ]
    })

    // Créer des transactions de paiement de test
    console.log('💳 Création des transactions de paiement...')
    await prisma.paymentTransaction.createMany({
      data: [
        {
          transactionId: 'TXN001',
          tournamentId: '1',
          teamId: '1',
          amount: 50,
          commission: 2.5,
          netAmount: 47.5,
          paymentMethod: 'Flouci',
          playerCount: 8,
          organizerId: 1,
          status: 'completed'
        },
        {
          transactionId: 'TXN002',
          tournamentId: '2',
          teamId: '2',
          amount: 75,
          commission: 3.75,
          netAmount: 71.25,
          paymentMethod: 'D17',
          playerCount: 10,
          organizerId: 1,
          status: 'pending'
        },
        {
          transactionId: 'TXN003',
          tournamentId: '3',
          teamId: '3',
          amount: 30,
          commission: 1.5,
          netAmount: 28.5,
          paymentMethod: 'Carte Bancaire',
          playerCount: 6,
          organizerId: 1,
          status: 'failed'
        }
      ]
    })

    // Créer des statistiques de joueur de test
    console.log('📊 Création des statistiques de joueur...')
    await prisma.playerStats.createMany({
      data: [
        {
          playerId: '1',
          tournamentId: '1',
          goals: 5,
          assists: 3,
          yellowCards: 1,
          redCards: 0,
          matchesPlayed: 4,
          minutesPlayed: 320,
          rating: 4.2
        },
        {
          playerId: '2',
          tournamentId: '1',
          goals: 3,
          assists: 5,
          yellowCards: 0,
          redCards: 0,
          matchesPlayed: 4,
          minutesPlayed: 360,
          rating: 4.5
        },
        {
          playerId: '3',
          tournamentId: '1',
          goals: 2,
          assists: 1,
          yellowCards: 2,
          redCards: 0,
          matchesPlayed: 3,
          minutesPlayed: 270,
          rating: 3.8
        }
      ]
    })

    // Créer des badges de joueur de test
    console.log('🏆 Création des badges de joueur...')
    await prisma.playerBadge.createMany({
      data: [
        {
          playerId: '1',
          badgeType: 'MVP',
          badgeName: 'Joueur du Match',
          description: 'Meilleur joueur du match',
          icon: '🏆',
          tournamentId: '1'
        },
        {
          playerId: '2',
          badgeType: 'TopScorer',
          badgeName: 'Meilleur Buteur',
          description: 'Plus de buts marqués',
          icon: '⚽',
          tournamentId: '1'
        },
        {
          playerId: '3',
          badgeType: 'FairPlay',
          badgeName: 'Fair Play',
          description: 'Esprit sportif exemplaire',
          icon: '🤝',
          tournamentId: '1'
        }
      ]
    })

    // Créer des stades de test
    console.log('🏟️ Création des stades...')
    await prisma.stadium.createMany({
      data: [
        {
          name: 'Stade Municipal de Tunis',
          address: '123 Avenue Habib Bourguiba',
          city: 'Tunis',
          phone: '+216 71 123 456',
          email: 'contact@stade-tunis.tn',
          website: 'https://stade-tunis.tn',
          logo: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=ST',
          photos: [
            'https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=Stade+Tunis+1',
            'https://via.placeholder.com/800x600/45B7D1/FFFFFF?text=Stade+Tunis+2'
          ],
          description: 'Stade principal de la ville de Tunis avec des installations modernes',
          facilities: ['Terrain synthétique', 'Vestiaires', 'Parking', 'Cafétéria'],
          isPartner: true,
          partnerLevel: 'Gold'
        },
        {
          name: 'Complexe Sportif Sfax',
          address: '456 Rue de la République',
          city: 'Sfax',
          phone: '+216 74 789 012',
          email: 'info@complexe-sfax.tn',
          website: 'https://complexe-sfax.tn',
          logo: 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=CS',
          photos: [
            'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Complexe+Sfax+1'
          ],
          description: 'Complexe sportif moderne avec plusieurs terrains',
          facilities: ['2 Terrains synthétiques', 'Salle de musculation', 'Piscine'],
          isPartner: true,
          partnerLevel: 'Silver'
        },
        {
          name: 'Terrain Municipal Sousse',
          address: '789 Boulevard de la Corniche',
          city: 'Sousse',
          phone: '+216 73 345 678',
          email: 'contact@terrain-sousse.tn',
          logo: 'https://via.placeholder.com/200x200/96CEB4/FFFFFF?text=TS',
          photos: [
            'https://via.placeholder.com/800x600/96CEB4/FFFFFF?text=Terrain+Sousse+1'
          ],
          description: 'Terrain municipal bien entretenu',
          facilities: ['Terrain naturel', 'Éclairage', 'Parking'],
          isPartner: false
        }
      ]
    })

    console.log('✅ Données de test insérées avec succès !')
    console.log('📊 Résumé des données créées :')
    console.log('   - 3 posts sociaux')
    console.log('   - 3 transactions de paiement')
    console.log('   - 3 statistiques de joueur')
    console.log('   - 3 badges de joueur')
    console.log('   - 3 stades')

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
seedAdvancedData() 