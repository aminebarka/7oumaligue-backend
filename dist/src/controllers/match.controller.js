"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMatch = exports.updateMatchScore = exports.updateMatch = exports.getMatchById = exports.getMatches = exports.createMatch = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const createMatch = async (req, res) => {
    const { date, time, venue, homeTeam, awayTeam, tournamentId, groupId } = req.body;
    try {
        if (homeTeam === awayTeam) {
            return (0, apiResponse_1.badRequest)(res, "Une équipe ne peut pas jouer contre elle-même");
        }
        const homeTeamExists = await database_1.prisma.team.findFirst({
            where: {
                id: homeTeam,
                tenantId: req.user?.tenantId,
            },
        });
        const awayTeamExists = await database_1.prisma.team.findFirst({
            where: {
                id: awayTeam,
                tenantId: req.user?.tenantId,
            },
        });
        if (!homeTeamExists || !awayTeamExists) {
            return (0, apiResponse_1.badRequest)(res, "Une ou plusieurs équipes n'existent pas");
        }
        const tournament = await database_1.prisma.tournament.findFirst({
            where: {
                id: tournamentId,
                tenantId: req.user?.tenantId,
            },
        });
        if (!tournament) {
            return (0, apiResponse_1.notFound)(res, "Tournoi non trouvé");
        }
        if (groupId) {
            const group = await database_1.prisma.group.findFirst({
                where: {
                    id: groupId,
                    tournamentId: tournamentId,
                    tenantId: req.user?.tenantId,
                },
            });
            if (!group) {
                return (0, apiResponse_1.notFound)(res, "Groupe non trouvé");
            }
        }
        const match = await database_1.prisma.match.create({
            data: {
                date,
                time,
                venue,
                homeTeam,
                awayTeam,
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
                awayTeamRef: {
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
        const whereClause = {
            tenantId: req.user?.tenantId,
        };
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
                awayTeamRef: {
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
                awayTeamRef: {
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
        const match = await database_1.prisma.match.update({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
            data: updateData,
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
    const { homeScore, awayScore, status } = req.body;
    try {
        const match = await database_1.prisma.match.findUnique({
            where: {
                id: id,
                tenantId: req.user?.tenantId,
            },
            include: {
                homeTeamRef: true,
                awayTeamRef: true,
                group: true,
            },
        });
        if (!match) {
            return (0, apiResponse_1.notFound)(res, "Match non trouvé");
        }
        const updatedMatch = await database_1.prisma.match.update({
            where: { id: id },
            data: {
                homeScore: Number.parseInt(homeScore),
                awayScore: Number.parseInt(awayScore),
                status: status || "completed",
            },
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
        });
        const homeScoreInt = Number.parseInt(homeScore);
        const awayScoreInt = Number.parseInt(awayScore);
        const homeTeamUpdate = {
            matchesPlayed: { increment: 1 },
            goalsScored: { increment: homeScoreInt },
        };
        const awayTeamUpdate = {
            matchesPlayed: { increment: 1 },
            goalsScored: { increment: awayScoreInt },
        };
        if (homeScoreInt > awayScoreInt) {
            homeTeamUpdate.wins = { increment: 1 };
            awayTeamUpdate.losses = { increment: 1 };
        }
        else if (homeScoreInt < awayScoreInt) {
            homeTeamUpdate.losses = { increment: 1 };
            awayTeamUpdate.wins = { increment: 1 };
        }
        else {
            homeTeamUpdate.draws = { increment: 1 };
            awayTeamUpdate.draws = { increment: 1 };
        }
        await Promise.all([
            database_1.prisma.team.update({
                where: { id: match.homeTeam },
                data: homeTeamUpdate,
            }),
            database_1.prisma.team.update({
                where: { id: match.awayTeam },
                data: awayTeamUpdate,
            }),
        ]);
        if (match.groupId) {
            const homeGroupTeam = await database_1.prisma.groupTeam.findFirst({
                where: {
                    groupId: match.groupId,
                    teamId: match.homeTeam,
                },
            });
            const awayGroupTeam = await database_1.prisma.groupTeam.findFirst({
                where: {
                    groupId: match.groupId,
                    teamId: match.awayTeam,
                },
            });
            if (homeGroupTeam && awayGroupTeam) {
                const homeGroupUpdate = {
                    played: { increment: 1 },
                    goalsFor: { increment: homeScoreInt },
                    goalsAgainst: { increment: awayScoreInt },
                };
                const awayGroupUpdate = {
                    played: { increment: 1 },
                    goalsFor: { increment: awayScoreInt },
                    goalsAgainst: { increment: homeScoreInt },
                };
                if (homeScoreInt > awayScoreInt) {
                    homeGroupUpdate.wins = { increment: 1 };
                    homeGroupUpdate.points = { increment: 3 };
                    awayGroupUpdate.losses = { increment: 1 };
                }
                else if (homeScoreInt < awayScoreInt) {
                    homeGroupUpdate.losses = { increment: 1 };
                    awayGroupUpdate.wins = { increment: 1 };
                    awayGroupUpdate.points = { increment: 3 };
                }
                else {
                    homeGroupUpdate.draws = { increment: 1 };
                    homeGroupUpdate.points = { increment: 1 };
                    awayGroupUpdate.draws = { increment: 1 };
                    awayGroupUpdate.points = { increment: 1 };
                }
                await Promise.all([
                    database_1.prisma.groupTeam.update({
                        where: { id: homeGroupTeam.id },
                        data: homeGroupUpdate,
                    }),
                    database_1.prisma.groupTeam.update({
                        where: { id: awayGroupTeam.id },
                        data: awayGroupUpdate,
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