import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { PrismaClient } from '@prisma/client'
import { success, created, badRequest, notFound } from '../utils/apiResponse'

const router = Router()
const prisma = new PrismaClient()

// Route pour obtenir les suggestions AI de tournoi
router.post('/tournaments/ai/suggestions', authenticateToken, async (req, res) => {
  try {
    const {
      numberOfTeams,
      maxDuration,
      availableFields,
      maxMatchesPerDay,
      includeThirdPlace
    } = req.body

    // Logique de suggestion AI (simulation)
    const suggestions = [
      {
        description: 'Format équilibré avec phases de groupes',
        format: 'Groupes + Élimination',
        numberOfGroups: Math.ceil(numberOfTeams / 4),
        teamsPerGroup: Math.ceil(numberOfTeams / Math.ceil(numberOfTeams / 4)),
        totalMatches: Math.ceil(numberOfTeams * 1.5),
        estimatedDuration: `${Math.ceil(numberOfTeams / 4)} jours`,
        advantages: [
          'Équilibre entre compétitivité et durée',
          'Permet à toutes les équipes de jouer plusieurs matchs',
          'Format adapté aux terrains disponibles'
        ],
        isRecommended: true
      },
      {
        description: 'Format coupe rapide',
        format: 'Élimination directe',
        numberOfGroups: 0,
        teamsPerGroup: 0,
        totalMatches: numberOfTeams - 1,
        estimatedDuration: `${Math.ceil(numberOfTeams / 8)} jours`,
        advantages: [
          'Format rapide et dynamique',
          'Suspense jusqu\'à la fin',
          'Idéal pour un nombre impair d\'équipes'
        ],
        isRecommended: false
      }
    ]

    return success(res, suggestions)
  } catch (error) {
    console.error('Erreur lors de la génération des suggestions:', error)
    return badRequest(res, 'Erreur lors de la génération des suggestions')
  }
})

// Route pour obtenir une recommandation personnalisée
router.post('/tournaments/ai/personalized', authenticateToken, async (req, res) => {
  try {
    const { userId, preferences } = req.body

    // Logique de recommandation personnalisée
    const recommendation = {
      description: 'Recommandation basée sur vos préférences',
      format: 'Format personnalisé',
      numberOfGroups: 2,
      teamsPerGroup: 4,
      totalMatches: 12,
      estimatedDuration: '3 jours',
      advantages: [
        'Adapté à vos contraintes',
        'Optimisé pour votre expérience',
        'Basé sur vos tournois précédents'
      ],
      isRecommended: true
    }

    return success(res, recommendation)
  } catch (error) {
    console.error('Erreur lors de la génération de la recommandation:', error)
    return badRequest(res, 'Erreur lors de la génération de la recommandation')
  }
})

// Route pour créer un post social
router.post('/social/posts', authenticateToken, async (req, res) => {
  try {
    const {
      content,
      media = [],
      hashtags = [],
      tournamentId,
      matchId,
      isPublic = true
    } = req.body

    const post = await prisma.socialPost.create({
      data: {
        content,
        media,
        hashtags,
        tournamentId: tournamentId ? String(tournamentId) : null,
        matchId: matchId ? String(matchId) : null,
        isPublic,
        playerId: req.user?.userId ? String(req.user.userId) : null
      }
    })

    return success(res, post, 'Post créé avec succès')
  } catch (error) {
    console.error('Erreur lors de la création du post:', error)
    return badRequest(res, 'Erreur lors de la création du post')
  }
})

// Route pour obtenir les posts sociaux (sans authentification)
router.get('/social/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, tournamentId, hashtag } = req.query

    let whereClause: any = {
      isPublic: true
    }

    if (tournamentId) {
      whereClause.tournamentId = String(tournamentId as string)
    }

    if (hashtag) {
      whereClause.hashtags = {
        has: hashtag
      }
    }

    const posts = await prisma.socialPost.findMany({
      where: whereClause,
      include: {
        player: {
          include: {
            team: true
          }
        },
        tournament: true,
        match: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    })

    const total = await prisma.socialPost.count({ where: whereClause })

    return success(res, {
      posts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error)
    return badRequest(res, 'Erreur lors de la récupération des posts')
  }
})

// Route pour liker/unliker un post
router.post('/social/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const post = await prisma.socialPost.findUnique({
      where: { id: parseInt(id) }
    })

    if (!post) {
      return notFound(res, 'Post non trouvé')
    }

    // Simuler un like (dans une vraie implémentation, on aurait une table likes)
    await prisma.socialPost.update({
      where: { id: parseInt(id) },
      data: {
        likes: post.likes + 1
      }
    })

    return success(res, { message: 'Post liké' })
  } catch (error) {
    console.error('Erreur lors du like:', error)
    return badRequest(res, 'Erreur lors du like')
  }
})

// Route pour commenter un post
router.post('/social/posts/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { comment } = req.body

    const post = await prisma.socialPost.findUnique({
      where: { id: parseInt(id) }
    })

    if (!post) {
      return notFound(res, 'Post non trouvé')
    }

    // Simuler un commentaire
    await prisma.socialPost.update({
      where: { id: parseInt(id) },
      data: {
        comments: post.comments + 1
      }
    })

    return success(res, { message: 'Commentaire ajouté' })
  } catch (error) {
    console.error('Erreur lors du commentaire:', error)
    return badRequest(res, 'Erreur lors du commentaire')
  }
})

// Route pour partager un post
router.post('/social/posts/:id/share', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const post = await prisma.socialPost.findUnique({
      where: { id: parseInt(id) }
    })

    if (!post) {
      return notFound(res, 'Post non trouvé')
    }

    // Simuler un partage
    await prisma.socialPost.update({
      where: { id: parseInt(id) },
      data: {
        shares: post.shares + 1
      }
    })

    return success(res, { message: 'Post partagé' })
  } catch (error) {
    console.error('Erreur lors du partage:', error)
    return badRequest(res, 'Erreur lors du partage')
  }
})

// Route pour créer un paiement
router.post('/payments/create', authenticateToken, async (req, res) => {
  try {
    const {
      amount,
      currency = 'MAD',
      paymentMethod,
      tournamentId,
      teamId,
      playerId,
      metadata = {}
    } = req.body

    const transaction = await prisma.paymentTransaction.create({
      data: {
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        tournamentId: tournamentId ? String(tournamentId) : null,
        teamId: teamId ? String(teamId) : null,
        playerId: playerId ? String(playerId) : null,
        metadata,
        status: 'pending'
      }
    })

    return success(res, transaction, 'Paiement créé avec succès')
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error)
    return badRequest(res, 'Erreur lors de la création du paiement')
  }
})

// Route pour obtenir les transactions de paiement
router.get('/payments/transactions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query

    let whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    const transactions = await prisma.paymentTransaction.findMany({
      where: whereClause,
      include: {
        tournament: true,
        team: true,
        player: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    })

    const total = await prisma.paymentTransaction.count({ where: whereClause })

    return success(res, {
      transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error)
    return badRequest(res, 'Erreur lors de la récupération des transactions')
  }
})

// Route pour obtenir les statistiques de paiement
router.get('/payments/stats', authenticateToken, async (req, res) => {
  try {
    const totalTransactions = await prisma.paymentTransaction.count()
    const totalAmount = await prisma.paymentTransaction.aggregate({
      _sum: {
        amount: true
      }
    })
    const pendingTransactions = await prisma.paymentTransaction.count({
      where: { status: 'pending' }
    })
    const completedTransactions = await prisma.paymentTransaction.count({
      where: { status: 'completed' }
    })

    return success(res, {
      totalTransactions,
      totalAmount: totalAmount._sum.amount || 0,
      pendingTransactions,
      completedTransactions
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return badRequest(res, 'Erreur lors de la récupération des statistiques')
  }
})

// Route pour obtenir les statistiques d'un joueur
router.get('/players/:id/stats', async (req, res) => {
  try {
    const { id } = req.params

    const stats = await prisma.playerStats.findMany({
      where: { playerId: String(id) },
      include: {
        tournament: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return success(res, stats)
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return badRequest(res, 'Erreur lors de la récupération des statistiques')
  }
})

// Route pour obtenir les badges d'un joueur
router.get('/players/:id/badges', async (req, res) => {
  try {
    const { id } = req.params

    const badges = await prisma.playerBadge.findMany({
      where: { playerId: String(id) },
      include: {
        tournament: true
      },
      orderBy: {
        earnedAt: 'desc'
      }
    })

    return success(res, badges)
  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error)
    return badRequest(res, 'Erreur lors de la récupération des badges')
  }
})

// Route pour obtenir les informations d'un stade
router.get('/stadia/:id', async (req, res) => {
  try {
    const { id } = req.params

    const stadium = await prisma.stadium.findUnique({
      where: { id: parseInt(id) },
      include: {
        tournaments: {
          include: {
            tournament: true
          }
        }
      }
    })

    if (!stadium) {
      return notFound(res, 'Stade non trouvé')
    }

    return success(res, stadium)
  } catch (error) {
    console.error('Erreur lors de la récupération du stade:', error)
    return badRequest(res, 'Erreur lors de la récupération du stade')
  }
})

// Route pour obtenir le match en cours (SANS AUTHENTIFICATION)
router.get('/matches/current', async (req, res) => {
  try {
    const currentMatch = await prisma.match.findFirst({
      where: {
        status: 'in_progress'
      },
      include: {
        homeTeamRef: true,
        group: true,
        tournament: true,
      },
      orderBy: {
        date: 'desc'
      }
    })

    return success(res, currentMatch)
  } catch (error) {
    console.error('Erreur lors de la récupération du match en cours:', error)
    return badRequest(res, 'Erreur lors de la récupération du match en cours')
  }
})

// Route pour obtenir les prochains matchs (SANS AUTHENTIFICATION)
router.get('/matches/next', async (req, res) => {
  try {
    const { limit = 5 } = req.query

    const upcomingMatches = await prisma.match.findMany({
      where: {
        status: 'scheduled',
        date: {
          gte: new Date().toISOString()
        }
      },
      include: {
        homeTeamRef: true,
        group: true,
        tournament: true,
      },
      orderBy: {
        date: 'asc'
      },
      take: parseInt(limit as string)
    })

    return success(res, upcomingMatches)
  } catch (error) {
    console.error('Erreur lors de la récupération des prochains matchs:', error)
    return badRequest(res, 'Erreur lors de la récupération des prochains matchs')
  }
})

// Route pour obtenir tous les matchs (SANS AUTHENTIFICATION)
router.get('/matches/all', async (req, res) => {
  try {
    const { status, tournamentId } = req.query

    let whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    if (tournamentId) {
      whereClause.tournamentId = tournamentId
    }

    const matches = await prisma.match.findMany({
      where: whereClause,
      include: {
        homeTeamRef: true,
        group: true,
        tournament: true,
      },
      orderBy: {
        date: 'desc'
      }
    })

    return success(res, matches)
  } catch (error) {
    console.error('Erreur lors de la récupération des matchs:', error)
    return badRequest(res, 'Erreur lors de la récupération des matchs')
  }
})

// Route pour récupérer toutes les données en mode lecture simple
router.get('/all-data', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    
    // Récupérer toutes les données principales
    const [
      users,
      teams,
      players,
      tournaments,
      groups,
      matches,
      playerStats,
      playerBadges,
      socialPosts,
      stadiums,
      sponsors
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.team.findMany({
        select: {
          id: true,
          name: true,
          logo: true,
          coachName: true,
          players: true,
          wins: true,
          draws: true,
          losses: true,
          goalsScored: true,
          matchesPlayed: true,
          createdAt: true
        }
      }),
      prisma.player.findMany({
        select: {
          id: true,
          name: true,
          position: true,
          level: true,
          age: true,
          jerseyNumber: true,
          teamId: true,
          createdAt: true
        }
      }),
      prisma.tournament.findMany({
        select: {
          id: true,
          name: true,
          logo: true,
          startDate: true,
          endDate: true,
          prize: true,
          status: true,
          numberOfGroups: true,
          teamsPerGroup: true,
          drawCompleted: true,
          createdAt: true
        }
      }),
      prisma.group.findMany({
        select: {
          id: true,
          name: true,
          tournamentId: true,
          createdAt: true
        }
      }),
      prisma.match.findMany({
        select: {
          id: true,
          date: true,
          time: true,
          venue: true,
          homeTeam: true,
          awayTeam: true,
          homeScore: true,
          status: true,
          tournamentId: true,
          groupId: true,
          createdAt: true
        }
      }),
      prisma.playerStats.findMany({
        select: {
          id: true,
          playerId: true,
          tournamentId: true,
          matchesPlayed: true,
          goals: true,
          assists: true,
          rating: true,
          createdAt: true
        }
      }),
      prisma.playerBadge.findMany({
        select: {
          id: true,
          playerId: true,
          badgeName: true,
          description: true,
          icon: true,
          earnedAt: true,
          tournamentId: true,
          createdAt: true
        }
      }),
      prisma.socialPost.findMany({
        select: {
          id: true,
          content: true,
          mediaUrl: true,
          hashtags: true,
          likes: true,
          authorId: true,
          tournamentId: true,
          createdAt: true
        }
      }),
      prisma.stadium.findMany({
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          region: true,
          capacity: true,
          fieldCount: true,
          fieldTypes: true,
          amenities: true,
          images: true,
          contactInfo: true,
          pricing: true,
          createdAt: true
        }
      }),
      prisma.sponsor.findMany({
        select: {
          id: true,
          name: true,
          logo: true,
          website: true,
          contactInfo: true,
          createdAt: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        users,
        teams,
        players,
        tournaments,
        groups,
        matches,
        playerStats,
        playerBadges,
        socialPosts,
        stadiums,
        sponsors
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données'
    });
  }
});

export default router 