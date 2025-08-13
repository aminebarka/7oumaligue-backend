import type { Request, Response } from "express"
import { prisma } from "../config/database"
import { success, created, notFound, badRequest } from "../utils/apiResponse"

export const createMatch = async (req: Request, res: Response) => {
  try {
    const { date, time, venue, homeTeam, tournamentId, groupId } = req.body

    // Validation des champs requis
    if (!date || !time || !venue || !homeTeam || !tournamentId) {
      return badRequest(res, "Tous les champs sont requis")
    }

    // Convertir la date en format DateTime pour Prisma
    const matchDate = new Date(date + 'T' + time + ':00')

    // Vérifier que la date est valide
    if (isNaN(matchDate.getTime())) {
      return badRequest(res, "Format de date invalide")
    }

    // Vérifier que le tournoi existe
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
    })

    if (!tournament) {
      return notFound(res, "Tournoi non trouvé")
    }

    // Vérifier que l'équipe existe (par nom ou par ID)
    const homeTeamExists = await prisma.team.findFirst({
      where: {
        OR: [
          { name: homeTeam },
          { id: homeTeam }
        ]
      },
    })

    if (!homeTeamExists) {
      return notFound(res, "L'équipe n'existe pas")
    }

    // Vérifier que le groupe existe si fourni
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: {
          id: groupId,
          tournamentId: tournamentId,
        },
      })

      if (!group) {
        return notFound(res, "Groupe non trouvé")
      }
    }

    const match = await prisma.match.create({
      data: {
        date: matchDate, // Utiliser la date convertie
        time,
        venue,
        homeTeamId: homeTeamExists.id, // Utiliser homeTeamId pour la relation
        homeTeam: homeTeamExists.name, // Garder le nom pour l'affichage
        tournamentId,
        groupId,
        status: "scheduled",
        tenantId: req.user?.tenantId,
      },
      include: {
        homeTeamRef: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return created(res, "Match créé avec succès", match)
  } catch (error) {
    console.error("Erreur création match:", error)
    return badRequest(res, "Erreur lors de la création du match")
  }
}

export const getMatches = async (req: Request, res: Response) => {
  try {
    const { tournamentId, groupId, status, date } = req.query

    const whereClause: any = {}

    if (tournamentId) {
      whereClause.tournamentId = tournamentId as string
    }

    if (groupId) {
      whereClause.groupId = groupId as string
    }

    if (status) {
      whereClause.status = status as string
    }

    if (date) {
      whereClause.date = date as string
    }

    const matches = await prisma.match.findMany({
      where: whereClause,
      include: {
        homeTeamRef: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    })

    return success(res, "Matches récupérés avec succès", matches)
  } catch (error) {
    console.error("Erreur récupération matchs:", error)
    return badRequest(res, "Erreur lors de la récupération des matchs")
  }
}

export const getMatchById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const match = await prisma.match.findUnique({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
      include: {
        homeTeamRef: {
          include: {
            playerRecords: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!match) {
      return notFound(res, "Match non trouvé")
    }

    return success(res, "Match récupéré avec succès", match)
  } catch (error) {
    console.error("Erreur récupération match:", error)
    return badRequest(res, "Erreur lors de la récupération du match")
  }
}

export const updateMatch = async (req: Request, res: Response) => {
  const { id } = req.params
  const { date, time, venue, status } = req.body

  try {
    const updateData: any = {}
    if (date) updateData.date = date
    if (time) updateData.time = time
    if (venue) updateData.venue = venue
    if (status) updateData.status = status

    // Pour les admins, permettre la mise à jour de tous les matchs
    const whereClause = req.user?.role === 'admin' 
      ? { id: id }
      : { id: id, tenantId: req.user?.tenantId }

    const match = await prisma.match.update({
      where: whereClause,
      data: updateData,
      include: {
        homeTeamRef: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    })

    return success(res, "Match mis à jour avec succès", match)
  } catch (error) {
    console.error("Erreur mise à jour match:", error)
    return badRequest(res, "Erreur lors de la mise à jour du match")
  }
}

export const updateMatchScore = async (req: Request, res: Response) => {
  const { id } = req.params
  const { homeScore } = req.body

  try {
    const match = await prisma.match.findUnique({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
    })

    if (!match) {
      return notFound(res, "Match non trouvé")
    }

    if (match.status === "completed") {
      return badRequest(res, "Le match est déjà terminé")
    }

    const homeScoreInt = parseInt(homeScore)

    if (isNaN(homeScoreInt)) {
      return badRequest(res, "Score invalide")
    }

    const updatedMatch = await prisma.match.update({
      where: { id: id },
      data: {
        homeScore: homeScoreInt,
        status: "completed",
      },
      include: {
        homeTeamRef: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Update team statistics
    const homeTeamUpdate: any = {
      matchesPlayed: { increment: 1 },
      goalsScored: { increment: homeScoreInt },
      wins: { increment: 1 }, // Simplifié : on considère que l'équipe gagne toujours
    }

    // Update team statistics
    if (match.homeTeam) {
      await Promise.all([
        prisma.team.update({
          where: { id: match.homeTeam },
          data: homeTeamUpdate,
        }),
      ])
    }

    // Update group team statistics if match is in a group
    if (match.groupId && match.homeTeam) {
      const homeGroupTeam = await prisma.groupTeam.findFirst({
        where: {
          groupId: match.groupId,
          teamId: match.homeTeam,
        },
      })

      if (homeGroupTeam) {
        // Update home group team
        const homeGroupUpdate: any = {
          played: { increment: 1 },
          goalsFor: { increment: homeScoreInt },
          wins: { increment: 1 },
          points: { increment: 3 },
        }

        await Promise.all([
          prisma.groupTeam.update({
            where: { id: homeGroupTeam.id },
            data: homeGroupUpdate,
          }),
        ])
      }
    }

    return success(res, "Score du match mis à jour avec succès", updatedMatch)
  } catch (error) {
    console.error("Erreur mise à jour score:", error)
    return badRequest(res, "Erreur lors de la mise à jour du score")
  }
}

export const deleteMatch = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const match = await prisma.match.findUnique({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
    })

    if (!match) {
      return notFound(res, "Match non trouvé")
    }

    if (match.status === "completed") {
      return badRequest(res, "Impossible de supprimer un match terminé")
    }

    await prisma.match.delete({
      where: { id: id },
    })

    return success(res, "Match supprimé avec succès", null)
  } catch (error) {
    console.error("Erreur suppression match:", error)
    return badRequest(res, "Erreur lors de la suppression du match")
  }
}
