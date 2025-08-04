"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/community/leagues', async (req, res) => {
    try {
        const { region, season } = req.query;
        let whereClause = {
            isCommunityLeague: true
        };
        if (region) {
            whereClause.region = region;
        }
        if (season) {
            whereClause.season = season;
        }
        const leagues = await prisma.communityLeague.findMany({
            where: whereClause,
            include: {
                tournaments: {
                    include: {
                        tournament: true
                    }
                },
                participants: {
                    include: {
                        team: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return (0, apiResponse_1.success)(res, leagues);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des ligues:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des ligues');
    }
});
router.get('/community/standings', async (req, res) => {
    try {
        const { leagueId, season } = req.query;
        let whereClause = {};
        if (leagueId) {
            whereClause.leagueId = String(leagueId);
        }
        if (season) {
            whereClause.season = season;
        }
        const standings = await prisma.communityStanding.findMany({
            where: whereClause,
            include: {
                team: true,
                league: true
            },
            orderBy: [
                { points: 'desc' },
                { goalDifference: 'desc' },
                { goalsFor: 'desc' }
            ]
        });
        return (0, apiResponse_1.success)(res, standings);
    }
    catch (error) {
        console.error('Erreur lors de la récupération du classement:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération du classement');
    }
});
router.post('/feed', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { content, media, hashtags, tournamentId, matchId, isPublic } = req.body;
        const post = await prisma.socialPost.create({
            data: {
                content,
                media: media || [],
                hashtags: hashtags || [],
                tournamentId: tournamentId ? String(tournamentId) : null,
                matchId: matchId ? String(matchId) : null,
                isPublic: isPublic !== false,
                playerId: String(req.user?.userId || 0),
                teamId: null
            }
        });
        return (0, apiResponse_1.success)(res, post, 'Post créé avec succès');
    }
    catch (error) {
        console.error('Erreur lors de la création du post:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la création du post');
    }
});
router.get('/feed', async (req, res) => {
    try {
        const { page = 1, limit = 20, tournamentId, hashtag } = req.query;
        let whereClause = {
            isPublic: true
        };
        if (tournamentId) {
            whereClause.tournamentId = String(tournamentId);
        }
        if (hashtag) {
            whereClause.hashtags = {
                has: hashtag
            };
        }
        const posts = await prisma.socialPost.findMany({
            where: whereClause,
            include: {
                player: {
                    include: {
                        team: true
                    }
                },
                tournament: true,
                match: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });
        const total = await prisma.socialPost.count({ where: whereClause });
        return (0, apiResponse_1.success)(res, {
            posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération du feed:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération du feed');
    }
});
router.post('/votes', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { type, targetId, targetType, tournamentId, reason } = req.body;
        const existingVote = await prisma.vote.findFirst({
            where: {
                userId: req.user?.userId || 0,
                type,
                targetId: parseInt(targetId),
                targetType,
                tournamentId: String(tournamentId)
            }
        });
        if (existingVote) {
            return (0, apiResponse_1.badRequest)(res, 'Vous avez déjà voté pour cette catégorie');
        }
        const vote = await prisma.vote.create({
            data: {
                userId: req.user?.userId || 0,
                type,
                targetId: parseInt(targetId),
                targetType,
                tournamentId: String(tournamentId)
            }
        });
        return (0, apiResponse_1.success)(res, vote, 'Vote enregistré avec succès');
    }
    catch (error) {
        console.error('Erreur lors de l\'enregistrement du vote:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de l\'enregistrement du vote');
    }
});
router.get('/votes', async (req, res) => {
    try {
        const { type, tournamentId, limit = 10 } = req.query;
        let whereClause = {};
        if (type) {
            whereClause.type = type;
        }
        if (tournamentId) {
            whereClause.tournamentId = String(tournamentId);
        }
        const votes = await prisma.vote.groupBy({
            by: ['targetId', 'targetType'],
            where: whereClause,
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: parseInt(limit)
        });
        const enrichedVotes = await Promise.all(votes.map(async (vote) => {
            let target;
            if (vote.targetType === 'player') {
                target = await prisma.player.findUnique({
                    where: { id: String(vote.targetId) },
                    include: { team: true }
                });
            }
            else if (vote.targetType === 'match') {
                target = await prisma.match.findUnique({
                    where: { id: String(vote.targetId) },
                    include: {
                        homeTeamRef: true,
                        group: true,
                        tournament: true,
                    }
                });
            }
            return {
                targetId: vote.targetId,
                targetType: vote.targetType,
                votes: vote._count?.id || 0,
                target
            };
        }));
        return (0, apiResponse_1.success)(res, enrichedVotes);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des votes:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des votes');
    }
});
router.post('/teams/:id/fans', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { level = 'supporter' } = req.body;
        const existingFan = await prisma.teamFan.findFirst({
            where: {
                teamId: String(id),
                userId: req.user?.userId || 0
            }
        });
        if (existingFan) {
            return (0, apiResponse_1.badRequest)(res, 'Vous êtes déjà fan de cette équipe');
        }
        const fan = await prisma.teamFan.create({
            data: {
                teamId: String(id),
                userId: req.user?.userId || 0,
                level,
            },
            include: {
                team: true,
                user: true
            }
        });
        return (0, apiResponse_1.success)(res, fan, 'Vous êtes maintenant fan de cette équipe');
    }
    catch (error) {
        console.error('Erreur lors de l\'ajout du fan:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de l\'ajout du fan');
    }
});
router.get('/teams/:id/fans', async (req, res) => {
    try {
        const { id } = req.params;
        const { level, page = 1, limit = 20 } = req.query;
        let whereClause = {
            teamId: String(id)
        };
        if (level) {
            whereClause.level = level;
        }
        const fans = await prisma.teamFan.findMany({
            where: whereClause,
            include: {
                user: true
            },
            orderBy: [
                { level: 'desc' },
                { joinedAt: 'asc' }
            ],
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });
        const total = await prisma.teamFan.count({ where: whereClause });
        return (0, apiResponse_1.success)(res, {
            fans,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des fans:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des fans');
    }
});
router.post('/community/leagues', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { name, description, region, season, maxTeams, rules, startDate, endDate } = req.body;
        const league = await prisma.communityLeague.create({
            data: {
                name,
                description,
                region,
                season,
                maxTeams: parseInt(maxTeams),
                rules,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isCommunityLeague: true,
                createdBy: req.user?.userId || 0,
                status: 'active'
            }
        });
        return (0, apiResponse_1.success)(res, league, 'Ligue communautaire créée avec succès');
    }
    catch (error) {
        console.error('Erreur lors de la création de la ligue:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la création de la ligue');
    }
});
router.post('/community/leagues/:id/join', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { teamId } = req.body;
        const league = await prisma.communityLeague.findUnique({
            where: { id: parseInt(id) },
            include: {
                participants: true
            }
        });
        if (!league) {
            return (0, apiResponse_1.notFound)(res, 'Ligue non trouvée');
        }
        if (league.participants && league.participants.length >= league.maxTeams) {
            return (0, apiResponse_1.badRequest)(res, 'La ligue est complète');
        }
        const participant = await prisma.communityLeagueParticipant.create({
            data: {
                leagueId: parseInt(id),
                teamId: String(teamId),
            }
        });
        return (0, apiResponse_1.success)(res, participant, 'Équipe ajoutée à la ligue');
    }
    catch (error) {
        console.error('Erreur lors de l\'ajout à la ligue:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de l\'ajout à la ligue');
    }
});
exports.default = router;
//# sourceMappingURL=community.routes.js.map