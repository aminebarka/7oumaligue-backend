import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { PrismaClient } from '@prisma/client'
import { success, created, badRequest, notFound } from '../utils/apiResponse'

const router = Router()
const prisma = new PrismaClient()

// Route pour obtenir les ligues communautaires
router.get('/community/leagues', async (req, res) => {
  try {
    const { region, season } = req.query

    let whereClause: any = {
      isCommunityLeague: true
    }

    if (region) {
      whereClause.region = region
    }

    if (season) {
      whereClause.season = season
    }

    const leagues = await prisma.communityLeague.findMany({
      where: whereClause,
      include: {
        tournaments: {
          include: {
            tournament: true
          }
        },
        participants: {
          include: {
            team: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return ApiResponse.success(res, leagues)
  } catch (error) {
    console.error('Erreur lors de la récupération des ligues:', error)
    return ApiResponse.error(res, 'Erreur lors de la récupération des ligues')
  }
})

// Route pour obtenir le classement communautaire
router.get('/community/standings', async (req, res) => {
  try {
    const { leagueId, season } = req.query

    let whereClause: any = {}
    
    if (leagueId) {
      whereClause.leagueId = String(leagueId as string)
    }

    if (season) {
      whereClause.season = season
    }

    const standings = await prisma.communityStanding.findMany({
      where: whereClause,
      include: {
        team: true,
        league: true
      },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    })

    return ApiResponse.success(res, standings)
  } catch (error) {
    console.error('Erreur lors de la récupération du classement:', error)
    return ApiResponse.error(res, 'Erreur lors de la récupération du classement')
  }
})

// Route pour créer un post sur le mur social
router.post('/feed', authMiddleware, async (req, res) => {
  try {
    const {
      content,
      media,
      hashtags,
      tournamentId,
      matchId,
      isPublic
    } = req.body

    const post = await prisma.socialPost.create({
      data: {
        content,
        media: media || [],
        hashtags: hashtags || [],
        tournamentId: tournamentId ? String(tournamentId) : null,
        matchId: matchId ? String(matchId) : null,
        isPublic: isPublic !== false,
        playerId: req.user?.userId || 0,
        teamId: null // À remplir selon le contexte
      }
    })

    return ApiResponse.success(res, post, 'Post créé avec succès')
  } catch (error) {
    console.error('Erreur lors de la création du post:', error)
    return ApiResponse.error(res, 'Erreur lors de la création du post')
  }
})

// Route pour obtenir le feed social
router.get('/feed', async (req, res) => {
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
        match: true,
        likes: true,
        comments: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (String(page as string) - 1) * String(limit as string),
      take: String(limit as string)
    })

    const total = await prisma.socialPost.count({ where: whereClause })

    return ApiResponse.success(res, {
      posts,
      pagination: {
        page: String(page as string),
        limit: String(limit as string),
        total,
        pages: Math.ceil(total / String(limit as string))
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du feed:', error)
    return ApiResponse.error(res, 'Erreur lors de la récupération du feed')
  }
})

// Route pour voter MVP / meilleur but
router.post('/votes', authMiddleware, async (req, res) => {
  try {
    const {
      type, // 'mvp', 'best_goal', 'best_save', etc.
      targetId, // ID du joueur/match
      targetType, // 'player', 'match'
      tournamentId,
      reason
    } = req.body

    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: req.user?.userId || 0,
        type,
        targetId: String(targetId),
        targetType,
        tournamentId: String(tournamentId)
      }
    })

    if (existingVote) {
      return ApiResponse.error(res, 'Vous avez déjà voté pour cette catégorie', 409)
    }

    const vote = await prisma.vote.create({
      data: {
        userId: req.user?.userId || 0,
        type,
        targetId: String(targetId),
        targetType,
        tournamentId: String(tournamentId),
        reason,
        createdAt: new Date()
      }
    })

    return ApiResponse.success(res, vote, 'Vote enregistré avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du vote:', error)
    return ApiResponse.error(res, 'Erreur lors de l\'enregistrement du vote')
  }
})

// Route pour obtenir les résultats des votes
router.get('/votes', async (req, res) => {
  try {
    const { type, tournamentId, limit = 10 } = req.query

    let whereClause: any = {}

    if (type) {
      whereClause.type = type
    }

    if (tournamentId) {
      whereClause.tournamentId = String(tournamentId as string)
    }

    const votes = await prisma.vote.groupBy({
      by: ['targetId', 'targetType'],
      where: whereClause,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: String(limit as string)
    })

    // Enrichir avec les détails des cibles
    const enrichedVotes = await Promise.all(
      votes.map(async (vote) => {
        let target
        if (vote.targetType === 'player') {
          target = await prisma.player.findUnique({
            where: { id: vote.targetId },
            include: { team: true }
          })
        } else if (vote.targetType === 'match') {
          target = await prisma.match.findUnique({
            where: { id: vote.targetId },
            include: {
              homeTeamRef: true,
              group: true,
              tournament: true,
            }
          })
        }

        return {
          targetId: vote.targetId,
          targetType: vote.targetType,
          votes: vote._count.id,
          target
        }
      })
    )

    return ApiResponse.success(res, enrichedVotes)
  } catch (error) {
    console.error('Erreur lors de la récupération des votes:', error)
    return ApiResponse.error(res, 'Erreur lors de la récupération des votes')
  }
})

// Route pour rejoindre une équipe en tant que fan
router.post('/teams/:id/fans', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { level = 'supporter' } = req.body // 'supporter', 'ultra', 'membre'

    // Vérifier si l'utilisateur est déjà fan
    const existingFan = await prisma.teamFan.findFirst({
      where: {
        teamId: String(id),
        userId: req.user?.userId || 0
      }
    })

    if (existingFan) {
      return ApiResponse.error(res, 'Vous êtes déjà fan de cette équipe', 409)
    }

    const fan = await prisma.teamFan.create({
      data: {
        teamId: String(id),
        userId: req.user?.userId || 0,
        level,
        joinedAt: new Date()
      },
      include: {
        team: true,
        user: true
      }
    })

    return ApiResponse.success(res, fan, 'Vous êtes maintenant fan de cette équipe')
  } catch (error) {
    console.error('Erreur lors de l\'ajout du fan:', error)
    return ApiResponse.error(res, 'Erreur lors de l\'ajout du fan')
  }
})

// Route pour obtenir les fans d'une équipe
router.get('/teams/:id/fans', async (req, res) => {
  try {
    const { id } = req.params
    const { level, page = 1, limit = 20 } = req.query

    let whereClause: any = {
      teamId: String(id)
    }

    if (level) {
      whereClause.level = level
    }

    const fans = await prisma.teamFan.findMany({
      where: whereClause,
      include: {
        user: true
      },
      orderBy: [
        { level: 'desc' },
        { joinedAt: 'asc' }
      ],
      skip: (String(page as string) - 1) * String(limit as string),
      take: String(limit as string)
    })

    const total = await prisma.teamFan.count({ where: whereClause })

    return ApiResponse.success(res, {
      fans,
      pagination: {
        page: String(page as string),
        limit: String(limit as string),
        total,
        pages: Math.ceil(total / String(limit as string))
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des fans:', error)
    return ApiResponse.error(res, 'Erreur lors de la récupération des fans')
  }
})

// Route pour créer une ligue communautaire
router.post('/community/leagues', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      region,
      season,
      maxTeams,
      rules,
      startDate,
      endDate
    } = req.body

    const league = await prisma.communityLeague.create({
      data: {
        name,
        description,
        region,
        season,
        maxTeams: String(maxTeams),
        rules,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCommunityLeague: true,
        createdBy: req.user?.userId || 0,
        status: 'active'
      }
    })

    return ApiResponse.success(res, league, 'Ligue communautaire créée avec succès')
  } catch (error) {
    console.error('Erreur lors de la création de la ligue:', error)
    return ApiResponse.error(res, 'Erreur lors de la création de la ligue')
  }
})

// Route pour rejoindre une ligue communautaire
router.post('/community/leagues/:id/join', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { teamId } = req.body

    const league = await prisma.communityLeague.findUnique({
      where: { id: String(id) },
      include: {
        participants: true
      }
    })

    if (!league) {
      return ApiResponse.error(res, 'Ligue non trouvée', 404)
    }

    if (league.participants.length >= league.maxTeams) {
      return ApiResponse.error(res, 'La ligue est complète', 409)
    }

    const participant = await prisma.communityLeagueParticipant.create({
      data: {
        leagueId: String(id),
        teamId: String(teamId),
        joinedAt: new Date()
      }
    })

    return ApiResponse.success(res, participant, 'Équipe ajoutée à la ligue')
  } catch (error) {
    console.error('Erreur lors de l\'ajout à la ligue:', error)
    return ApiResponse.error(res, 'Erreur lors de l\'ajout à la ligue')
  }
})

export default router 