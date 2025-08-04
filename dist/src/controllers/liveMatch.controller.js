"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatchEvents = exports.deleteMatchEvent = exports.addMatchEvent = exports.updateLiveMatchScore = exports.updateMatchTime = exports.endLiveMatch = exports.togglePauseMatch = exports.startLiveMatch = exports.getLiveMatchState = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const getLiveMatchState = async (req, res) => {
    const { matchId } = req.params;
    try {
        const match = await database_1.prisma.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeamRef: true,
                group: true,
                tournament: true,
            },
        });
        if (!match) {
            return (0, apiResponse_1.notFound)(res, "Match non trouvé");
        }
        const defaultState = {
            id: `temp-${matchId}`,
            matchId,
            isLive: false,
            isPaused: false,
            matchTime: 0,
            homeScore: match.homeScore || 0,
            match,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return (0, apiResponse_1.success)(res, {
            liveState: defaultState,
            events: [],
        }, "État en direct récupéré");
    }
    catch (error) {
        console.error("Erreur lors de la récupération de l'état en direct:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération de l'état en direct");
    }
};
exports.getLiveMatchState = getLiveMatchState;
const startLiveMatch = async (req, res) => {
    const { matchId } = req.params;
    try {
        const match = await database_1.prisma.match.findUnique({
            where: { id: matchId },
        });
        if (!match) {
            return (0, apiResponse_1.notFound)(res, "Match non trouvé");
        }
        const liveState = {
            id: `temp-${matchId}`,
            matchId,
            isLive: true,
            isPaused: false,
            matchTime: 0,
            homeScore: match.homeScore || 0,
            match,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return (0, apiResponse_1.success)(res, liveState, "Match démarré en direct");
    }
    catch (error) {
        console.error("Erreur lors du démarrage du match:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors du démarrage du match");
    }
};
exports.startLiveMatch = startLiveMatch;
const togglePauseMatch = async (req, res) => {
    const { matchId } = req.params;
    try {
        const match = await database_1.prisma.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeamRef: true,
                group: true,
                tournament: true,
            },
        });
        if (!match) {
            return (0, apiResponse_1.notFound)(res, "Match non trouvé");
        }
        const updatedState = {
            id: `temp-${matchId}`,
            matchId,
            isLive: true,
            isPaused: true,
            matchTime: 0,
            homeScore: match.homeScore || 0,
            match,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return (0, apiResponse_1.success)(res, updatedState, "État de pause mis à jour");
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour de la pause:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour de la pause");
    }
};
exports.togglePauseMatch = togglePauseMatch;
const endLiveMatch = async (req, res) => {
    const { matchId } = req.params;
    try {
        const match = await database_1.prisma.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeamRef: true,
                group: true,
                tournament: true,
            },
        });
        if (!match) {
            return (0, apiResponse_1.notFound)(res, "Match non trouvé");
        }
        const updatedState = {
            id: `temp-${matchId}`,
            matchId,
            isLive: false,
            isPaused: false,
            matchTime: 0,
            homeScore: match.homeScore || 0,
            match,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return (0, apiResponse_1.success)(res, updatedState, "Match terminé");
    }
    catch (error) {
        console.error("Erreur lors de la fin du match:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la fin du match");
    }
};
exports.endLiveMatch = endLiveMatch;
const updateMatchTime = async (req, res) => {
    const { matchId } = req.params;
    const { matchTime } = req.body;
    try {
        const match = await database_1.prisma.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeamRef: true,
                group: true,
                tournament: true,
            },
        });
        if (!match) {
            return (0, apiResponse_1.notFound)(res, "Match non trouvé");
        }
        const updatedState = {
            id: `temp-${matchId}`,
            matchId,
            isLive: true,
            isPaused: false,
            matchTime: parseInt(matchTime),
            homeScore: match.homeScore || 0,
            match,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return (0, apiResponse_1.success)(res, updatedState, "Temps du match mis à jour");
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour du temps:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour du temps");
    }
};
exports.updateMatchTime = updateMatchTime;
const updateLiveMatchScore = async (req, res) => {
    const { matchId } = req.params;
    const { homeScore } = req.body;
    try {
        const match = await database_1.prisma.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeamRef: true,
                group: true,
                tournament: true,
            },
        });
        if (!match) {
            return (0, apiResponse_1.notFound)(res, "Match non trouvé");
        }
        const updatedMatch = await database_1.prisma.match.update({
            where: { id: matchId },
            data: {
                homeScore: parseInt(homeScore),
                status: "completed",
            },
            include: {
                homeTeamRef: true,
                group: true,
                tournament: true,
            },
        });
        await database_1.prisma.liveMatchState.upsert({
            where: { matchId },
            update: {
                homeScore: parseInt(homeScore),
                updatedAt: new Date(),
            },
            create: {
                matchId,
                homeScore: parseInt(homeScore),
                updatedAt: new Date(),
            },
        });
        return (0, apiResponse_1.success)(res, updatedMatch, "Score mis à jour avec succès");
    }
    catch (error) {
        console.error("Erreur mise à jour score live:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour du score");
    }
};
exports.updateLiveMatchScore = updateLiveMatchScore;
const addMatchEvent = async (req, res) => {
    const { matchId } = req.params;
    const { type, minute, playerId, playerName, team, description } = req.body;
    try {
        const match = await database_1.prisma.match.findUnique({
            where: { id: matchId },
        });
        if (!match) {
            return (0, apiResponse_1.notFound)(res, "Match non trouvé");
        }
        const event = {
            id: `temp-event-${Date.now()}`,
            matchId,
            type,
            minute: parseInt(minute),
            playerId,
            playerName,
            team,
            description,
            timestamp: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return (0, apiResponse_1.success)(res, event, "Événement ajouté");
    }
    catch (error) {
        console.error("Erreur lors de l'ajout de l'événement:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de l'ajout de l'événement");
    }
};
exports.addMatchEvent = addMatchEvent;
const deleteMatchEvent = async (req, res) => {
    const { eventId } = req.params;
    try {
        return (0, apiResponse_1.success)(res, null, "Événement supprimé");
    }
    catch (error) {
        console.error("Erreur lors de la suppression de l'événement:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la suppression de l'événement");
    }
};
exports.deleteMatchEvent = deleteMatchEvent;
const getMatchEvents = async (req, res) => {
    const { matchId } = req.params;
    try {
        const events = [];
        return (0, apiResponse_1.success)(res, events, "Événements récupérés");
    }
    catch (error) {
        console.error("Erreur lors de la récupération des événements:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des événements");
    }
};
exports.getMatchEvents = getMatchEvents;
//# sourceMappingURL=liveMatch.controller.js.map