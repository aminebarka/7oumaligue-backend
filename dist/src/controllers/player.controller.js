"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayersByTeam = exports.deletePlayer = exports.updatePlayer = exports.getPlayerById = exports.getPlayers = exports.createPlayer = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const createPlayer = async (req, res) => {
    const { name, position, level, age, teamId, jerseyNumber } = req.body;
    try {
        const validPositions = ["Gardien", "Défenseur", "Milieu", "Attaquant"];
        if (!validPositions.includes(position)) {
            return (0, apiResponse_1.badRequest)(res, "Position invalide");
        }
        const playerLevel = Number.parseInt(level);
        if (playerLevel < 1 || playerLevel > 5) {
            return (0, apiResponse_1.badRequest)(res, "Le niveau doit être entre 1 et 5");
        }
        const playerAge = Number.parseInt(age);
        if (playerAge < 16 || playerAge > 50) {
            return (0, apiResponse_1.badRequest)(res, "L'âge doit être entre 16 et 50 ans");
        }
        if (teamId && jerseyNumber) {
            const existingPlayer = await database_1.prisma.player.findFirst({
                where: {
                    teamId,
                    jerseyNumber: Number.parseInt(jerseyNumber),
                    tenantId: req.user?.tenantId,
                },
            });
            if (existingPlayer) {
                return (0, apiResponse_1.badRequest)(res, "Ce numéro de maillot est déjà utilisé dans cette équipe");
            }
        }
        if (teamId) {
            const team = await database_1.prisma.team.findFirst({
                where: {
                    id: teamId,
                    tenantId: req.user?.tenantId,
                },
            });
            if (!team) {
                return (0, apiResponse_1.notFound)(res, "Équipe non trouvée");
            }
        }
        const player = await database_1.prisma.player.create({
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
        });
        if (teamId) {
            const team = await database_1.prisma.team.findUnique({
                where: { id: teamId },
            });
            if (team) {
                const updatedPlayers = team.players.includes(player.id) ? team.players : [...team.players, player.id];
                await database_1.prisma.team.update({
                    where: { id: teamId },
                    data: { players: updatedPlayers },
                });
            }
        }
        return (0, apiResponse_1.created)(res, "Joueur créé avec succès", player);
    }
    catch (error) {
        console.error("Erreur création joueur:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la création du joueur");
    }
};
exports.createPlayer = createPlayer;
const getPlayers = async (req, res) => {
    try {
        const { teamId, position, available } = req.query;
        const whereClause = {};
        if (teamId) {
            whereClause.teamId = teamId;
        }
        if (position) {
            whereClause.position = position;
        }
        if (available === "true") {
            whereClause.teamId = null;
        }
        const players = await database_1.prisma.player.findMany({
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
        });
        return (0, apiResponse_1.success)(res, "Joueurs récupérés avec succès", players);
    }
    catch (error) {
        console.error("Erreur récupération joueurs:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des joueurs");
    }
};
exports.getPlayers = getPlayers;
const getPlayerById = async (req, res) => {
    const { id } = req.params;
    try {
        const player = await database_1.prisma.player.findUnique({
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
        });
        if (!player) {
            return (0, apiResponse_1.notFound)(res, "Joueur non trouvé");
        }
        return (0, apiResponse_1.success)(res, "Joueur récupéré avec succès", player);
    }
    catch (error) {
        console.error("Erreur récupération joueur:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération du joueur");
    }
};
exports.getPlayerById = getPlayerById;
const updatePlayer = async (req, res) => {
    const { id } = req.params;
    const { name, position, level, age, teamId, jerseyNumber } = req.body;
    try {
        const currentPlayer = await database_1.prisma.player.findUnique({
            where: {
                id,
                tenantId: req.user?.tenantId,
            },
        });
        if (!currentPlayer) {
            return (0, apiResponse_1.notFound)(res, "Joueur non trouvé");
        }
        if (position) {
            const validPositions = ["Gardien", "Défenseur", "Milieu", "Attaquant"];
            if (!validPositions.includes(position)) {
                return (0, apiResponse_1.badRequest)(res, "Position invalide");
            }
        }
        if (level && (Number.parseInt(level) < 1 || Number.parseInt(level) > 5)) {
            return (0, apiResponse_1.badRequest)(res, "Le niveau doit être entre 1 et 5");
        }
        if (age && (Number.parseInt(age) < 16 || Number.parseInt(age) > 50)) {
            return (0, apiResponse_1.badRequest)(res, "L'âge doit être entre 16 et 50 ans");
        }
        if (teamId && jerseyNumber) {
            const existingPlayer = await database_1.prisma.player.findFirst({
                where: {
                    teamId,
                    jerseyNumber: Number.parseInt(jerseyNumber),
                    tenantId: req.user?.tenantId,
                    NOT: { id },
                },
            });
            if (existingPlayer) {
                return (0, apiResponse_1.badRequest)(res, "Ce numéro de maillot est déjà utilisé dans cette équipe");
            }
        }
        if (teamId && teamId !== currentPlayer.teamId) {
            const team = await database_1.prisma.team.findFirst({
                where: {
                    id: teamId,
                    tenantId: req.user?.tenantId,
                },
            });
            if (!team) {
                return (0, apiResponse_1.notFound)(res, "Équipe non trouvée");
            }
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (position)
            updateData.position = position;
        if (level)
            updateData.level = Number.parseInt(level);
        if (age)
            updateData.age = Number.parseInt(age);
        if (teamId !== undefined)
            updateData.teamId = teamId || null;
        if (jerseyNumber !== undefined)
            updateData.jerseyNumber = jerseyNumber ? Number.parseInt(jerseyNumber) : null;
        const player = await database_1.prisma.player.update({
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
        });
        if (teamId !== undefined && teamId !== currentPlayer.teamId) {
            if (currentPlayer.teamId) {
                const oldTeam = await database_1.prisma.team.findUnique({
                    where: { id: currentPlayer.teamId },
                });
                if (oldTeam) {
                    const updatedPlayers = oldTeam.players.filter((pid) => pid !== id);
                    await database_1.prisma.team.update({
                        where: { id: currentPlayer.teamId },
                        data: { players: updatedPlayers },
                    });
                }
            }
            if (teamId) {
                const newTeam = await database_1.prisma.team.findUnique({
                    where: { id: teamId },
                });
                if (newTeam) {
                    const updatedPlayers = newTeam.players.includes(id) ? newTeam.players : [...newTeam.players, id];
                    await database_1.prisma.team.update({
                        where: { id: teamId },
                        data: { players: updatedPlayers },
                    });
                }
            }
        }
        return (0, apiResponse_1.success)(res, "Joueur mis à jour", player);
    }
    catch (error) {
        console.error("Erreur mise à jour joueur:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour du joueur");
    }
};
exports.updatePlayer = updatePlayer;
const deletePlayer = async (req, res) => {
    const { id } = req.params;
    try {
        const player = await database_1.prisma.player.findUnique({
            where: {
                id,
                tenantId: req.user?.tenantId,
            },
        });
        if (!player) {
            return (0, apiResponse_1.notFound)(res, "Joueur non trouvé");
        }
        if (player.teamId) {
            const team = await database_1.prisma.team.findUnique({
                where: { id: player.teamId },
            });
            if (team) {
                const updatedPlayers = team.players.filter((pid) => pid !== id);
                await database_1.prisma.team.update({
                    where: { id: player.teamId },
                    data: { players: updatedPlayers },
                });
            }
        }
        await database_1.prisma.player.delete({
            where: { id: id },
        });
        return (0, apiResponse_1.success)(res, "Joueur supprimé", null);
    }
    catch (error) {
        console.error("Erreur suppression joueur:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la suppression du joueur");
    }
};
exports.deletePlayer = deletePlayer;
const getPlayersByTeam = async (req, res) => {
    const { teamId } = req.params;
    try {
        const players = await database_1.prisma.player.findMany({
            where: {
                teamId: teamId,
                tenantId: req.user?.tenantId,
            },
            orderBy: [{ jerseyNumber: "asc" }, { name: "asc" }],
        });
        return (0, apiResponse_1.success)(res, "Joueurs par équipe récupérés avec succès", players);
    }
    catch (error) {
        console.error("Erreur récupération joueurs par équipe:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des joueurs");
    }
};
exports.getPlayersByTeam = getPlayersByTeam;
//# sourceMappingURL=player.controller.js.map