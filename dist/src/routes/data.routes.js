"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const auth_middleware_1 = require("../middleware/auth.middleware");
const apiResponse_1 = require("../utils/apiResponse");
const router = express_1.default.Router();
router.get("/all", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        console.log("📊 Récupération de toutes les données pour l'utilisateur:", req.user?.email);
        const [tournaments, teams, players, matches] = await Promise.all([
            database_1.prisma.tournament.findMany({
                include: {
                    groups: true,
                    matches: true,
                },
            }),
            database_1.prisma.team.findMany({
                include: {
                    playerRecords: true,
                },
            }),
            database_1.prisma.player.findMany({
                include: {
                    team: true,
                },
            }),
            database_1.prisma.match.findMany({
                include: {
                    homeTeamRef: true,
                    group: true,
                    tournament: true,
                },
            }),
        ]);
        const data = {
            tournaments: tournaments.length,
            teams: teams.length,
            players: players.length,
            matches: matches.length,
            details: {
                tournaments,
                teams,
                players,
                matches,
            },
        };
        console.log(`✅ Données récupérées: ${data.tournaments} tournois, ${data.teams} équipes, ${data.players} joueurs, ${data.matches} matchs`);
        return (0, apiResponse_1.success)(res, "Données récupérées avec succès", data);
    }
    catch (error) {
        console.error("❌ Erreur lors de la récupération des données:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des données",
            error: error instanceof Error ? error.message : "Erreur inconnue",
        });
    }
});
exports.default = router;
//# sourceMappingURL=data.routes.js.map