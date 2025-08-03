import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { PrismaClient } from '@prisma/client'
import { success, created, badRequest, notFound } from '../utils/apiResponse'

// Alias for authMiddleware to fix import issue
const authMiddleware = authenticateToken

const router = Router()
const prisma = new PrismaClient()

// Route pour effectuer le tirage de groupes
router.post('/tournaments/:id/draw', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { numberOfGroups } = req.body

    const tournament = await prisma.tournament.findUnique({
      where: { id: String(id) },
      include: {
        tournamentTeams: {
          include: {
            team: true
          }
        }
      }
    })

    if (!tournament) {
      return notFound(res, 'Tournoi non trouvé')
    }

    if (tournament.drawCompleted) {
      return badRequest(res, 'Le tirage a déjà été effectué pour ce tournoi')
    }

    const teams = tournament.tournamentTeams.map(tt => tt.team)
    if (teams.length < numberOfGroups * 2) {
      return badRequest(res, 'Nombre d\'équipes insuffisant pour le nombre de groupes demandé')
    }

    // Mélanger les équipes aléatoirement
    const shuffledTeams = shuffleArray([...teams])
    
    // Répartir les équipes dans les groupes
    const groups = []
    const teamsPerGroup = Math.ceil(teams.length / numberOfGroups)
    
    for (let i = 0; i < numberOfGroups; i++) {
      const groupTeams = shuffledTeams.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup)
      groups.push({
        name: `Groupe ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
        teams: groupTeams,
        index: i
      })
    }

    // Sauvegarder les groupes dans la base de données
    await prisma.tournament.update({
      where: { id: String(id) },
      data: {
        drawCompleted: true,
        numberOfGroups: numberOfGroups,
        teamsPerGroup: teamsPerGroup
      }
    })

    // Créer les enregistrements de groupes
    for (const group of groups) {
      const createdGroup = await prisma.group.create({
        data: {
          name: group.name,
          tournamentId: String(id)
        }
      })

      // Ajouter les équipes au groupe
      for (const team of group.teams) {
        await prisma.groupTeam.create({
          data: {
            groupId: createdGroup.id,
            teamId: team.id,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0
          }
        })
      }
    }

    // Émettre un événement de tirage (pour WebSocket)
    emitDrawEvent(parseInt(tournament.id), groups)

    return success(res, {
      message: 'Tirage effectué avec succès',
      groups: groups.map(group => ({
        name: group.name,
        teams: group.teams.map(team => ({
          id: team.id,
          name: team.name,
          logo: team.logo
        }))
      }))
    })
  } catch (error) {
    console.error('Erreur lors du tirage:', error)
    return badRequest(res, 'Erreur lors du tirage')
  }
})

// Route pour obtenir l'animation de tirage
router.get('/tournaments/:id/draw-animation', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const tournament = await prisma.tournament.findUnique({
      where: { id: String(id) },
      include: {
        tournamentTeams: {
          include: {
            team: true
          }
        },
        groups: {
          include: {
            groupTeams: {
              include: {
                team: true
              }
            }
          }
        }
      }
    })

    if (!tournament) {
      return notFound(res, 'Tournoi non trouvé')
    }

    if (!tournament.drawCompleted) {
      return badRequest(res, 'Le tirage n\'a pas encore été effectué')
    }

    // Préparer les données pour l'animation
    const drawData = {
      tournament: {
        id: tournament.id,
        name: tournament.name,
        logo: tournament.logo
      },
      groups: tournament.groups.map(group => ({
        name: group.name,
        teams: group.groupTeams.map(gt => ({
          id: gt.team.id,
          name: gt.team.name,
          logo: gt.team.logo
        }))
      })),
      remainingTeams: tournament.tournamentTeams.map(tt => tt.team).filter(team => 
        !tournament.groups.some(group => 
          group.groupTeams.some(gt => gt.teamId === team.id)
        )
      )
    }

    return success(res, drawData)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'animation:', error)
    return badRequest(res, 'Erreur lors de la récupération de l\'animation')
  }
})

// Route pour annuler le tirage
router.delete('/tournaments/:id/draw', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const tournament = await prisma.tournament.findUnique({
      where: { id: String(id) },
      include: {
        groups: {
          include: {
            groupTeams: true
          }
        }
      }
    })

    if (!tournament) {
      return notFound(res, 'Tournoi non trouvé')
    }

    // Supprimer tous les groupes et leurs équipes
    for (const group of tournament.groups) {
      await prisma.groupTeam.deleteMany({
        where: { groupId: group.id }
      })
      await prisma.group.delete({
        where: { id: group.id }
      })
    }

    // Réinitialiser le tournoi
    await prisma.tournament.update({
      where: { id: String(id) },
      data: {
        drawCompleted: false,
        numberOfGroups: 0,
        teamsPerGroup: 0
      }
    })

    return success(res, { message: 'Tirage annulé avec succès' })
  } catch (error) {
    console.error('Erreur lors de l\'annulation du tirage:', error)
    return badRequest(res, 'Erreur lors de l\'annulation du tirage')
  }
})

// Fonction pour mélanger un tableau aléatoirement
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Fonction pour émettre un événement de tirage (simulation WebSocket)
function emitDrawEvent(tournamentId: number, groups: any[]) {
  // Dans une vraie implémentation, cela enverrait un événement WebSocket
  console.log(`🎲 Événement de tirage émis pour le tournoi ${tournamentId}`)
  console.log('Groupes tirés:', groups.map(g => ({
    name: g.name,
    teams: g.teams.map((t: any) => t.name)
  })))
}

export default router 