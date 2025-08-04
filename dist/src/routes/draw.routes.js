"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const apiResponse_1 = require("../utils/apiResponse");
const authMiddleware = auth_middleware_1.authenticateToken;
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/tournaments/:id/draw', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { numberOfGroups } = req.body;
        const tournament = await prisma.tournament.findUnique({
            where: { id: String(id) },
            include: {
                tournamentTeams: {
                    include: {
                        team: true
                    }
                }
            }
        });
        if (!tournament) {
            return (0, apiResponse_1.notFound)(res, 'Tournoi non trouvé');
        }
        if (tournament.drawCompleted) {
            return (0, apiResponse_1.badRequest)(res, 'Le tirage a déjà été effectué pour ce tournoi');
        }
        const teams = tournament.tournamentTeams.map(tt => tt.team);
        if (teams.length < numberOfGroups * 2) {
            return (0, apiResponse_1.badRequest)(res, 'Nombre d\'équipes insuffisant pour le nombre de groupes demandé');
        }
        const shuffledTeams = shuffleArray([...teams]);
        const groups = [];
        const teamsPerGroup = Math.ceil(teams.length / numberOfGroups);
        for (let i = 0; i < numberOfGroups; i++) {
            const groupTeams = shuffledTeams.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup);
            groups.push({
                name: `Groupe ${String.fromCharCode(65 + i)}`,
                teams: groupTeams,
                index: i
            });
        }
        await prisma.tournament.update({
            where: { id: String(id) },
            data: {
                drawCompleted: true,
                numberOfGroups: numberOfGroups,
                teamsPerGroup: teamsPerGroup
            }
        });
        for (const group of groups) {
            const createdGroup = await prisma.group.create({
                data: {
                    name: group.name,
                    tournamentId: String(id)
                }
            });
            for (const team of group.teams) {
                await prisma.groupTeam.create({
                    data: {
                        groupId: createdGroup.id,
                        teamId: team.id,
                        played: 0,
                        wins: 0,
                        draws: 0,
                        losses: 0,
                        goalsFor: 0,
                        goalsAgainst: 0,
                        points: 0
                    }
                });
            }
        }
        emitDrawEvent(parseInt(tournament.id), groups);
        return (0, apiResponse_1.success)(res, {
            message: 'Tirage effectué avec succès',
            groups: groups.map(group => ({
                name: group.name,
                teams: group.teams.map(team => ({
                    id: team.id,
                    name: team.name,
                    logo: team.logo
                }))
            }))
        });
    }
    catch (error) {
        console.error('Erreur lors du tirage:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors du tirage');
    }
});
router.get('/tournaments/:id/draw-animation', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await prisma.tournament.findUnique({
            where: { id: String(id) },
            include: {
                tournamentTeams: {
                    include: {
                        team: true
                    }
                },
                groups: {
                    include: {
                        groupTeams: {
                            include: {
                                team: true
                            }
                        }
                    }
                }
            }
        });
        if (!tournament) {
            return (0, apiResponse_1.notFound)(res, 'Tournoi non trouvé');
        }
        if (!tournament.drawCompleted) {
            return (0, apiResponse_1.badRequest)(res, 'Le tirage n\'a pas encore été effectué');
        }
        const drawData = {
            tournament: {
                id: tournament.id,
                name: tournament.name,
                logo: tournament.logo
            },
            groups: tournament.groups.map(group => ({
                name: group.name,
                teams: group.groupTeams.map(gt => ({
                    id: gt.team.id,
                    name: gt.team.name,
                    logo: gt.team.logo
                }))
            })),
            remainingTeams: tournament.tournamentTeams.map(tt => tt.team).filter(team => !tournament.groups.some(group => group.groupTeams.some(gt => gt.teamId === team.id)))
        };
        return (0, apiResponse_1.success)(res, drawData);
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'animation:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération de l\'animation');
    }
});
router.delete('/tournaments/:id/draw', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await prisma.tournament.findUnique({
            where: { id: String(id) },
            include: {
                groups: {
                    include: {
                        groupTeams: true
                    }
                }
            }
        });
        if (!tournament) {
            return (0, apiResponse_1.notFound)(res, 'Tournoi non trouvé');
        }
        for (const group of tournament.groups) {
            await prisma.groupTeam.deleteMany({
                where: { groupId: group.id }
            });
            await prisma.group.delete({
                where: { id: group.id }
            });
        }
        await prisma.tournament.update({
            where: { id: String(id) },
            data: {
                drawCompleted: false,
                numberOfGroups: 0,
                teamsPerGroup: 0
            }
        });
        return (0, apiResponse_1.success)(res, { message: 'Tirage annulé avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de l\'annulation du tirage:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de l\'annulation du tirage');
    }
});
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function emitDrawEvent(tournamentId, groups) {
    console.log(`🎲 Événement de tirage émis pour le tournoi ${tournamentId}`);
    console.log('Groupes tirés:', groups.map(g => ({
        name: g.name,
        teams: g.teams.map((t) => t.name)
    })));
}
exports.default = router;
//# sourceMappingURL=draw.routes.js.map