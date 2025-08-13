"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const apiResponse_1 = require("../utils/apiResponse");
const cardGenerator_1 = require("../utils/cardGenerator");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/players/:id/card', async (req, res) => {
    try {
        const { id } = req.params;
        const { format = 'html' } = req.query;
        const player = await prisma.player.findUnique({
            where: { id: String(id) },
            include: {
                team: true,
                playerStats: {
                    include: {
                        tournament: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                playerBadges: {
                    include: {
                        tournament: true
                    },
                    orderBy: {
                        earnedAt: 'desc'
                    }
                }
            }
        });
        if (!player) {
            return (0, apiResponse_1.notFound)(res, 'Joueur non trouvé');
        }
        const totalStats = player.playerStats.reduce((acc, stat) => ({
            goals: acc.goals + stat.goals,
            assists: acc.assists + stat.assists,
            matches: acc.matches + stat.matchesPlayed,
            rating: acc.rating + stat.rating
        }), { goals: 0, assists: 0, matches: 0, rating: 0 });
        const averageRating = totalStats.matches > 0 ? totalStats.rating / totalStats.matches : 0;
        const reputationLevel = calculateReputationLevel(totalStats, player.playerBadges.length);
        if (format === 'image') {
            const cardImage = await (0, cardGenerator_1.generatePlayerCard)({
                player,
                stats: totalStats,
                averageRating,
                reputationLevel,
                badges: player.playerBadges
            });
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.send(cardImage);
        }
        return (0, apiResponse_1.success)(res, "Carte du joueur récupérée avec succès", {
            player: {
                id: player.id,
                name: player.name,
                position: player.position,
                level: player.level,
                age: player.age,
                jerseyNumber: player.jerseyNumber,
                team: player.team
            },
            stats: totalStats,
            averageRating: Math.round(averageRating * 10) / 10,
            reputationLevel,
            badges: player.playerBadges,
            achievements: await getPlayerAchievements(parseInt(player.id))
        });
    }
    catch (error) {
        console.error('Erreur lors de la génération de la carte:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la génération de la carte');
    }
});
router.get('/players/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const player = await prisma.player.findFirst({
            where: {
                OR: [
                    { id: String(slug) },
                    { name: { contains: slug, mode: 'insensitive' } }
                ]
            },
            include: {
                team: true,
                playerStats: {
                    include: {
                        tournament: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                playerBadges: {
                    include: {
                        tournament: true
                    },
                    orderBy: {
                        earnedAt: 'desc'
                    }
                }
            }
        });
        if (!player) {
            return (0, apiResponse_1.notFound)(res, 'Joueur non trouvé');
        }
        const totalStats = player.playerStats.reduce((acc, stat) => ({
            goals: acc.goals + stat.goals,
            assists: acc.assists + stat.assists,
            matches: acc.matches + stat.matchesPlayed,
            rating: acc.rating + stat.rating
        }), { goals: 0, assists: 0, matches: 0, rating: 0 });
        const averageRating = totalStats.matches > 0 ? totalStats.rating / totalStats.matches : 0;
        const reputationLevel = calculateReputationLevel(totalStats, player.playerBadges.length);
        const publicProfileHTML = generatePublicProfileHTML(player, totalStats, averageRating, reputationLevel);
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=1800');
        return res.send(publicProfileHTML);
    }
    catch (error) {
        console.error('Erreur lors de la génération du profil public:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la génération du profil public');
    }
});
router.get('/players/:id/achievements', async (req, res) => {
    try {
        const { id } = req.params;
        const achievements = await getPlayerAchievements(parseInt(id));
        return (0, apiResponse_1.success)(res, "Réalisations du joueur récupérées avec succès", achievements);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des réalisations:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des réalisations');
    }
});
router.get('/players/:id/reputation', async (req, res) => {
    try {
        const { id } = req.params;
        const player = await prisma.player.findUnique({
            where: { id: String(id) },
            include: {
                playerStats: true,
                playerBadges: true
            }
        });
        if (!player) {
            return (0, apiResponse_1.notFound)(res, 'Joueur non trouvé');
        }
        const totalStats = player.playerStats.reduce((acc, stat) => ({
            goals: acc.goals + stat.goals,
            assists: acc.assists + stat.assists,
            matches: acc.matches + stat.matchesPlayed,
            rating: acc.rating + stat.rating
        }), { goals: 0, assists: 0, matches: 0, rating: 0 });
        const reputationLevel = calculateReputationLevel(totalStats, player.playerBadges.length);
        const reputationPoints = calculateReputationPoints(totalStats, player.playerBadges);
        return (0, apiResponse_1.success)(res, "Réputation du joueur récupérée avec succès", {
            level: reputationLevel,
            points: reputationPoints,
            stats: totalStats,
            badges: player.playerBadges,
            nextLevel: getNextLevelInfo(reputationLevel, reputationPoints)
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de la réputation:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération de la réputation');
    }
});
router.patch('/players/:id/reputation', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { points, reason } = req.body;
        const player = await prisma.player.findUnique({
            where: { id: String(id) }
        });
        if (!player) {
            return (0, apiResponse_1.notFound)(res, 'Joueur non trouvé');
        }
        await prisma.reputationLog.create({
            data: {
                playerId: String(id),
                points: points,
                reason: reason,
                modifiedBy: req.user?.userId || 0
            }
        });
        return (0, apiResponse_1.success)(res, 'Réputation mise à jour', { message: 'Réputation mise à jour' });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de la réputation:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la mise à jour de la réputation');
    }
});
function calculateReputationLevel(stats, badgeCount) {
    const totalPoints = stats.goals * 10 + stats.assists * 5 + stats.matches * 2 + badgeCount * 20;
    if (totalPoints >= 1000)
        return 'Légende';
    if (totalPoints >= 500)
        return 'Expert';
    if (totalPoints >= 200)
        return 'Professionnel';
    if (totalPoints >= 100)
        return 'Avancé';
    if (totalPoints >= 50)
        return 'Intermédiaire';
    return 'Débutant';
}
function calculateReputationPoints(stats, badges) {
    return stats.goals * 10 + stats.assists * 5 + stats.matches * 2 + badges.length * 20;
}
function getNextLevelInfo(currentLevel, currentPoints) {
    const levels = {
        'Débutant': { min: 0, max: 49 },
        'Intermédiaire': { min: 50, max: 99 },
        'Avancé': { min: 100, max: 199 },
        'Professionnel': { min: 200, max: 499 },
        'Expert': { min: 500, max: 999 },
        'Légende': { min: 1000, max: Infinity }
    };
    const levelKeys = Object.keys(levels);
    const currentIndex = levelKeys.indexOf(currentLevel);
    if (currentIndex === levelKeys.length - 1) {
        return { level: 'Max', pointsNeeded: 0, progress: 100 };
    }
    const nextLevel = levelKeys[currentIndex + 1];
    const nextLevelMin = levels[nextLevel].min;
    const pointsNeeded = nextLevelMin - currentPoints;
    const progress = Math.min(100, (currentPoints / nextLevelMin) * 100);
    return { level: nextLevel, pointsNeeded, progress };
}
async function getPlayerAchievements(playerId) {
    const stats = await prisma.playerStats.findMany({
        where: { playerId: String(playerId) },
        include: { tournament: true }
    });
    const badges = await prisma.playerBadge.findMany({
        where: { playerId: String(playerId) },
        include: { tournament: true }
    });
    const achievements = {
        trophies: [],
        records: [],
        milestones: []
    };
    const totalGoals = stats.reduce((sum, stat) => sum + stat.goals, 0);
    const totalAssists = stats.reduce((sum, stat) => sum + stat.assists, 0);
    const totalMatches = stats.reduce((sum, stat) => sum + stat.matchesPlayed, 0);
    if (totalGoals >= 50)
        achievements.milestones.push({ type: 'goals', value: 50, description: '50 buts marqués' });
    if (totalGoals >= 100)
        achievements.milestones.push({ type: 'goals', value: 100, description: '100 buts marqués' });
    if (totalAssists >= 25)
        achievements.milestones.push({ type: 'assists', value: 25, description: '25 passes décisives' });
    if (totalMatches >= 50)
        achievements.milestones.push({ type: 'matches', value: 50, description: '50 matchs joués' });
    achievements.trophies = badges.map((badge) => ({
        type: 'badge',
        name: badge.badgeName,
        description: badge.description,
        icon: badge.icon,
        earnedAt: badge.earnedAt,
        tournament: badge.tournament?.name
    }));
    return achievements;
}
function generatePublicProfileHTML(player, stats, averageRating, reputationLevel) {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${player.name} - Profil 7ouma Ligue</title>
    <meta name="description" content="Profil de ${player.name}, ${player.position} de niveau ${reputationLevel} dans 7ouma Ligue">
    <meta property="og:title" content="${player.name} - 7ouma Ligue">
    <meta property="og:description" content="Découvrez le profil de ${player.name}">
    <meta property="og:type" content="profile">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .profile-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; margin-bottom: 20px; }
        .player-header { display: flex; align-items: center; margin-bottom: 20px; }
        .player-avatar { width: 100px; height: 100px; background: #ffd700; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-right: 20px; }
        .player-info h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .player-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #ffd700; }
        .stat-label { font-size: 0.9rem; opacity: 0.8; }
        .badges { display: flex; flex-wrap: wrap; gap: 10px; }
        .badge { background: rgba(255,255,255,0.2); padding: 10px; border-radius: 10px; display: flex; align-items: center; }
        .badge-icon { font-size: 1.5rem; margin-right: 10px; }
        .reputation { background: linear-gradient(45deg, #ffd700, #ffed4e); color: #333; padding: 10px; border-radius: 10px; text-align: center; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="profile-card">
            <div class="player-header">
                <div class="player-avatar">${player.team?.logo || '⚽'}</div>
                <div>
                    <h1>${player.name}</h1>
                    <p>${player.position} • Niveau ${reputationLevel}</p>
                    <p>${player.team?.name || 'Équipe libre'}</p>
                </div>
            </div>
            
            <div class="player-details">
                <div class="stat-card">
                    <div class="stat-value">${stats.goals}</div>
                    <div class="stat-label">Buts</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.assists}</div>
                    <div class="stat-label">Passes décisives</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.matches}</div>
                    <div class="stat-label">Matchs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${Math.round(averageRating * 10) / 10}</div>
                    <div class="stat-label">Note moyenne</div>
                </div>
            </div>
            
            <div class="reputation">
                🏆 Niveau ${reputationLevel}
            </div>
        </div>
        
        <div class="profile-card">
            <h2>Badges et Réalisations</h2>
            <div class="badges">
                ${player.playerBadges.map((badge) => `
                    <div class="badge">
                        <span class="badge-icon">${badge.icon}</span>
                        <div>
                            <div><strong>${badge.badgeName}</strong></div>
                            <div>${badge.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>
  `;
}
exports.default = router;
//# sourceMappingURL=player-cards.routes.js.map