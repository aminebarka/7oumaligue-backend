"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePlayerFromTeam = exports.addPlayerToTeam = exports.deleteTeam = exports.updateTeam = exports.getTeamById = exports.getTeams = exports.createTeam = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const createTeam = async (req, res) => {
    const { name, logo, coachName } = req.body;
    try {
        console.log("=== DÉBUT CRÉATION ÉQUIPE ===");
        console.log("Headers:", req.headers);
        console.log("User:", req.user);
        console.log("Body:", req.body);
        if (!req.user) {
            console.error("❌ Utilisateur non authentifié lors de la création d'équipe");
            return (0, apiResponse_1.badRequest)(res, "Authentification requise");
        }
        if (!name || name.trim().length === 0) {
            console.error("❌ Nom d'équipe manquant ou vide");
            return (0, apiResponse_1.badRequest)(res, "Le nom de l'équipe est requis");
        }
        if (!req.user.tenantId) {
            console.error("❌ TenantId manquant pour l'utilisateur:", req.user);
            return (0, apiResponse_1.badRequest)(res, "Problème d'authentification: tenant manquant");
        }
        console.log("✅ Données validées, tentative de création d'équipe:", {
            name,
            logo,
            coachName,
            tenantId: req.user.tenantId,
            userId: req.user.userId
        });
        const team = await database_1.prisma.team.create({
            data: {
                name: name.trim(),
                logo: logo || null,
                coachName: coachName || null,
                players: [],
                tenantId: req.user.tenantId,
            },
        });
        console.log("✅ Équipe créée avec succès:", {
            id: team.id,
            name: team.name,
            tenantId: team.tenantId
        });
        return (0, apiResponse_1.created)(res, "Équipe créée avec succès", team);
    }
    catch (error) {
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
        });
        if (error?.name === 'PrismaClientKnownRequestError') {
            console.error("❌ Erreur Prisma connue:", error?.code);
            return (0, apiResponse_1.badRequest)(res, `Erreur de base de données: ${error?.code}`);
        }
        if (error?.name === 'PrismaClientValidationError') {
            console.error("❌ Erreur de validation Prisma");
            return (0, apiResponse_1.badRequest)(res, "Données invalides pour la création de l'équipe");
        }
        if (error?.name === 'PrismaClientInitializationError') {
            console.error("❌ Erreur d'initialisation Prisma");
            return (0, apiResponse_1.badRequest)(res, "Erreur de connexion à la base de données");
        }
        console.error("❌ Erreur non gérée, retour d'erreur générique");
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la création de l'équipe");
    }
    finally {
        console.log("=== FIN CRÉATION ÉQUIPE ===");
    }
};
exports.createTeam = createTeam;
const getTeams = async (req, res) => {
    try {
        const teams = await database_1.prisma.team.findMany({
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
        return (0, apiResponse_1.success)(res, "Équipes récupérées avec succès", teams);
    }
    catch (error) {
        console.error("Erreur récupération équipes:", error?.message || error);
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
        return (0, apiResponse_1.success)(res, "Équipe récupérée avec succès", team);
    }
    catch (error) {
        console.error("Erreur récupération équipe:", error?.message || error);
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
        return (0, apiResponse_1.success)(res, "Équipe mise à jour avec succès", team);
    }
    catch (error) {
        console.error("Erreur mise à jour équipe:", error?.message || error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour de l'équipe");
    }
};
exports.updateTeam = updateTeam;
const deleteTeam = async (req, res) => {
    const { id } = req.params;
    const { force } = req.query;
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
        if (!req.user) {
            console.log("❌ Utilisateur non authentifié");
            return (0, apiResponse_1.unauthorized)(res, "Utilisateur non authentifié");
        }
        const existingTeam = await database_1.prisma.team.findUnique({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
        });
        if (!existingTeam) {
            console.log("❌ Équipe non trouvée:", { teamId: id, tenantId: req.user?.tenantId });
            return (0, apiResponse_1.notFound)(res, "Équipe non trouvée");
        }
        console.log("✅ Équipe trouvée:", existingTeam);
        const tournamentTeams = await database_1.prisma.tournamentTeam.findMany({
            where: { teamId: id },
            include: {
                tournament: true,
            },
        });
        console.log("📊 Équipe dans des tournois:", tournamentTeams.length);
        const activeTournaments = tournamentTeams.filter((tt) => tt.tournament.status === "active");
        if (activeTournaments.length > 0 && !force) {
            console.log("❌ Équipe dans un tournoi actif:", activeTournaments);
            return (0, apiResponse_1.badRequest)(res, "Impossible de supprimer une équipe participant à un tournoi actif. Utilisez le paramètre force=true pour forcer la suppression.");
        }
        if (force && activeTournaments.length > 0) {
            console.log("⚠️  Suppression forcée - Retrait des liens avec les tournois");
            await database_1.prisma.tournamentTeam.deleteMany({
                where: { teamId: id }
            });
            console.log("✅ Liens avec les tournois supprimés");
        }
        const updatedPlayers = await database_1.prisma.player.updateMany({
            where: { teamId: id },
            data: { teamId: null },
        });
        console.log("👥 Joueurs mis à jour:", updatedPlayers.count);
        const deletedTeam = await database_1.prisma.team.delete({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
        });
        console.log("✅ Équipe supprimée avec succès:", deletedTeam);
        const message = force
            ? "Équipe supprimée avec succès (suppression forcée)"
            : "Équipe supprimée avec succès";
        return (0, apiResponse_1.success)(res, message, null);
    }
    catch (error) {
        console.error("❌ Erreur suppression équipe:", {
            error: error?.message || error,
            stack: error?.stack,
            teamId: id,
            userId: req.user?.userId,
            tenantId: req.user?.tenantId
        });
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
        const player = await database_1.prisma.player.findUnique({
            where: { id: playerId },
        });
        if (!player) {
            return (0, apiResponse_1.notFound)(res, "Joueur non trouvé");
        }
        if (player.teamId && player.teamId !== id) {
            return (0, apiResponse_1.badRequest)(res, "Le joueur est déjà dans une autre équipe");
        }
        await database_1.prisma.player.update({
            where: { id: playerId },
            data: { teamId: id },
        });
        return (0, apiResponse_1.success)(res, "Joueur ajouté à l'équipe avec succès", null);
    }
    catch (error) {
        console.error("Erreur ajout joueur à équipe:", error?.message || error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de l'ajout du joueur à l'équipe");
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
        const player = await database_1.prisma.player.findUnique({
            where: { id: playerId },
        });
        if (!player) {
            return (0, apiResponse_1.notFound)(res, "Joueur non trouvé");
        }
        if (player.teamId !== id) {
            return (0, apiResponse_1.badRequest)(res, "Le joueur n'est pas dans cette équipe");
        }
        await database_1.prisma.player.update({
            where: { id: playerId },
            data: { teamId: null },
        });
        return (0, apiResponse_1.success)(res, "Joueur retiré de l'équipe avec succès", null);
    }
    catch (error) {
        console.error("Erreur retrait joueur de équipe:", error?.message || error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors du retrait du joueur de l'équipe");
    }
};
exports.removePlayerFromTeam = removePlayerFromTeam;
//# sourceMappingURL=team.controller.js.map