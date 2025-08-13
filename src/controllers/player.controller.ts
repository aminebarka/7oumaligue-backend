import type { Request, Response } from "express"
import { prisma } from "../config/database"
import { success, created, notFound, badRequest } from "../utils/apiResponse"

export const createPlayer = async (req: Request, res: Response) => {
  const { name, position, level, age, teamId, jerseyNumber } = req.body

  try {
    // Validate position
    const validPositions = ["Gardien", "Défenseur", "Milieu", "Attaquant"]
    if (!validPositions.includes(position)) {
      return badRequest(res, "Position invalide")
    }

    // Validate level
    const playerLevel = Number.parseInt(level)
    if (playerLevel < 1 || playerLevel > 5) {
      return badRequest(res, "Le niveau doit être entre 1 et 5")
    }

    // Validate age
    const playerAge = Number.parseInt(age)
    if (playerAge < 16 || playerAge > 50) {
      return badRequest(res, "L'âge doit être entre 16 et 50 ans")
    }

    // Check jersey number uniqueness in team if provided
    if (teamId && jerseyNumber) {
      const existingPlayer = await prisma.player.findFirst({
        where: {
          teamId,
          jerseyNumber: Number.parseInt(jerseyNumber),
          tenantId: req.user?.tenantId,
        },
      })

      if (existingPlayer) {
        return badRequest(res, "Ce numéro de maillot est déjà utilisé dans cette équipe")
      }
    }

    // Verify team exists if provided
    if (teamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          tenantId: req.user?.tenantId,
        },
      })

      if (!team) {
        return notFound(res, "Équipe non trouvée")
      }
    }

    const player = await prisma.player.create({
      data: {
        name,
        position,
        level: playerLevel,
        age: playerAge,
        teamId,
        jerseyNumber: jerseyNumber ? Number.parseInt(jerseyNumber) : null,
        tenantId: req.user?.tenantId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    })

    // If player is assigned to a team, update team's players array
    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      })

      if (team) {
        const updatedPlayers = team.players.includes(player.id) ? team.players : [...team.players, player.id]

        await prisma.team.update({
          where: { id: teamId },
          data: { players: updatedPlayers },
        })
      }
    }

    return created(res, "Joueur créé avec succès", player)
  } catch (error) {
    console.error("Erreur création joueur:", error)
    return badRequest(res, "Erreur lors de la création du joueur")
  }
}

export const getPlayers = async (req: Request, res: Response) => {
  try {
    const { teamId, position, available } = req.query

    const whereClause: any = {}

    if (teamId) {
      whereClause.teamId = teamId as string
    }

    if (position) {
      whereClause.position = position as string
    }

    if (available === "true") {
      whereClause.teamId = null
    }

    const players = await prisma.player.findMany({
      where: whereClause,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ teamId: "asc" }, { jerseyNumber: "asc" }, { name: "asc" }],
    })

    return success(res, "Joueurs récupérés avec succès", players)
  } catch (error) {
    console.error("Erreur récupération joueurs:", error)
    return badRequest(res, "Erreur lors de la récupération des joueurs")
  }
}

export const getPlayerById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const player = await prisma.player.findUnique({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
            coachName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!player) {
      return notFound(res, "Joueur non trouvé")
    }

    return success(res, "Joueur récupéré avec succès", player)
  } catch (error) {
    console.error("Erreur récupération joueur:", error)
    return badRequest(res, "Erreur lors de la récupération du joueur")
  }
}

export const updatePlayer = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, position, level, age, teamId, jerseyNumber } = req.body

  try {
    // Get current player to check team change
    const currentPlayer = await prisma.player.findUnique({
      where: {
        id,
        tenantId: req.user?.tenantId,
      },
    })

    if (!currentPlayer) {
      return notFound(res, "Joueur non trouvé")
    }

    // Validate position if provided
    if (position) {
      const validPositions = ["Gardien", "Défenseur", "Milieu", "Attaquant"]
      if (!validPositions.includes(position)) {
        return badRequest(res, "Position invalide")
      }
    }

    // Validate level if provided
    if (level && (Number.parseInt(level) < 1 || Number.parseInt(level) > 5)) {
      return badRequest(res, "Le niveau doit être entre 1 et 5")
    }

    // Validate age if provided
    if (age && (Number.parseInt(age) < 16 || Number.parseInt(age) > 50)) {
      return badRequest(res, "L'âge doit être entre 16 et 50 ans")
    }

    // Check jersey number uniqueness in team if provided
    if (teamId && jerseyNumber) {
      const existingPlayer = await prisma.player.findFirst({
        where: {
          teamId,
          jerseyNumber: Number.parseInt(jerseyNumber),
          tenantId: req.user?.tenantId,
          NOT: { id },
        },
      })

      if (existingPlayer) {
        return badRequest(res, "Ce numéro de maillot est déjà utilisé dans cette équipe")
      }
    }

    // Verify new team exists if provided
    if (teamId && teamId !== currentPlayer.teamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          tenantId: req.user?.tenantId,
        },
      })

      if (!team) {
        return notFound(res, "Équipe non trouvée")
      }
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (position) updateData.position = position
    if (level) updateData.level = Number.parseInt(level)
    if (age) updateData.age = Number.parseInt(age)
    if (teamId !== undefined) updateData.teamId = teamId || null
    if (jerseyNumber !== undefined) updateData.jerseyNumber = jerseyNumber ? Number.parseInt(jerseyNumber) : null

    const player = await prisma.player.update({
      where: { id: id },
      data: updateData,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    })

    // Handle team changes
    if (teamId !== undefined && teamId !== currentPlayer.teamId) {
      // Remove from old team
      if (currentPlayer.teamId) {
        const oldTeam = await prisma.team.findUnique({
          where: { id: currentPlayer.teamId },
        })
        if (oldTeam) {
          const updatedPlayers = oldTeam.players.filter((pid: string) => pid !== id)
          await prisma.team.update({
            where: { id: currentPlayer.teamId },
            data: { players: updatedPlayers },
          })
        }
      }

      // Add to new team
      if (teamId) {
        const newTeam = await prisma.team.findUnique({
          where: { id: teamId },
        })
        if (newTeam) {
          const updatedPlayers = newTeam.players.includes(id) ? newTeam.players : [...newTeam.players, id]

          await prisma.team.update({
            where: { id: teamId },
            data: { players: updatedPlayers },
          })
        }
      }
    }

    return success(res, "Joueur mis à jour", player)
  } catch (error) {
    console.error("Erreur mise à jour joueur:", error)
    return badRequest(res, "Erreur lors de la mise à jour du joueur")
  }
}

export const deletePlayer = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const player = await prisma.player.findUnique({
      where: {
        id,
        tenantId: req.user?.tenantId,
      },
    })

    if (!player) {
      return notFound(res, "Joueur non trouvé")
    }

    // Remove from team's players array
    if (player.teamId) {
      const team = await prisma.team.findUnique({
        where: { id: player.teamId },
      })
      if (team) {
        const updatedPlayers = team.players.filter((pid: string) => pid !== id)
        await prisma.team.update({
          where: { id: player.teamId },
          data: { players: updatedPlayers },
        })
      }
    }

    await prisma.player.delete({
      where: { id: id },
    })

    return success(res, "Joueur supprimé", null)
  } catch (error) {
    console.error("Erreur suppression joueur:", error)
    return badRequest(res, "Erreur lors de la suppression du joueur")
  }
}

export const getPlayersByTeam = async (req: Request, res: Response) => {
  const { teamId } = req.params

  try {
    const players = await prisma.player.findMany({
      where: {
        teamId: teamId,
        tenantId: req.user?.tenantId,
      },
      orderBy: [{ jerseyNumber: "asc" }, { name: "asc" }],
    })

    return success(res, "Joueurs par équipe récupérés avec succès", players)
  } catch (error) {
    console.error("Erreur récupération joueurs par équipe:", error)
    return badRequest(res, "Erreur lors de la récupération des joueurs")
  }
}
