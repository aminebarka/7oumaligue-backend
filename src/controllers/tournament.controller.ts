import type { Request, Response } from "express"
import { prisma } from "../config/database"
import { success, created, notFound, badRequest } from "../utils/apiResponse"
import { DrawSystem, TeamWithStats } from "../utils/drawUtils"
import { TournamentScheduler } from "../utils/roundRobinUtils"

export const createTournament = async (req: Request, res: Response) => {
  const { name, startDate, endDate, prize, rules, numberOfGroups, logo, stadium } = req.body

  console.log("🏆 Tentative de création de tournoi:", {
    name,
    startDate,
    endDate,
    prize,
    rules,
    numberOfGroups,
    logo,
    stadium,
    userId: req.user?.userId,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    tenantId: req.user?.tenantId,
    headers: req.headers,
    method: req.method,
    url: req.url,
    body: req.body
  });

  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      console.log("❌ Utilisateur non authentifié");
      return badRequest(res, "Utilisateur non authentifié");
    }

    // Vérifier le rôle de l'utilisateur
    if (req.user.role !== 'admin' && req.user.role !== 'coach') {
      console.log("❌ Permissions insuffisantes:", {
        userRole: req.user.role,
        requiredRoles: ['admin', 'coach']
      });
      return badRequest(res, "Permissions insuffisantes pour créer un tournoi");
    }

    // Vérifier les champs requis
    if (!name || !startDate || !endDate) {
      console.log("❌ Champs requis manquants:", { name, startDate, endDate });
      return badRequest(res, "Nom, date de début et date de fin sont requis");
    }

    // Valider les dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.log("❌ Dates invalides:", { startDate, endDate });
      return badRequest(res, "Dates invalides");
    }

    if (start >= end) {
      console.log("❌ Date de début doit être avant la date de fin");
      return badRequest(res, "La date de début doit être avant la date de fin");
    }

    console.log("✅ Validation des données réussie");

    const tournament = await prisma.tournament.create({
      data: {
        name,
        startDate: start,
        endDate: end,
        prize: prize || "",
        rules: rules || "",
        logo: logo || "🏆",
        stadium: stadium || "",
        numberOfGroups: Number.parseInt(numberOfGroups) || 2,
        status: "upcoming",
        tenantId: req.user?.tenantId,
      },
    })

    console.log("✅ Tournoi créé avec succès:", tournament);

    return created(res, "Tournoi créé avec succès", tournament)
  } catch (error: any) {
    console.error("❌ Erreur création tournoi:", {
      error: error?.message || error,
      stack: error?.stack,
      name,
      startDate,
      endDate,
      userId: req.user?.userId,
      tenantId: req.user?.tenantId
    });
    return badRequest(res, "Erreur lors de la création du tournoi")
  }
}

export const getTournaments = async (req: Request, res: Response) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        groups: {
          include: {
            groupTeams: {
              include: {
                team: true
              }
            }
          }
        },
        matches: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return success(res, "Tournois récupérés avec succès", tournaments)
  } catch (error) {
    console.error("Erreur récupération tournois:", error)
    return badRequest(res, "Erreur lors de la récupération des tournois")
  }
}

export const getTournamentById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: id,
      },
      include: {
        groups: {
          include: {
            groupTeams: {
              include: {
                team: true
              }
            }
          }
        },
        matches: true,
        tournamentTeams: {
          include: {
            team: true
          }
        },
      },
    })

    if (!tournament) {
      return notFound(res, "Tournoi non trouvé")
    }

    return success(res, "Tournoi récupéré avec succès", tournament)
  } catch (error) {
    console.error("Erreur récupération tournoi:", error)
    return badRequest(res, "Erreur lors de la récupération du tournoi")
  }
}

export const updateTournament = async (req: Request, res: Response) => {
  const { id } = req.params
  const updateData = req.body

  try {
    // Convert dates if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate)
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate)
    }

    const tournament = await prisma.tournament.update({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
      data: updateData,
    })

    return success(res, "Tournoi mis à jour avec succès", tournament)
  } catch (error) {
    console.error("Erreur mise à jour tournoi:", error)
    return badRequest(res, "Erreur lors de la mise à jour du tournoi")
  }
}

export const deleteTournament = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.tournament.delete({
      where: {
        id: id,
        tenantId: req.user?.tenantId,
      },
    })

    return success(res, "Tournoi supprimé avec succès", null)
  } catch (error) {
    console.error("Erreur suppression tournoi:", error)
    return badRequest(res, "Erreur lors de la suppression du tournoi")
  }
}

export const addTeamToTournament = async (req: Request, res: Response) => {
  const { id } = req.params
  const { teamId } = req.body

      console.log("Tentative d'ajout d'équipe:", { tournamentId: id, teamId, userTenantId: req.user?.tenantId });

    try {
      // Vérifier l'état actuel du tournoi
      const currentTournament = await prisma.tournament.findUnique({
        where: { id },
        include: {
          tournamentTeams: {
            include: {
              team: true
            }
          }
        }
      });
      
      console.log("Tournoi actuel:", {
        id: currentTournament?.id,
        name: currentTournament?.name,
        teamsCount: 0,
        teamIds: []
      });

      // Vérifier si l'équipe existe
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          // Permettre les équipes sans tenantId ou avec le même tenantId
          OR: [
            { tenantId: null },
            { tenantId: req.user?.tenantId }
          ]
        },
      })

      console.log("Équipe trouvée:", team ? { id: team.id, name: team.name, tenantId: team.tenantId } : "Non trouvée");

    if (!team) {
      return notFound(res, "Équipe non trouvée ou vous n'avez pas les permissions pour l'ajouter")
    }

    // Vérifier si l'équipe n'est pas déjà inscrite
    const existingTournamentTeam = await prisma.tournamentTeam.findFirst({
      where: {
        tournamentId: id,
        teamId: teamId,
      },
    })

    if (existingTournamentTeam) {
      return badRequest(res, "Cette équipe est déjà inscrite au tournoi")
    }

    const tournamentTeam = await prisma.tournamentTeam.create({
      data: {
        tournamentId: id,
        teamId: teamId,
      },
      include: {
        team: true,
      },
    })

    console.log("Équipe ajoutée avec succès:", { tournamentTeamId: tournamentTeam.id, teamId: tournamentTeam.teamId });

    return created(res, "Équipe ajoutée au tournoi", tournamentTeam)
  } catch (error) {
    console.error("Erreur ajout équipe:", error)
    return badRequest(res, "Erreur lors de l'ajout de l'équipe")
  }
}

export const removeTeamFromTournament = async (req: Request, res: Response) => {
  const { id, teamId } = req.params

  try {
    const tournamentTeam = await prisma.tournamentTeam.findFirst({
      where: {
        tournamentId: id,
        teamId: teamId,
      },
    })

    if (!tournamentTeam) {
      return notFound(res, "Équipe non trouvée dans ce tournoi")
    }

    await prisma.tournamentTeam.delete({
      where: {
        id: tournamentTeam.id,
      },
    })

    return success(res, "Équipe retirée du tournoi", null)
  } catch (error) {
    console.error("Erreur retrait équipe:", error)
    return badRequest(res, "Erreur lors du retrait de l'équipe")
  }
}

export const performDraw = async (req: Request, res: Response) => {
  const { id } = req.params
  const { numberOfGroups } = req.body

  try {
    const tournament = await prisma.tournament.findUnique({
      where: {
        id,
        tenantId: req.user?.tenantId,
      },
      include: {
        groups: true,
        matches: true,
      },
    })

    if (!tournament) {
      return notFound(res, "Tournoi non trouvé")
    }

    if (tournament.drawCompleted) {
      return badRequest(res, "Le tirage au sort a déjà été effectué")
    }

    // Temporairement désactivé pour permettre au serveur de démarrer
    console.log("🎲 Tirage au sort temporairement désactivé");
    return success(res, "Tirage au sort temporairement désactivé", { message: "Tirage au sort temporairement désactivé" });
  } catch (error) {
    console.error("Erreur lors du tirage au sort:", error)
    return badRequest(res, "Erreur lors du tirage au sort")
  }
}

export const generateMatches = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { matchTime } = req.body
    
    console.log('🏆 Génération des matchs pour le tournoi:', id)
    console.log('⏰ Heure des matchs:', matchTime || '20:00')
    
    // Récupérer le tournoi avec ses groupes
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
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
      console.log('❌ Tournoi non trouvé:', id)
      return res.status(404).json({
        success: false,
        message: 'Tournoi non trouvé'
      })
    }

    if (!tournament.groups || tournament.groups.length === 0) {
      console.log('❌ Aucun groupe trouvé pour ce tournoi')
      return res.status(400).json({
        success: false,
        message: 'Aucun groupe trouvé pour ce tournoi'
      })
    }

    console.log(`📊 ${tournament.groups.length} groupes trouvés`)

    // Supprimer les matchs existants
    await prisma.match.deleteMany({
      where: { tournamentId: id }
    })

    console.log('🗑️ Anciens matchs supprimés')

    // Générer le planning complet avec la nouvelle logique
    const schedule = await TournamentScheduler.generateTournamentSchedule(id)
    
    console.log(`📅 Planning généré: ${schedule.totalDays} jours total`)
    console.log(`   - Phase de groupes: ${schedule.groupPhase.length} matchs`)
    console.log(`   - Phase finale: ${schedule.finalPhase.length} matchs`)

    // Créer les matchs de la phase de groupes
    for (const matchSchedule of schedule.groupPhase) {
      const matchDate = new Date(matchSchedule.date)
      
      // Définir l'heure du match si spécifiée
      if (matchTime) {
        const [hours, minutes] = matchTime.split(':').map(Number)
        matchDate.setHours(hours, minutes, 0, 0)
      }

      console.log(`📅 Jour ${matchSchedule.matchNumber}: ${matchSchedule.homeTeam} vs ${matchSchedule.awayTeam} (${matchSchedule.round})`)

      // Récupérer les informations des équipes pour les relations
      const homeTeam = await prisma.team.findFirst({
        where: { name: matchSchedule.homeTeam }
      });

      if (!homeTeam) {
        console.log(`⚠️ Équipe non trouvée: ${matchSchedule.homeTeam}`);
        continue;
      }

      await prisma.match.create({
        data: {
          tournamentId: id,
          groupId: matchSchedule.groupId!,
          homeTeamId: homeTeam.id, // Utiliser l'ID pour la relation
          homeTeam: homeTeam.name, // Garder le nom pour l'affichage
          date: matchDate.toISOString().split('T')[0],
          time: matchTime || '20:00',
          venue: 'Stade Principal',
          status: 'scheduled',
          tenantId: req.user?.tenantId,
        }
      })
    }

    // Pour l'instant, on ne crée que les matchs de la phase de groupes
    // Les matchs de la phase finale seront créés après la qualification des équipes
    console.log('📝 Note: Les matchs de la phase finale seront créés après la qualification des équipes')

    console.log('✅ Tous les matchs de groupes ont été générés avec succès')
    console.log(`📊 Résumé: ${schedule.groupPhase.length} matchs de groupes générés`)

    return res.json({
      success: true,
      message: `Matchs de groupes générés avec succès: ${schedule.groupPhase.length} matchs`,
      data: {
        totalMatches: schedule.groupPhase.length,
        totalDays: schedule.totalDays,
        groupMatches: schedule.groupPhase.length,
        finalMatches: 0
      }
    })
  } catch (error) {
    console.error('❌ Erreur lors de la génération des matchs:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des matchs: ' + (error as any).message
    })
  }
}

export const updateFinalPhaseMatches = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    console.log('🏆 Mise à jour des équipes qualifiées pour la phase finale:', id)
    
    // Récupérer le tournoi
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
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
      console.log('❌ Tournoi non trouvé:', id)
      return res.status(404).json({
        success: false,
        message: 'Tournoi non trouvé'
      })
    }

    // Calculer les équipes qualifiées
    const qualifiedTeams = await TournamentScheduler.calculateQualifiedTeams(id)
    
    if (qualifiedTeams.length < 8) {
      console.log('⚠️ Pas assez d\'équipes qualifiées:', qualifiedTeams.length)
      return res.status(400).json({
        success: false,
        message: `Pas assez d'équipes qualifiées (${qualifiedTeams.length}/8)`
      })
    }

    // Récupérer les matchs de la phase finale
    const finalMatches = await prisma.match.findMany({
      where: {
        tournamentId: id,
        groupId: null // Matchs sans groupe = phase finale
      },
      orderBy: {
        date: 'asc'
      }
    })

    console.log(`📊 ${finalMatches.length} matchs de phase finale trouvés`)

    // Mettre à jour les matchs avec les équipes qualifiées
    // Les 4 premiers matchs sont les quarts de finale
    for (let i = 0; i < Math.min(4, finalMatches.length); i++) {
      const match = finalMatches[i]
      const homeTeamIndex = i * 2
      const awayTeamIndex = i * 2 + 1
      
      if (homeTeamIndex < qualifiedTeams.length) {
        await prisma.match.update({
          where: { id: match.id },
          data: {
            homeTeam: qualifiedTeams[homeTeamIndex]
          }
        })
        
        console.log(`🏆 QF${i + 1}: ${qualifiedTeams[homeTeamIndex]}`)
      }
    }

    console.log('✅ Équipes qualifiées assignées aux quarts de finale')

    return res.json({
      success: true,
      message: 'Équipes qualifiées assignées avec succès',
      data: {
        qualifiedTeams,
        updatedMatches: finalMatches.length
      }
    })
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des équipes qualifiées:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des équipes qualifiées: ' + (error as any).message
    })
  }
}

export const generateFinalPhaseMatches = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { matchTime } = req.body
    
    console.log('🏆 Génération des matchs de la phase finale pour le tournoi:', id)
    console.log('⏰ Heure des matchs:', matchTime || '20:00')
    
    // Récupérer le tournoi
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
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
      console.log('❌ Tournoi non trouvé:', id)
      return res.status(404).json({
        success: false,
        message: 'Tournoi non trouvé'
      })
    }

    // Calculer les équipes qualifiées
    const qualifiedTeams = await TournamentScheduler.calculateQualifiedTeams(id)
    
    if (qualifiedTeams.length < 8) {
      console.log('⚠️ Pas assez d\'équipes qualifiées:', qualifiedTeams.length)
      return res.status(400).json({
        success: false,
        message: `Pas assez d'équipes qualifiées (${qualifiedTeams.length}/8)`
      })
    }

    // Supprimer les anciens matchs de phase finale s'ils existent
    await prisma.match.deleteMany({
      where: {
        tournamentId: id,
        groupId: null // Matchs sans groupe = phase finale
      }
    })

    console.log('🗑️ Anciens matchs de phase finale supprimés')

    // Générer le planning de la phase finale
    const schedule = await TournamentScheduler.generateTournamentSchedule(id)
    
    // Créer les matchs de la phase finale
    let matchIndex = 0
    
    // Quarts de finale (4 matchs)
    for (let i = 0; i < 4; i++) {
      const matchSchedule = schedule.finalPhase[i]
      const matchDate = new Date(matchSchedule.date)
      
      if (matchTime) {
        const [hours, minutes] = matchTime.split(':').map(Number)
        matchDate.setHours(hours, minutes, 0, 0)
      }

      const homeTeamIndex = i * 2
      const awayTeamIndex = i * 2 + 1

      console.log(`🏆 QF${i + 1}: ${qualifiedTeams[homeTeamIndex]} vs ${qualifiedTeams[awayTeamIndex]}`)

      await prisma.match.create({
        data: {
          tournamentId: id,
          homeTeam: qualifiedTeams[homeTeamIndex],
          date: matchDate.toISOString().split('T')[0],
          time: matchTime || '20:00',
          venue: 'Stade Principal',
          status: 'scheduled',
          tenantId: req.user?.tenantId,
        }
      })
      matchIndex++
    }

    // Demi-finales (2 matchs) - placeholders pour l'instant
    for (let i = 4; i < 6; i++) {
      const matchSchedule = schedule.finalPhase[i]
      const matchDate = new Date(matchSchedule.date)
      
      if (matchTime) {
        const [hours, minutes] = matchTime.split(':').map(Number)
        matchDate.setHours(hours, minutes, 0, 0)
      }

      console.log(`🏆 SF${i - 3}: Vainqueur QF${(i-4)*2 + 1} vs Vainqueur QF${(i-4)*2 + 2}`)

      await prisma.match.create({
        data: {
          tournamentId: id,
          homeTeam: `SF${i-3}_HOME`,
          date: matchDate.toISOString().split('T')[0],
          time: matchTime || '20:00',
          venue: 'Stade Principal',
          status: 'scheduled',
          tenantId: req.user?.tenantId,
        }
      })
      matchIndex++
    }

    // Finale (1 match) - placeholder pour l'instant
    const finalMatch = schedule.finalPhase[6]
    const finalDate = new Date(finalMatch.date)
    
    if (matchTime) {
      const [hours, minutes] = matchTime.split(':').map(Number)
      finalDate.setHours(hours, minutes, 0, 0)
    }

    console.log('🏆 Finale: Vainqueur SF1 vs Vainqueur SF2')

    await prisma.match.create({
      data: {
        tournamentId: id,
        homeTeam: 'FINAL_HOME',
        date: finalDate.toISOString().split('T')[0],
        time: matchTime || '20:00',
        venue: 'Stade Principal',
        status: 'scheduled',
        tenantId: req.user?.tenantId,
      }
    })

    console.log('✅ Matchs de la phase finale générés avec succès')

    return res.json({
      success: true,
      message: 'Matchs de la phase finale générés avec succès',
      data: {
        qualifiedTeams,
        totalMatches: 7,
        quarters: 4,
        semis: 2,
        final: 1
      }
    })
  } catch (error) {
    console.error('❌ Erreur lors de la génération des matchs de la phase finale:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des matchs de la phase finale: ' + (error as any).message
    })
  }
}

// Fonctions temporaires pour la gestion des groupes
export const addTeamToGroup = async (req: Request, res: Response) => {
  try {
    const { groupId, teamId } = req.body;
    
    console.log('🔍 Tentative d\'ajout d\'équipe au groupe:', { groupId, teamId });
    
    if (!groupId || !teamId) {
      return res.status(400).json({
        success: false,
        message: 'ID du groupe et ID de l\'équipe requis'
      });
    }
    
    // Vérifier que le groupe existe
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      console.log('❌ Groupe non trouvé:', groupId);
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    // Vérifier que l'équipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });
    
    if (!team) {
      console.log('❌ Équipe non trouvée:', teamId);
      return res.status(404).json({
        success: false,
        message: 'Équipe non trouvée'
      });
    }
    
    // Vérifier que l'équipe n'est pas déjà dans un groupe du même tournoi
    const existingGroupTeam = await prisma.groupTeam.findFirst({
      where: {
        teamId,
        group: {
          tournamentId: group.tournamentId
        }
      }
    });
    
    if (existingGroupTeam) {
      console.log('❌ Équipe déjà dans un groupe:', teamId);
      return res.status(400).json({
        success: false,
        message: 'Cette équipe est déjà dans un groupe de ce tournoi'
      });
    }
    
    console.log('✅ Création du GroupTeam:', { groupId, teamId });
    
    const groupTeam = await prisma.groupTeam.create({
      data: {
        groupId,
        teamId
      },
      include: {
        team: true,
        group: true
      }
    });
    
    console.log('✅ GroupTeam créé avec succès:', groupTeam.id);
    
    return res.status(201).json({
      success: true,
      data: groupTeam
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de l\'équipe au groupe:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'équipe au groupe: ' + (error as any).message
    });
  }
};

export const removeTeamFromGroup = async (req: Request, res: Response) => {
  try {
    const { groupId, teamId } = req.body;
    
    console.log('🔍 Tentative de retrait d\'équipe du groupe:', { groupId, teamId });
    
    if (!groupId || !teamId) {
      return res.status(400).json({
        success: false,
        message: 'ID du groupe et ID de l\'équipe requis'
      });
    }
    
    // Vérifier que le groupe existe
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      console.log('❌ Groupe non trouvé:', groupId);
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    // Vérifier que l'équipe existe dans ce groupe
    const existingGroupTeam = await prisma.groupTeam.findFirst({
      where: {
        groupId,
        teamId
      }
    });
    
    if (!existingGroupTeam) {
      console.log('❌ Équipe non trouvée dans ce groupe:', { groupId, teamId });
      return res.status(404).json({
        success: false,
        message: 'Équipe non trouvée dans ce groupe'
      });
    }
    
    console.log('✅ Suppression des matchs de l\'équipe dans ce groupe');
    
    // Supprimer les matchs de cette équipe dans ce groupe
    await prisma.match.deleteMany({
      where: {
        groupId,
        homeTeam: teamId
      }
    });
    
    console.log('✅ Retrait de l\'équipe du groupe');
    
    // Retirer l'équipe du groupe
    await prisma.groupTeam.deleteMany({
      where: {
        groupId,
        teamId
      }
    });
    
    console.log('✅ Équipe retirée avec succès');
    
    return res.json({
      success: true,
      message: 'Équipe retirée du groupe avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors du retrait de l\'équipe du groupe:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du retrait de l\'équipe du groupe: ' + (error as any).message
    });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.body;
    
    console.log('🔍 Tentative de suppression du groupe:', { groupId });
    
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'ID du groupe requis'
      });
    }
    
    // Vérifier que le groupe existe
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        groupTeams: true
      }
    });
    
    if (!group) {
      console.log('❌ Groupe non trouvé:', groupId);
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    console.log('✅ Suppression des équipes du groupe');
    
    // Supprimer d'abord les équipes du groupe
    await prisma.groupTeam.deleteMany({
      where: { groupId }
    });
    
    console.log('✅ Suppression des matchs du groupe');
    
    // Supprimer les matchs du groupe
    await prisma.match.deleteMany({
      where: { groupId }
    });
    
    console.log('✅ Suppression du groupe');
    
    // Supprimer le groupe
    await prisma.group.delete({
      where: { id: groupId }
    });
    
    console.log('✅ Groupe supprimé avec succès');
    
    return res.json({
      success: true,
      message: 'Groupe supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du groupe:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du groupe: ' + (error as any).message
    });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, tournamentId } = req.body;
    
    console.log('🔍 Tentative de création de groupe:', { name, tournamentId });
    
    if (!name || !tournamentId) {
      return res.status(400).json({
        success: false,
        message: 'Nom et ID du tournoi requis'
      });
    }
    
    // Vérifier que le tournoi existe
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    });
    
    if (!tournament) {
      console.log('❌ Tournoi non trouvé:', tournamentId);
      return res.status(404).json({
        success: false,
        message: 'Tournoi non trouvé'
      });
    }
    
    console.log('✅ Création du groupe');
    
    const group = await prisma.group.create({
      data: {
        name,
        tournamentId
      },
      include: {
        groupTeams: {
          include: {
            team: true
          }
        }
      }
    });
    
    console.log('✅ Groupe créé avec succès:', group.id);
    
    return res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création du groupe:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du groupe: ' + (error as any).message
    });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { groupId, name } = req.body;
    
    console.log('🔍 Tentative de modification du groupe:', { groupId, name });
    
    if (!groupId || !name) {
      return res.status(400).json({
        success: false,
        message: 'ID du groupe et nom requis'
      });
    }
    
    // Vérifier que le groupe existe
    const existingGroup = await prisma.group.findUnique({
      where: { id: groupId }
    });
    
    if (!existingGroup) {
      console.log('❌ Groupe non trouvé:', groupId);
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    console.log('✅ Modification du groupe');
    
    const group = await prisma.group.update({
      where: { id: groupId },
      data: { name },
      include: {
        groupTeams: {
          include: {
            team: true
          }
        }
      }
    });
    
    console.log('✅ Groupe modifié avec succès');
    
    return res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('❌ Erreur lors de la modification du groupe:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du groupe: ' + (error as any).message
    });
  }
};

export const getStadiums = async (req: Request, res: Response) => {
  try {
    const stadiums = await prisma.stadium.findMany({
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
        description: true,
        isPartner: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return success(res, "Stades récupérés avec succès", stadiums);
  } catch (error) {
    console.error("Erreur récupération stades:", error);
    return badRequest(res, "Erreur lors de la récupération des stades");
  }
};
