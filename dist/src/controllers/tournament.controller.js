"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performDraw = exports.removeTeamFromTournament = exports.addTeamToTournament = exports.deleteTournament = exports.updateTournament = exports.getTournamentById = exports.getTournaments = exports.createTournament = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const createTournament = async (req, res) => {
    const { name, startDate, endDate, prize, rules, numberOfGroups, logo } = req.body;
    try {
        const tournament = await database_1.prisma.tournament.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                prize,
                rules,
                logo,
                numberOfGroups: Number.parseInt(numberOfGroups) || 2,
                status: "upcoming",
                tenantId: req.user?.tenantId,
            },
        });
        return (0, apiResponse_1.created)(res, tournament, "Tournoi créé avec succès");
    }
    catch (error) {
        console.error("Erreur création tournoi:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la création du tournoi");
    }
};
exports.createTournament = createTournament;
const getTournaments = async (req, res) => {
    try {
        const tournaments = await database_1.prisma.tournament.findMany({
            where: {
                tenantId: req.user?.tenantId,
            },
            include: {
                teams: {
                    include: {
                        team: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                coachName: true,
                            },
                        },
                    },
                },
                groups: {
                    include: {
                        groupTeams: {
                            include: {
                                team: {
                                    select: {
                                        id: true,
                                        name: true,
                                        logo: true,
                                    },
                                },
                            },
                        },
                    },
                },
                matches: {
                    include: {
                        homeTeamRef: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                            },
                        },
                        awayTeamRef: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return (0, apiResponse_1.success)(res, tournaments);
    }
    catch (error) {
        console.error("Erreur récupération tournois:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des tournois");
    }
};
exports.getTournaments = getTournaments;
const getTournamentById = async (req, res) => {
    const { id } = req.params;
    try {
        const tournament = await database_1.prisma.tournament.findUnique({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
            include: {
                teams: {
                    include: {
                        team: {
                            include: {
                                playerRecords: true,
                            },
                        },
                    },
                },
                groups: {
                    include: {
                        groupTeams: {
                            include: {
                                team: true,
                            },
                        },
                    },
                },
                matches: {
                    include: {
                        homeTeamRef: true,
                        awayTeamRef: true,
                        group: true,
                    },
                },
            },
        });
        if (!tournament) {
            return (0, apiResponse_1.notFound)(res, "Tournoi non trouvé");
        }
        return (0, apiResponse_1.success)(res, tournament);
    }
    catch (error) {
        console.error("Erreur récupération tournoi:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération du tournoi");
    }
};
exports.getTournamentById = getTournamentById;
const updateTournament = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
        }
        const tournament = await database_1.prisma.tournament.update({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
            data: updateData,
        });
        return (0, apiResponse_1.success)(res, tournament, "Tournoi mis à jour avec succès");
    }
    catch (error) {
        console.error("Erreur mise à jour tournoi:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour du tournoi");
    }
};
exports.updateTournament = updateTournament;
const deleteTournament = async (req, res) => {
    const { id } = req.params;
    try {
        await database_1.prisma.tournament.delete({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
        });
        return (0, apiResponse_1.success)(res, null, "Tournoi supprimé avec succès");
    }
    catch (error) {
        console.error("Erreur suppression tournoi:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la suppression du tournoi");
    }
};
exports.deleteTournament = deleteTournament;
const addTeamToTournament = async (req, res) => {
    const { id } = req.params;
    const { teamId } = req.body;
    console.log("Tentative d'ajout d'équipe:", { tournamentId: id, teamId, userTenantId: req.user?.tenantId });
    try {
        const currentTournament = await database_1.prisma.tournament.findUnique({
            where: { id },
            include: {
                teams: {
                    include: {
                        team: true
                    }
                }
            }
        });
        console.log("Tournoi actuel:", {
            id: currentTournament?.id,
            name: currentTournament?.name,
            teamsCount: currentTournament?.teams.length,
            teamIds: currentTournament?.teams.map(t => t.teamId)
        });
        const team = await database_1.prisma.team.findFirst({
            where: {
                id: teamId,
                OR: [
                    { tenantId: null },
                    { tenantId: req.user?.tenantId }
                ]
            },
        });
        console.log("Équipe trouvée:", team ? { id: team.id, name: team.name, tenantId: team.tenantId } : "Non trouvée");
        if (!team) {
            return (0, apiResponse_1.notFound)(res, "Équipe non trouvée ou vous n'avez pas les permissions pour l'ajouter");
        }
        const existingTournamentTeam = await database_1.prisma.tournamentTeam.findFirst({
            where: {
                tournamentId: id,
                teamId: teamId,
            },
        });
        if (existingTournamentTeam) {
            return (0, apiResponse_1.badRequest)(res, "Cette équipe est déjà inscrite au tournoi");
        }
        const tournamentTeam = await database_1.prisma.tournamentTeam.create({
            data: {
                tournamentId: id,
                teamId: teamId,
            },
            include: {
                team: true,
            },
        });
        console.log("Équipe ajoutée avec succès:", { tournamentTeamId: tournamentTeam.id, teamId: tournamentTeam.teamId });
        return (0, apiResponse_1.created)(res, tournamentTeam, "Équipe ajoutée au tournoi");
    }
    catch (error) {
        console.error("Erreur ajout équipe:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de l'ajout de l'équipe");
    }
};
exports.addTeamToTournament = addTeamToTournament;
const removeTeamFromTournament = async (req, res) => {
    const { id, teamId } = req.params;
    try {
        const tournamentTeam = await database_1.prisma.tournamentTeam.findFirst({
            where: {
                tournamentId: id,
                teamId: teamId,
            },
        });
        if (!tournamentTeam) {
            return (0, apiResponse_1.notFound)(res, "Équipe non trouvée dans ce tournoi");
        }
        await database_1.prisma.tournamentTeam.delete({
            where: {
                id: tournamentTeam.id,
            },
        });
        return (0, apiResponse_1.success)(res, null, "Équipe retirée du tournoi");
    }
    catch (error) {
        console.error("Erreur retrait équipe:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors du retrait de l'équipe");
    }
};
exports.removeTeamFromTournament = removeTeamFromTournament;
const performDraw = async (req, res) => {
    const { id } = req.params;
    try {
        const tournament = await database_1.prisma.tournament.findUnique({
            where: {
                id,
                tenantId: req.user?.tenantId,
            },
            include: {
                teams: {
                    include: {
                        team: true,
                    },
                },
            },
        });
        if (!tournament) {
            return (0, apiResponse_1.notFound)(res, "Tournoi non trouvé");
        }
        if (tournament.drawCompleted) {
            return (0, apiResponse_1.badRequest)(res, "Le tirage au sort a déjà été effectué");
        }
        if (tournament.teams.length === 0) {
            return (0, apiResponse_1.badRequest)(res, "Aucune équipe inscrite au tournoi");
        }
        if (tournament.teams.length < tournament.numberOfGroups) {
            return (0, apiResponse_1.badRequest)(res, "Pas assez d'équipes pour créer les groupes");
        }
        const numberOfGroups = tournament.numberOfGroups;
        const teamsPerGroup = Math.ceil(tournament.teams.length / numberOfGroups);
        const shuffledTeams = [...tournament.teams].sort(() => Math.random() - 0.5);
        for (let i = 0; i < numberOfGroups; i++) {
            const groupName = String.fromCharCode(65 + i);
            const group = await database_1.prisma.group.create({
                data: {
                    name: `Groupe ${groupName}`,
                    tournamentId: id,
                    tenantId: req.user?.tenantId,
                },
            });
            const startIndex = i * teamsPerGroup;
            const endIndex = Math.min(startIndex + teamsPerGroup, shuffledTeams.length);
            const groupTeams = shuffledTeams.slice(startIndex, endIndex);
            for (const tournamentTeam of groupTeams) {
                await database_1.prisma.groupTeam.create({
                    data: {
                        groupId: group.id,
                        teamId: tournamentTeam.teamId,
                    },
                });
                await database_1.prisma.tournamentTeam.update({
                    where: {
                        id: tournamentTeam.id,
                    },
                    data: {
                        groupId: group.id,
                    },
                });
            }
        }
        console.log("Début du tirage équilibré des joueurs...");
        const allPlayers = await database_1.prisma.player.findMany({
            where: {
                OR: [
                    { teamId: { in: tournament.teams.map(t => t.teamId) } },
                    { teamId: null }
                ],
                tenantId: req.user?.tenantId
            },
            orderBy: [
                { level: 'desc' },
                { age: 'desc' }
            ]
        });
        console.log(`Nombre total de joueurs à répartir (tous joueurs du tenant): ${allPlayers.length}`);
        console.log(`Nombre d'équipes: ${tournament.teams.length}`);
        if (allPlayers.length > 0 && tournament.teams.length > 0) {
            const teams = tournament.teams;
            const playersPerTeam = Math.floor(allPlayers.length / teams.length);
            const remainingPlayers = allPlayers.length % teams.length;
            console.log(`Joueurs par équipe: ${playersPerTeam}`);
            console.log(`Joueurs restants: ${remainingPlayers}`);
            let playerIndex = 0;
            for (let round = 0; round < playersPerTeam; round++) {
                if (round % 2 === 0) {
                    for (let teamIndex = 0; teamIndex < teams.length && playerIndex < allPlayers.length; teamIndex++) {
                        await database_1.prisma.player.update({
                            where: { id: allPlayers[playerIndex].id },
                            data: { teamId: teams[teamIndex].teamId }
                        });
                        console.log(`Joueur ${allPlayers[playerIndex].name} (niveau ${allPlayers[playerIndex].level}) → Équipe ${teams[teamIndex].teamId}`);
                        playerIndex++;
                    }
                }
                else {
                    for (let teamIndex = teams.length - 1; teamIndex >= 0 && playerIndex < allPlayers.length; teamIndex--) {
                        await database_1.prisma.player.update({
                            where: { id: allPlayers[playerIndex].id },
                            data: { teamId: teams[teamIndex].teamId }
                        });
                        console.log(`Joueur ${allPlayers[playerIndex].name} (niveau ${allPlayers[playerIndex].level}) → Équipe ${teams[teamIndex].teamId}`);
                        playerIndex++;
                    }
                }
            }
            for (let i = 0; i < remainingPlayers && playerIndex < allPlayers.length; i++) {
                await database_1.prisma.player.update({
                    where: { id: allPlayers[playerIndex].id },
                    data: { teamId: teams[i].teamId }
                });
                console.log(`Joueur restant ${allPlayers[playerIndex].name} → Équipe ${teams[i].teamId}`);
                playerIndex++;
            }
            console.log("Tirage équilibré des joueurs terminé!");
        }
        else {
            console.log("Aucun joueur à répartir ou aucune équipe dans le tournoi");
        }
        const updatedTournament = await database_1.prisma.tournament.update({
            where: { id },
            data: {
                drawCompleted: true,
                status: "active",
            },
            include: {
                teams: {
                    include: {
                        team: {
                            include: {
                                playerRecords: true,
                            },
                        },
                    },
                },
                groups: {
                    include: {
                        groupTeams: {
                            include: {
                                team: {
                                    include: {
                                        playerRecords: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return (0, apiResponse_1.success)(res, updatedTournament, "Tirage au sort effectué avec succès");
    }
    catch (error) {
        console.error("Erreur tirage au sort:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors du tirage au sort");
    }
};
exports.performDraw = performDraw;
//# sourceMappingURL=tournament.controller.js.map