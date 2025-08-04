"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/tournaments/ai/suggestions', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { numberOfTeams, maxDuration, availableFields, maxMatchesPerDay, includeThirdPlace } = req.body;
        const suggestions = [
            {
                description: 'Format équilibré avec phases de groupes',
                format: 'Groupes + Élimination',
                numberOfGroups: Math.ceil(numberOfTeams / 4),
                teamsPerGroup: Math.ceil(numberOfTeams / Math.ceil(numberOfTeams / 4)),
                totalMatches: Math.ceil(numberOfTeams * 1.5),
                estimatedDuration: `${Math.ceil(numberOfTeams / 4)} jours`,
                advantages: [
                    'Équilibre entre compétitivité et durée',
                    'Permet à toutes les équipes de jouer plusieurs matchs',
                    'Format adapté aux terrains disponibles'
                ],
                isRecommended: true
            },
            {
                description: 'Format coupe rapide',
                format: 'Élimination directe',
                numberOfGroups: 0,
                teamsPerGroup: 0,
                totalMatches: numberOfTeams - 1,
                estimatedDuration: `${Math.ceil(numberOfTeams / 8)} jours`,
                advantages: [
                    'Format rapide et dynamique',
                    'Suspense jusqu\'à la fin',
                    'Idéal pour un nombre impair d\'équipes'
                ],
                isRecommended: false
            }
        ];
        return (0, apiResponse_1.success)(res, suggestions);
    }
    catch (error) {
        console.error('Erreur lors de la génération des suggestions:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la génération des suggestions');
    }
});
router.post('/tournaments/ai/personalized', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { userId, preferences } = req.body;
        const recommendation = {
            description: 'Recommandation basée sur vos préférences',
            format: 'Format personnalisé',
            numberOfGroups: 2,
            teamsPerGroup: 4,
            totalMatches: 12,
            estimatedDuration: '3 jours',
            advantages: [
                'Adapté à vos contraintes',
                'Optimisé pour votre expérience',
                'Basé sur vos tournois précédents'
            ],
            isRecommended: true
        };
        return (0, apiResponse_1.success)(res, recommendation);
    }
    catch (error) {
        console.error('Erreur lors de la génération de la recommandation:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la génération de la recommandation');
    }
});
router.post('/social/posts', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { content, media = [], hashtags = [], tournamentId, matchId, isPublic = true } = req.body;
        const post = await prisma.socialPost.create({
            data: {
                content,
                media,
                hashtags,
                tournamentId: tournamentId ? String(tournamentId) : null,
                matchId: matchId ? String(matchId) : null,
                isPublic,
                playerId: req.user?.userId ? String(req.user.userId) : null
            }
        });
        return (0, apiResponse_1.success)(res, post, 'Post créé avec succès');
    }
    catch (error) {
        console.error('Erreur lors de la création du post:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la création du post');
    }
});
router.get('/social/posts', async (req, res) => {
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
        console.error('Erreur lors de la récupération des posts:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des posts');
    }
});
router.post('/social/posts/:id/like', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const post = await prisma.socialPost.findUnique({
            where: { id: parseInt(id) }
        });
        if (!post) {
            return (0, apiResponse_1.notFound)(res, 'Post non trouvé');
        }
        await prisma.socialPost.update({
            where: { id: parseInt(id) },
            data: {
                likes: post.likes + 1
            }
        });
        return (0, apiResponse_1.success)(res, { message: 'Post liké' });
    }
    catch (error) {
        console.error('Erreur lors du like:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors du like');
    }
});
router.post('/social/posts/:id/comment', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const post = await prisma.socialPost.findUnique({
            where: { id: parseInt(id) }
        });
        if (!post) {
            return (0, apiResponse_1.notFound)(res, 'Post non trouvé');
        }
        await prisma.socialPost.update({
            where: { id: parseInt(id) },
            data: {
                comments: post.comments + 1
            }
        });
        return (0, apiResponse_1.success)(res, { message: 'Commentaire ajouté' });
    }
    catch (error) {
        console.error('Erreur lors du commentaire:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors du commentaire');
    }
});
router.post('/social/posts/:id/share', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const post = await prisma.socialPost.findUnique({
            where: { id: parseInt(id) }
        });
        if (!post) {
            return (0, apiResponse_1.notFound)(res, 'Post non trouvé');
        }
        await prisma.socialPost.update({
            where: { id: parseInt(id) },
            data: {
                shares: post.shares + 1
            }
        });
        return (0, apiResponse_1.success)(res, { message: 'Post partagé' });
    }
    catch (error) {
        console.error('Erreur lors du partage:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors du partage');
    }
});
router.post('/payments/create', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { amount, currency = 'MAD', paymentMethod, tournamentId, teamId, playerId, metadata = {} } = req.body;
        const transaction = await prisma.paymentTransaction.create({
            data: {
                amount: parseFloat(amount),
                currency,
                paymentMethod,
                tournamentId: tournamentId ? String(tournamentId) : null,
                teamId: teamId ? String(teamId) : null,
                playerId: playerId ? String(playerId) : null,
                metadata,
                status: 'pending'
            }
        });
        return (0, apiResponse_1.success)(res, transaction, 'Paiement créé avec succès');
    }
    catch (error) {
        console.error('Erreur lors de la création du paiement:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la création du paiement');
    }
});
router.get('/payments/transactions', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        let whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        const transactions = await prisma.paymentTransaction.findMany({
            where: whereClause,
            include: {
                tournament: true,
                team: true,
                player: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });
        const total = await prisma.paymentTransaction.count({ where: whereClause });
        return (0, apiResponse_1.success)(res, {
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des transactions:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des transactions');
    }
});
router.get('/payments/stats', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const totalTransactions = await prisma.paymentTransaction.count();
        const totalAmount = await prisma.paymentTransaction.aggregate({
            _sum: {
                amount: true
            }
        });
        const pendingTransactions = await prisma.paymentTransaction.count({
            where: { status: 'pending' }
        });
        const completedTransactions = await prisma.paymentTransaction.count({
            where: { status: 'completed' }
        });
        return (0, apiResponse_1.success)(res, {
            totalTransactions,
            totalAmount: totalAmount._sum.amount || 0,
            pendingTransactions,
            completedTransactions
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des statistiques');
    }
});
router.get('/players/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await prisma.playerStats.findMany({
            where: { playerId: String(id) },
            include: {
                tournament: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return (0, apiResponse_1.success)(res, stats);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des statistiques');
    }
});
router.get('/players/:id/badges', async (req, res) => {
    try {
        const { id } = req.params;
        const badges = await prisma.playerBadge.findMany({
            where: { playerId: String(id) },
            include: {
                tournament: true
            },
            orderBy: {
                earnedAt: 'desc'
            }
        });
        return (0, apiResponse_1.success)(res, badges);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des badges:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des badges');
    }
});
router.get('/stadia/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const stadium = await prisma.stadium.findUnique({
            where: { id: parseInt(id) },
            include: {
                tournaments: {
                    include: {
                        tournament: true
                    }
                }
            }
        });
        if (!stadium) {
            return (0, apiResponse_1.notFound)(res, 'Stade non trouvé');
        }
        return (0, apiResponse_1.success)(res, stadium);
    }
    catch (error) {
        console.error('Erreur lors de la récupération du stade:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération du stade');
    }
});
router.get('/matches/current', async (req, res) => {
    try {
        const currentMatch = await prisma.match.findFirst({
            where: {
                status: 'in_progress'
            },
            include: {
                homeTeamRef: true,
                group: true,
                tournament: true,
            },
            orderBy: {
                date: 'desc'
            }
        });
        return (0, apiResponse_1.success)(res, currentMatch);
    }
    catch (error) {
        console.error('Erreur lors de la récupération du match en cours:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération du match en cours');
    }
});
router.get('/matches/next', async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const upcomingMatches = await prisma.match.findMany({
            where: {
                status: 'scheduled',
                date: {
                    gte: new Date().toISOString()
                }
            },
            include: {
                homeTeamRef: true,
                group: true,
                tournament: true,
            },
            orderBy: {
                date: 'asc'
            },
            take: parseInt(limit)
        });
        return (0, apiResponse_1.success)(res, upcomingMatches);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des prochains matchs:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des prochains matchs');
    }
});
router.get('/matches/all', async (req, res) => {
    try {
        const { status, tournamentId } = req.query;
        let whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (tournamentId) {
            whereClause.tournamentId = tournamentId;
        }
        const matches = await prisma.match.findMany({
            where: whereClause,
            include: {
                homeTeamRef: true,
                group: true,
                tournament: true,
            },
            orderBy: {
                date: 'desc'
            }
        });
        return (0, apiResponse_1.success)(res, matches);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des matchs:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des matchs');
    }
});
router.get('/all-data', async (req, res) => {
    try {
        const prisma = req.app.get('prisma');
        const [users, teams, players, tournaments, groups, matches, playerStats, playerBadges, socialPosts, stadiums, sponsors] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            }),
            prisma.team.findMany({
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    coachName: true,
                    players: true,
                    wins: true,
                    draws: true,
                    losses: true,
                    goalsScored: true,
                    matchesPlayed: true,
                    createdAt: true
                }
            }),
            prisma.player.findMany({
                select: {
                    id: true,
                    name: true,
                    position: true,
                    level: true,
                    age: true,
                    jerseyNumber: true,
                    teamId: true,
                    createdAt: true
                }
            }),
            prisma.tournament.findMany({
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    startDate: true,
                    endDate: true,
                    prize: true,
                    status: true,
                    numberOfGroups: true,
                    teamsPerGroup: true,
                    drawCompleted: true,
                    createdAt: true
                }
            }),
            prisma.group.findMany({
                select: {
                    id: true,
                    name: true,
                    tournamentId: true,
                    createdAt: true
                }
            }),
            prisma.match.findMany({
                select: {
                    id: true,
                    date: true,
                    time: true,
                    venue: true,
                    homeTeam: true,
                    awayTeam: true,
                    homeScore: true,
                    status: true,
                    tournamentId: true,
                    groupId: true,
                    createdAt: true
                }
            }),
            prisma.playerStats.findMany({
                select: {
                    id: true,
                    playerId: true,
                    tournamentId: true,
                    matchesPlayed: true,
                    goals: true,
                    assists: true,
                    rating: true,
                    createdAt: true
                }
            }),
            prisma.playerBadge.findMany({
                select: {
                    id: true,
                    playerId: true,
                    badgeName: true,
                    description: true,
                    icon: true,
                    earnedAt: true,
                    tournamentId: true,
                    createdAt: true
                }
            }),
            prisma.socialPost.findMany({
                select: {
                    id: true,
                    content: true,
                    mediaUrl: true,
                    hashtags: true,
                    likes: true,
                    authorId: true,
                    tournamentId: true,
                    createdAt: true
                }
            }),
            prisma.stadium.findMany({
                select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    region: true,
                    capacity: true,
                    fieldCount: true,
                    fieldTypes: true,
                    amenities: true,
                    images: true,
                    contactInfo: true,
                    pricing: true,
                    createdAt: true
                }
            }),
            prisma.sponsor.findMany({
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    website: true,
                    contactInfo: true,
                    createdAt: true
                }
            })
        ]);
        res.json({
            success: true,
            data: {
                users,
                teams,
                players,
                tournaments,
                groups,
                matches,
                playerStats,
                playerBadges,
                socialPosts,
                stadiums,
                sponsors
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des données'
        });
    }
});
exports.default = router;
//# sourceMappingURL=advanced.routes.js.map