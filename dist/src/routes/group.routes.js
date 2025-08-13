"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const apiResponse_1 = require("../utils/apiResponse");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Routes de groupes fonctionnelles' });
});
router.get('/test/:id', (req, res) => {
    res.json({
        success: true,
        message: 'Route avec paramètre fonctionnelle',
        id: req.params.id
    });
});
router.get('/tournament/:tournamentId', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const groups = await prisma.group.findMany({
            where: {
                tournamentId: tournamentId
            },
            include: {
                groupTeams: {
                    include: {
                        team: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: groups
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des groupes:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des groupes'
        });
    }
});
router.post('/', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { name, tournamentId } = req.body;
        if (!name || !tournamentId) {
            return (0, apiResponse_1.badRequest)(res, 'Nom et ID du tournoi requis');
        }
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId }
        });
        if (!tournament) {
            return (0, apiResponse_1.notFound)(res, 'Tournoi non trouvé');
        }
        const group = await prisma.group.create({
            data: {
                name,
                tournamentId
            },
            include: {
                groupTeams: {
                    include: {
                        team: true
                    }
                }
            }
        });
        return (0, apiResponse_1.created)(res, 'Groupe créé avec succès', group);
    }
    catch (error) {
        console.error('Erreur lors de la création du groupe:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la création du groupe');
    }
});
router.patch('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return (0, apiResponse_1.badRequest)(res, 'Nom du groupe requis');
        }
        const group = await prisma.group.update({
            where: { id },
            data: { name },
            include: {
                groupTeams: {
                    include: {
                        team: true
                    }
                }
            }
        });
        return (0, apiResponse_1.success)(res, 'Groupe modifié avec succès', group);
    }
    catch (error) {
        console.error('Erreur lors de la modification du groupe:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la modification du groupe');
    }
});
router.delete('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.groupTeam.deleteMany({
            where: { groupId: id }
        });
        await prisma.match.deleteMany({
            where: { groupId: id }
        });
        await prisma.group.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Groupe supprimé avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression du groupe:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du groupe'
        });
    }
});
router.post('/:id/teams', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { teamId } = req.body;
        console.log('🔍 Tentative d\'ajout d\'équipe au groupe:', { groupId: id, teamId, body: req.body });
        if (!teamId) {
            return res.status(400).json({
                success: false,
                message: 'ID de l\'équipe requis'
            });
        }
        const group = await prisma.group.findUnique({
            where: { id }
        });
        if (!group) {
            console.log('❌ Groupe non trouvé:', id);
            return (0, apiResponse_1.notFound)(res, 'Groupe non trouvé');
        }
        const team = await prisma.team.findUnique({
            where: { id: teamId }
        });
        if (!team) {
            console.log('❌ Équipe non trouvée:', teamId);
            return (0, apiResponse_1.notFound)(res, 'Équipe non trouvée');
        }
        const existingGroupTeam = await prisma.groupTeam.findFirst({
            where: {
                teamId,
                group: {
                    tournamentId: group.tournamentId
                }
            }
        });
        if (existingGroupTeam) {
            console.log('❌ Équipe déjà dans un groupe:', teamId);
            return (0, apiResponse_1.badRequest)(res, 'Cette équipe est déjà dans un groupe de ce tournoi');
        }
        console.log('✅ Création du GroupTeam:', { groupId: id, teamId });
        const groupTeam = await prisma.groupTeam.create({
            data: {
                groupId: id,
                teamId
            },
            include: {
                team: true,
                group: true
            }
        });
        console.log('✅ GroupTeam créé avec succès:', groupTeam.id);
        return (0, apiResponse_1.created)(res, 'Équipe ajoutée au groupe avec succès', groupTeam);
    }
    catch (error) {
        console.error('❌ Erreur lors de l\'ajout de l\'équipe au groupe:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de l\'ajout de l\'équipe au groupe');
    }
});
router.delete('/:id/teams/:teamId', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id, teamId } = req.params;
        console.log('🔍 Tentative de retrait d\'équipe du groupe:', { groupId: id, teamId });
        const group = await prisma.group.findUnique({
            where: { id }
        });
        if (!group) {
            console.log('❌ Groupe non trouvé:', id);
            return (0, apiResponse_1.notFound)(res, 'Groupe non trouvé');
        }
        const existingGroupTeam = await prisma.groupTeam.findFirst({
            where: {
                groupId: id,
                teamId
            }
        });
        if (!existingGroupTeam) {
            console.log('❌ Équipe non trouvée dans ce groupe:', { groupId: id, teamId });
            return (0, apiResponse_1.notFound)(res, 'Équipe non trouvée dans ce groupe');
        }
        console.log('✅ Suppression des matchs de l\'équipe dans ce groupe');
        await prisma.match.deleteMany({
            where: {
                groupId: id,
                OR: [
                    { homeTeamId: teamId },
                    { awayTeamId: teamId }
                ]
            }
        });
        console.log('✅ Retrait de l\'équipe du groupe');
        await prisma.groupTeam.deleteMany({
            where: {
                groupId: id,
                teamId
            }
        });
        console.log('✅ Équipe retirée avec succès');
        return (0, apiResponse_1.success)(res, 'Équipe retirée du groupe avec succès', { message: 'Équipe retirée du groupe avec succès' });
    }
    catch (error) {
        console.error('❌ Erreur lors du retrait de l\'équipe du groupe:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors du retrait de l\'équipe du groupe');
    }
});
exports.default = router;
//# sourceMappingURL=group.routes.js.map