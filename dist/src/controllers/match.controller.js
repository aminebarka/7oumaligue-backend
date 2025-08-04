"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMatch = exports.updateMatchScore = exports.updateMatch = exports.getMatchById = exports.getMatches = exports.createMatch = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const createMatch = async (req, res) => {
    try {
        const { date, time, venue, homeTeam, tournamentId, groupId } = req.body;
        if (!date || !time || !venue || !homeTeam || !tournamentId) {
            return (0, apiResponse_1.badRequest)(res, "Tous les champs sont requis");
        }
        const matchDate = new Date(date + 'T' + time + ':00');
        if (isNaN(matchDate.getTime())) {
            return (0, apiResponse_1.badRequest)(res, "Format de date invalide");
        }
        const tournament = await database_1.prisma.tournament.findUnique({
            where: {
                id: tournamentId,
            },
        });
        if (!tournament) {
            return (0, apiResponse_1.notFound)(res, "Tournoi non trouvé");
        }
        const homeTeamExists = await database_1.prisma.team.findFirst({
            where: {
                OR: [
                    { name: homeTeam },
                    { id: homeTeam }
                ]
            },
        });
        if (!homeTeamExists) {
            return (0, apiResponse_1.notFound)(res, "L'équipe n'existe pas");
        }
        if (groupId) {
            const group = await database_1.prisma.group.findUnique({
                where: {
                    id: groupId,
                    tournamentId: tournamentId,
                },
            });
            if (!group) {
                return (0, apiResponse_1.notFound)(res, "Groupe non trouvé");
            }
        }
        const match = await database_1.prisma.match.create({
            data: {
                date: matchDate,
                time,
                venue,
                homeTeamId: homeTeamExists.id,
                homeTeam: homeTeamExists.name,
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
        });
        return (0, apiResponse_1.created)(res, match, "Match créé avec succès");
    }
    catch (error) {
        console.error("Erreur création match:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la création du match");
    }
};
exports.createMatch = createMatch;
const getMatches = async (req, res) => {
    try {
        const { tournamentId, groupId, status, date } = req.query;
        const whereClause = {};
        if (tournamentId) {
            whereClause.tournamentId = tournamentId;
        }
        if (groupId) {
            whereClause.groupId = groupId;
        }
        if (status) {
            whereClause.status = status;
        }
        if (date) {
            whereClause.date = date;
        }
        const matches = await database_1.prisma.match.findMany({
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
        });
        return (0, apiResponse_1.success)(res, matches);
    }
    catch (error) {
        console.error("Erreur récupération matchs:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des matchs");
    }
};
exports.getMatches = getMatches;
const getMatchById = async (req, res) => {
    const { id } = req.params;
    try {
        const match = await database_1.prisma.match.findUnique({
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
        });
        if (!match) {
            return (0, apiResponse_1.notFound)(res, "Match non trouvé");
        }
        return (0, apiResponse_1.success)(res, match);
    }
    catch (error) {
        console.error("Erreur récupération match:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération du match");
    }
};
exports.getMatchById = getMatchById;
const updateMatch = async (req, res) => {
    const { id } = req.params;
    const { date, time, venue, status } = req.body;
    try {
        const updateData = {};
        if (date)
            updateData.date = date;
        if (time)
            updateData.time = time;
        if (venue)
            updateData.venue = venue;
        if (status)
            updateData.status = status;
        const whereClause = req.user?.role === 'admin'
            ? { id: id }
            : { id: id, tenantId: req.user?.tenantId };
        const match = await database_1.prisma.match.update({
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
        });
        return (0, apiResponse_1.success)(res, match, "Match mis à jour avec succès");
    }
    catch (error) {
        console.error("Erreur mise à jour match:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour du match");
    }
};
exports.updateMatch = updateMatch;
const updateMatchScore = async (req, res) => {
    const { id } = req.params;
    const { homeScore } = req.body;
    try {
        const match = await database_1.prisma.match.findUnique({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
        });
        if (!match) {
            return (0, apiResponse_1.notFound)(res, "Match non trouvé");
        }
        if (match.status === "completed") {
            return (0, apiResponse_1.badRequest)(res, "Le match est déjà terminé");
        }
        const homeScoreInt = parseInt(homeScore);
        if (isNaN(homeScoreInt)) {
            return (0, apiResponse_1.badRequest)(res, "Score invalide");
        }
        const updatedMatch = await database_1.prisma.match.update({
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
        });
        const homeTeamUpdate = {
            matchesPlayed: { increment: 1 },
            goalsScored: { increment: homeScoreInt },
            wins: { increment: 1 },
        };
        if (match.homeTeam) {
            await Promise.all([
                database_1.prisma.team.update({
                    where: { id: match.homeTeam },
                    data: homeTeamUpdate,
                }),
            ]);
        }
        if (match.groupId && match.homeTeam) {
            const homeGroupTeam = await database_1.prisma.groupTeam.findFirst({
                where: {
                    groupId: match.groupId,
                    teamId: match.homeTeam,
                },
            });
            if (homeGroupTeam) {
                const homeGroupUpdate = {
                    played: { increment: 1 },
                    goalsFor: { increment: homeScoreInt },
                    wins: { increment: 1 },
                    points: { increment: 3 },
                };
                await Promise.all([
                    database_1.prisma.groupTeam.update({
                        where: { id: homeGroupTeam.id },
                        data: homeGroupUpdate,
                    }),
                ]);
            }
        }
        return (0, apiResponse_1.success)(res, updatedMatch, "Score du match mis à jour avec succès");
    }
    catch (error) {
        console.error("Erreur mise à jour score:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour du score");
    }
};
exports.updateMatchScore = updateMatchScore;
const deleteMatch = async (req, res) => {
    const { id } = req.params;
    try {
        const match = await database_1.prisma.match.findUnique({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
        });
        if (!match) {
            return (0, apiResponse_1.notFound)(res, "Match non trouvé");
        }
        if (match.status === "completed") {
            return (0, apiResponse_1.badRequest)(res, "Impossible de supprimer un match terminé");
        }
        await database_1.prisma.match.delete({
            where: { id: id },
        });
        return (0, apiResponse_1.success)(res, null, "Match supprimé avec succès");
    }
    catch (error) {
        console.error("Erreur suppression match:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la suppression du match");
    }
};
exports.deleteMatch = deleteMatch;
//# sourceMappingURL=match.controller.js.map