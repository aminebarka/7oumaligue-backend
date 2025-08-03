import type { Request, Response } from "express"
import { prisma } from "../config/database"
import { success, created, notFound, badRequest, unauthorized } from "../utils/apiResponse"

export const createTeam = async (req: Request, res: Response) => {
  const { name, logo, coachName } = req.body

  try {
    console.log("=== DÉBUT CRÉATION ÉQUIPE ===");
    console.log("Headers:", req.headers);
    console.log("User:", req.user);
    console.log("Body:", req.body);

    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      console.error("❌ Utilisateur non authentifié lors de la création d'équipe");
      return badRequest(res, "Authentification requise")
    }

    // Vérifier que les données requises sont présentes
    if (!name || name.trim().length === 0) {
      console.error("❌ Nom d'équipe manquant ou vide");
      return badRequest(res, "Le nom de l'équipe est requis")
    }

    // Vérifier que le tenantId est présent
    if (!req.user.tenantId) {
      console.error("❌ TenantId manquant pour l'utilisateur:", req.user);
      return badRequest(res, "Problème d'authentification: tenant manquant")
    }

    console.log("✅ Données validées, tentative de création d'équipe:", { 
      name, 
      logo, 
      coachName, 
      tenantId: req.user.tenantId,
      userId: req.user.userId 
    })

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        logo: logo || null,
        coachName: coachName || null,
        players: [], // Initialize as empty array
        tenantId: req.user.tenantId,
      },
    })

    console.log("✅ Équipe créée avec succès:", { 
      id: team.id, 
      name: team.name, 
      tenantId: team.tenantId 
    })

    return created(res, team, "Équipe créée avec succès")
  } catch (error: any) {
    console.error("❌ ERREUR CRITIQUE lors de la création de l'équipe:", {
      error: error?.message || 'Unknown error',
      name: error?.name,
      code: error?.code,
      stack: error?.stack,
      user: req.user ? { 
        userId: req.user.userId, 
        tenantId: req.user.tenantId,
        email: req.user.email,
        role: req.user.role
      } : 'non authentifié',
      body: req.body
    })
    
    // Gestion spécifique des erreurs Prisma
    if (error?.name === 'PrismaClientKnownRequestError') {
      console.error("❌ Erreur Prisma connue:", error?.code);
      return badRequest(res, `Erreur de base de données: ${error?.code}`)
    }
    
    if (error?.name === 'PrismaClientValidationError') {
      console.error("❌ Erreur de validation Prisma");
      return badRequest(res, "Données invalides pour la création de l'équipe")
    }

    if (error?.name === 'PrismaClientInitializationError') {
      console.error("❌ Erreur d'initialisation Prisma");
      return badRequest(res, "Erreur de connexion à la base de données")
    }
    
    // Si c'est une erreur non gérée, ne pas faire tomber le serveur
    console.error("❌ Erreur non gérée, retour d'erreur générique");
    return badRequest(res, "Erreur lors de la création de l'équipe")
  } finally {
    console.log("=== FIN CRÉATION ÉQUIPE ===");
  }
}

export const getTeams = async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        playerRecords: {
          select: {
            id: true,
            name: true,
            position: true,
            level: true,
            age: true,
            jerseyNumber: true,
          },
        },
        tournamentTeams: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return success(res, teams)
  } catch (error: any) {
    console.error("Erreur récupération équipes:", error?.message || error)
    return badRequest(res, "Erreur lors de la récupération des équipes")
  }
}

export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const team = await prisma.team.findUnique({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        playerRecords: true,
        tournamentTeams: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
        groupTeams: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                tournament: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!team) {
      return notFound(res, "Équipe non trouvée")
    }

    return success(res, team)
  } catch (error: any) {
    console.error("Erreur récupération équipe:", error?.message || error)
    return badRequest(res, "Erreur lors de la récupération de l'équipe")
  }
}

export const updateTeam = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, logo, coachName, coachId } = req.body

  try {
    const updateData: any = {}
    if (name) updateData.name = name
    if (logo !== undefined) updateData.logo = logo
    if (coachName !== undefined) updateData.coachName = coachName
    if (coachId !== undefined) updateData.coachId = coachId

    const team = await prisma.team.update({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
      data: updateData,
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        playerRecords: true,
      },
    })

    return success(res, team, "Équipe mise à jour avec succès")
  } catch (error: any) {
    console.error("Erreur mise à jour équipe:", error?.message || error)
    return badRequest(res, "Erreur lors de la mise à jour de l'équipe")
  }
}

export const deleteTeam = async (req: Request, res: Response) => {
  const { id } = req.params
  const { force } = req.query // Paramètre pour forcer la suppression

  console.log("🗑️  Tentative de suppression d'équipe:", {
    teamId: id,
    force: force,
    userId: req.user?.userId,
    tenantId: req.user?.tenantId,
    headers: req.headers,
    method: req.method,
    url: req.url
  });

  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      console.log("❌ Utilisateur non authentifié");
      return unauthorized(res, "Utilisateur non authentifié");
    }

    // Vérifier que l'équipe existe
    const existingTeam = await prisma.team.findUnique({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
    });

    if (!existingTeam) {
      console.log("❌ Équipe non trouvée:", { teamId: id, tenantId: req.user?.tenantId });
      return notFound(res, "Équipe non trouvée");
    }

    console.log("✅ Équipe trouvée:", existingTeam);

    // Check if team is in any active tournaments
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { teamId: id },
      include: {
        tournament: true,
      },
    });

    console.log("📊 Équipe dans des tournois:", tournamentTeams.length);

    const activeTournaments = tournamentTeams.filter((tt) => tt.tournament.status === "active");

    if (activeTournaments.length > 0 && !force) {
      console.log("❌ Équipe dans un tournoi actif:", activeTournaments);
      return badRequest(res, "Impossible de supprimer une équipe participant à un tournoi actif. Utilisez le paramètre force=true pour forcer la suppression.");
    }

    // Si force=true, supprimer d'abord les liens avec les tournois
    if (force && activeTournaments.length > 0) {
      console.log("⚠️  Suppression forcée - Retrait des liens avec les tournois");
      await prisma.tournamentTeam.deleteMany({
        where: { teamId: id }
      });
      console.log("✅ Liens avec les tournois supprimés");
    }

    // Update all players to remove team reference
    const updatedPlayers = await prisma.player.updateMany({
      where: { teamId: id },
      data: { teamId: null },
    });

    console.log("👥 Joueurs mis à jour:", updatedPlayers.count);

    const deletedTeam = await prisma.team.delete({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
    });

    console.log("✅ Équipe supprimée avec succès:", deletedTeam);

    const message = force 
      ? "Équipe supprimée avec succès (suppression forcée)" 
      : "Équipe supprimée avec succès";

    return success(res, null, message);
  } catch (error: any) {
    console.error("❌ Erreur suppression équipe:", {
      error: error?.message || error,
      stack: error?.stack,
      teamId: id,
      userId: req.user?.userId,
      tenantId: req.user?.tenantId
    });
    return badRequest(res, "Erreur lors de la suppression de l'équipe");
  }
}

export const addPlayerToTeam = async (req: Request, res: Response) => {
  const { id } = req.params
  const { playerId } = req.body

  try {
    // Get current team
    const team = await prisma.team.findUnique({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
    })

    if (!team) {
      return notFound(res, "Équipe non trouvée")
    }

    // Get player
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    })

    if (!player) {
      return notFound(res, "Joueur non trouvé")
    }

    // Check if player is already in a team
    if (player.teamId && player.teamId !== id) {
      return badRequest(res, "Le joueur est déjà dans une autre équipe")
    }

    // Add player to team
    await prisma.player.update({
      where: { id: playerId },
      data: { teamId: id },
    })

    return success(res, null, "Joueur ajouté à l'équipe avec succès")
  } catch (error: any) {
    console.error("Erreur ajout joueur à équipe:", error?.message || error)
    return badRequest(res, "Erreur lors de l'ajout du joueur à l'équipe")
  }
}

export const removePlayerFromTeam = async (req: Request, res: Response) => {
  const { id, playerId } = req.params

  try {
    // Get current team
    const team = await prisma.team.findUnique({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
    })

    if (!team) {
      return notFound(res, "Équipe non trouvée")
    }

    // Get player
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    })

    if (!player) {
      return notFound(res, "Joueur non trouvé")
    }

    // Check if player is in this team
    if (player.teamId !== id) {
      return badRequest(res, "Le joueur n'est pas dans cette équipe")
    }

    // Remove player from team
    await prisma.player.update({
      where: { id: playerId },
      data: { teamId: null },
    })

    return success(res, null, "Joueur retiré de l'équipe avec succès")
  } catch (error: any) {
    console.error("Erreur retrait joueur de équipe:", error?.message || error)
    return badRequest(res, "Erreur lors du retrait du joueur de l'équipe")
  }
}
