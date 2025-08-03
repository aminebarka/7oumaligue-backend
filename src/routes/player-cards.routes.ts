import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { PrismaClient } from '@prisma/client'
import { success, created, badRequest, notFound } from '../utils/apiResponse'
import { generatePlayerCard } from '../utils/cardGenerator'

const router = Router()
const prisma = new PrismaClient()

// Route pour obtenir la carte d'un joueur
router.get('/players/:id/card', async (req, res) => {
  try {
    const { id } = req.params
    const { format = 'html' } = req.query

    const player = await prisma.player.findUnique({
      where: { id: String(id) },
      include: {
        team: true,
        playerStats: {
          include: {
            tournament: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        playerBadges: {
          include: {
            tournament: true
          },
          orderBy: {
            earnedAt: 'desc'
          }
        }
      }
    })

    if (!player) {
      return ApiResponse.error(res, 'Joueur non trouvé', 404)
    }

    // Calculer les statistiques globales
    const totalStats = player.playerStats.reduce((acc, stat) => ({
      goals: acc.goals + stat.goals,
      assists: acc.assists + stat.assists,
      matches: acc.matches + stat.matchesPlayed,
      rating: acc.rating + stat.rating
    }), { goals: 0, assists: 0, matches: 0, rating: 0 })

    const averageRating = totalStats.matches > 0 ? totalStats.rating / totalStats.matches : 0

    // Calculer le niveau de réputation
    const reputationLevel = calculateReputationLevel(totalStats, player.playerBadges.length)

    if (format === 'image') {
      // Générer une image de la carte
      const cardImage = await generatePlayerCard({
        player,
        stats: totalStats,
        averageRating,
        reputationLevel,
        badges: player.playerBadges
      })

      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Cache-Control', 'public, max-age=3600')
      return res.send(cardImage)
    }

    // Retourner les données JSON pour l'affichage HTML
    return ApiResponse.success(res, {
      player: {
        id: player.id,
        name: player.name,
        position: player.position,
        level: player.level,
        age: player.age,
        jerseyNumber: player.jerseyNumber,
        team: player.team
      },
      stats: totalStats,
      averageRating: Math.round(averageRating * 10) / 10,
      reputationLevel,
      badges: player.playerBadges,
      achievements: await getPlayerAchievements(player.id)
    })
  } catch (error) {
    console.error('Erreur lors de la génération de la carte:', error)
    return ApiResponse.error(res, 'Erreur lors de la génération de la carte')
  }
})

// Route pour le profil public partageable
router.get('/players/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    const player = await prisma.player.findFirst({
      where: {
        OR: [
          { id: String(slug) || 0 },
          { name: { contains: slug, mode: 'insensitive' } }
        ]
      },
      include: {
        team: true,
        playerStats: {
          include: {
            tournament: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        playerBadges: {
          include: {
            tournament: true
          },
          orderBy: {
            earnedAt: 'desc'
          }
        }
      }
    })

    if (!player) {
      return ApiResponse.error(res, 'Joueur non trouvé', 404)
    }

    // Calculer les statistiques
    const totalStats = player.playerStats.reduce((acc, stat) => ({
      goals: acc.goals + stat.goals,
      assists: acc.assists + stat.assists,
      matches: acc.matches + stat.matchesPlayed,
      rating: acc.rating + stat.rating
    }), { goals: 0, assists: 0, matches: 0, rating: 0 })

    const averageRating = totalStats.matches > 0 ? totalStats.rating / totalStats.matches : 0
    const reputationLevel = calculateReputationLevel(totalStats, player.playerBadges.length)

    // Générer le HTML pour le profil public
    const publicProfileHTML = generatePublicProfileHTML(player, totalStats, averageRating, reputationLevel)

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Cache-Control', 'public, max-age=1800')
    return res.send(publicProfileHTML)
  } catch (error) {
    console.error('Erreur lors de la génération du profil public:', error)
    return ApiResponse.error(res, 'Erreur lors de la génération du profil public')
  }
})

// Route pour les réalisations du joueur
router.get('/players/:id/achievements', async (req, res) => {
  try {
    const { id } = req.params

    const achievements = await getPlayerAchievements(String(id))

    return ApiResponse.success(res, achievements)
  } catch (error) {
    console.error('Erreur lors de la récupération des réalisations:', error)
    return ApiResponse.error(res, 'Erreur lors de la récupération des réalisations')
  }
})

// Route pour la réputation et les niveaux
router.get('/players/:id/reputation', async (req, res) => {
  try {
    const { id } = req.params

    const player = await prisma.player.findUnique({
      where: { id: String(id) },
      include: {
        playerStats: true,
        playerBadges: true
      }
    })

    if (!player) {
      return ApiResponse.error(res, 'Joueur non trouvé', 404)
    }

    const totalStats = player.playerStats.reduce((acc, stat) => ({
      goals: acc.goals + stat.goals,
      assists: acc.assists + stat.assists,
      matches: acc.matches + stat.matchesPlayed,
      rating: acc.rating + stat.rating
    }), { goals: 0, assists: 0, matches: 0, rating: 0 })

    const reputationLevel = calculateReputationLevel(totalStats, player.playerBadges.length)
    const reputationPoints = calculateReputationPoints(totalStats, player.playerBadges)

    return ApiResponse.success(res, {
      level: reputationLevel,
      points: reputationPoints,
      stats: totalStats,
      badges: player.playerBadges,
      nextLevel: getNextLevelInfo(reputationLevel, reputationPoints)
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la réputation:', error)
    return ApiResponse.error(res, 'Erreur lors de la récupération de la réputation')
  }
})

// Route pour mettre à jour la réputation
router.patch('/players/:id/reputation', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { points, reason } = req.body

    // Vérifier que l'utilisateur peut modifier ce joueur
    const player = await prisma.player.findUnique({
      where: { id: String(id) }
    })

    if (!player) {
      return ApiResponse.error(res, 'Joueur non trouvé', 404)
    }

    // Log de la modification de réputation
    await prisma.reputationLog.create({
      data: {
        playerId: String(id),
        points: points,
        reason: reason,
        modifiedBy: req.user?.userId || 0
      }
    })

    return ApiResponse.success(res, { message: 'Réputation mise à jour' })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réputation:', error)
    return ApiResponse.error(res, 'Erreur lors de la mise à jour de la réputation')
  }
})

// Fonctions utilitaires
function calculateReputationLevel(stats: any, badgeCount: number): string {
  const totalPoints = stats.goals * 10 + stats.assists * 5 + stats.matches * 2 + badgeCount * 20

  if (totalPoints >= 1000) return 'Légende'
  if (totalPoints >= 500) return 'Expert'
  if (totalPoints >= 200) return 'Professionnel'
  if (totalPoints >= 100) return 'Avancé'
  if (totalPoints >= 50) return 'Intermédiaire'
  return 'Débutant'
}

function calculateReputationPoints(stats: any, badges: any[]): number {
  return stats.goals * 10 + stats.assists * 5 + stats.matches * 2 + badges.length * 20
}

function getNextLevelInfo(currentLevel: string, currentPoints: number): any {
  const levels = {
    'Débutant': { min: 0, max: 49 },
    'Intermédiaire': { min: 50, max: 99 },
    'Avancé': { min: 100, max: 199 },
    'Professionnel': { min: 200, max: 499 },
    'Expert': { min: 500, max: 999 },
    'Légende': { min: 1000, max: Infinity }
  }

  const levelKeys = Object.keys(levels)
  const currentIndex = levelKeys.indexOf(currentLevel)
  
  if (currentIndex === levelKeys.length - 1) {
    return { level: 'Max', pointsNeeded: 0, progress: 100 }
  }

  const nextLevel = levelKeys[currentIndex + 1]
  const nextLevelMin = levels[nextLevel as keyof typeof levels].min
  const pointsNeeded = nextLevelMin - currentPoints
  const progress = Math.min(100, (currentPoints / nextLevelMin) * 100)

  return { level: nextLevel, pointsNeeded, progress }
}

async function getPlayerAchievements(playerId: number): Promise<any> {
  const stats = await prisma.playerStats.findMany({
    where: { playerId },
    include: { tournament: true }
  })

  const badges = await prisma.playerBadge.findMany({
    where: { playerId },
    include: { tournament: true }
  })

  const achievements = {
    trophies: [],
    records: [],
    milestones: []
  }

  // Calculer les records
  const totalGoals = stats.reduce((sum, stat) => sum + stat.goals, 0)
  const totalAssists = stats.reduce((sum, stat) => sum + stat.assists, 0)
  const totalMatches = stats.reduce((sum, stat) => sum + stat.matchesPlayed, 0)

  if (totalGoals >= 50) achievements.milestones.push({ type: 'goals', value: 50, description: '50 buts marqués' })
  if (totalGoals >= 100) achievements.milestones.push({ type: 'goals', value: 100, description: '100 buts marqués' })
  if (totalAssists >= 25) achievements.milestones.push({ type: 'assists', value: 25, description: '25 passes décisives' })
  if (totalMatches >= 50) achievements.milestones.push({ type: 'matches', value: 50, description: '50 matchs joués' })

  // Ajouter les badges comme trophées
  achievements.trophies = badges.map(badge => ({
    type: 'badge',
    name: badge.badgeName,
    description: badge.description,
    icon: badge.icon,
    earnedAt: badge.earnedAt,
    tournament: badge.tournament?.name
  }))

  return achievements
}

function generatePublicProfileHTML(player: any, stats: any, averageRating: number, reputationLevel: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${player.name} - Profil 7ouma Ligue</title>
    <meta name="description" content="Profil de ${player.name}, ${player.position} de niveau ${reputationLevel} dans 7ouma Ligue">
    <meta property="og:title" content="${player.name} - 7ouma Ligue">
    <meta property="og:description" content="Découvrez le profil de ${player.name}">
    <meta property="og:type" content="profile">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .profile-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; margin-bottom: 20px; }
        .player-header { display: flex; align-items: center; margin-bottom: 20px; }
        .player-avatar { width: 100px; height: 100px; background: #ffd700; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-right: 20px; }
        .player-info h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .player-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #ffd700; }
        .stat-label { font-size: 0.9rem; opacity: 0.8; }
        .badges { display: flex; flex-wrap: wrap; gap: 10px; }
        .badge { background: rgba(255,255,255,0.2); padding: 10px; border-radius: 10px; display: flex; align-items: center; }
        .badge-icon { font-size: 1.5rem; margin-right: 10px; }
        .reputation { background: linear-gradient(45deg, #ffd700, #ffed4e); color: #333; padding: 10px; border-radius: 10px; text-align: center; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="profile-card">
            <div class="player-header">
                <div class="player-avatar">${player.team?.logo || '⚽'}</div>
                <div>
                    <h1>${player.name}</h1>
                    <p>${player.position} • Niveau ${reputationLevel}</p>
                    <p>${player.team?.name || 'Équipe libre'}</p>
                </div>
            </div>
            
            <div class="player-details">
                <div class="stat-card">
                    <div class="stat-value">${stats.goals}</div>
                    <div class="stat-label">Buts</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.assists}</div>
                    <div class="stat-label">Passes décisives</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.matches}</div>
                    <div class="stat-label">Matchs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${Math.round(averageRating * 10) / 10}</div>
                    <div class="stat-label">Note moyenne</div>
                </div>
            </div>
            
            <div class="reputation">
                🏆 Niveau ${reputationLevel}
            </div>
        </div>
        
        <div class="profile-card">
            <h2>Badges et Réalisations</h2>
            <div class="badges">
                ${player.playerBadges.map((badge: any) => `
                    <div class="badge">
                        <span class="badge-icon">${badge.icon}</span>
                        <div>
                            <div><strong>${badge.badgeName}</strong></div>
                            <div>${badge.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>
  `
}

export default router 