"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePlayerFromTeam = exports.addPlayerToTeam = exports.deleteTeam = exports.updateTeam = exports.getTeamById = exports.getTeams = exports.createTeam = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const createTeam = async (req, res) => {
    const { name, logo, coachName } = req.body;
    try {
        const team = await database_1.prisma.team.create({
            data: {
                name,
                logo,
                coachName,
                players: [],
                tenantId: req.user?.tenantId,
            },
        });
        console.log("Équipe créée:", { id: team.id, name: team.name, tenantId: team.tenantId });
        return (0, apiResponse_1.created)(res, team, "Équipe créée avec succès");
    }
    catch (error) {
        console.error("Erreur création équipe:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la création de l'équipe");
    }
};
exports.createTeam = createTeam;
const getTeams = async (req, res) => {
    try {
        const teams = await database_1.prisma.team.findMany({
            where: {
                OR: [
                    { tenantId: req.user?.tenantId },
                    { tenantId: null }
                ]
            },
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
        });
        return (0, apiResponse_1.success)(res, teams);
    }
    catch (error) {
        console.error("Erreur récupération équipes:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des équipes");
    }
};
exports.getTeams = getTeams;
const getTeamById = async (req, res) => {
    const { id } = req.params;
    try {
        const team = await database_1.prisma.team.findUnique({
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
        });
        if (!team) {
            return (0, apiResponse_1.notFound)(res, "Équipe non trouvée");
        }
        return (0, apiResponse_1.success)(res, team);
    }
    catch (error) {
        console.error("Erreur récupération équipe:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération de l'équipe");
    }
};
exports.getTeamById = getTeamById;
const updateTeam = async (req, res) => {
    const { id } = req.params;
    const { name, logo, coachName, coachId } = req.body;
    try {
        const updateData = {};
        if (name)
            updateData.name = name;
        if (logo !== undefined)
            updateData.logo = logo;
        if (coachName !== undefined)
            updateData.coachName = coachName;
        if (coachId !== undefined)
            updateData.coachId = coachId;
        const team = await database_1.prisma.team.update({
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
        });
        return (0, apiResponse_1.success)(res, team, "Équipe mise à jour avec succès");
    }
    catch (error) {
        console.error("Erreur mise à jour équipe:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour de l'équipe");
    }
};
exports.updateTeam = updateTeam;
const deleteTeam = async (req, res) => {
    const { id } = req.params;
    try {
        const tournamentTeams = await database_1.prisma.tournamentTeam.findMany({
            where: { teamId: id },
            include: {
                tournament: true,
            },
        });
        const activeTournaments = tournamentTeams.filter((tt) => tt.tournament.status === "active");
        if (activeTournaments.length > 0) {
            return (0, apiResponse_1.badRequest)(res, "Impossible de supprimer une équipe participant à un tournoi actif");
        }
        await database_1.prisma.player.updateMany({
            where: { teamId: id },
            data: { teamId: null },
        });
        await database_1.prisma.team.delete({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
        });
        return (0, apiResponse_1.success)(res, null, "Équipe supprimée avec succès");
    }
    catch (error) {
        console.error("Erreur suppression équipe:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la suppression de l'équipe");
    }
};
exports.deleteTeam = deleteTeam;
const addPlayerToTeam = async (req, res) => {
    const { id } = req.params;
    const { playerId } = req.body;
    try {
        const team = await database_1.prisma.team.findUnique({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
        });
        if (!team) {
            return (0, apiResponse_1.notFound)(res, "Équipe non trouvée");
        }
        const player = await database_1.prisma.player.findFirst({
            where: {
                id: playerId,
                tenantId: req.user?.tenantId,
            },
        });
        if (!player) {
            return (0, apiResponse_1.notFound)(res, "Joueur non trouvé");
        }
        if (player.teamId && player.teamId !== id) {
            return (0, apiResponse_1.badRequest)(res, "Ce joueur appartient déjà à une autre équipe");
        }
        await database_1.prisma.player.update({
            where: { id: playerId },
            data: { teamId: id },
        });
        const updatedPlayers = team.players.includes(playerId) ? team.players : [...team.players, playerId];
        const updatedTeam = await database_1.prisma.team.update({
            where: { id: id },
            data: { players: updatedPlayers },
            include: {
                playerRecords: true,
            },
        });
        return (0, apiResponse_1.success)(res, updatedTeam, "Joueur ajouté à l'équipe");
    }
    catch (error) {
        console.error("Erreur ajout joueur:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de l'ajout du joueur");
    }
};
exports.addPlayerToTeam = addPlayerToTeam;
const removePlayerFromTeam = async (req, res) => {
    const { id, playerId } = req.params;
    try {
        const team = await database_1.prisma.team.findUnique({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
        });
        if (!team) {
            return (0, apiResponse_1.notFound)(res, "Équipe non trouvée");
        }
        await database_1.prisma.player.update({
            where: { id: playerId },
            data: { teamId: null },
        });
        const updatedPlayers = team.players.filter((pid) => pid !== playerId);
        const updatedTeam = await database_1.prisma.team.update({
            where: { id: id },
            data: { players: updatedPlayers },
            include: {
                playerRecords: true,
            },
        });
        return (0, apiResponse_1.success)(res, updatedTeam, "Joueur retiré de l'équipe");
    }
    catch (error) {
        console.error("Erreur retrait joueur:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors du retrait du joueur");
    }
};
exports.removePlayerFromTeam = removePlayerFromTeam;
//# sourceMappingURL=team.controller.js.map