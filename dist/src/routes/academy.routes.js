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
router.get('/', async (req, res) => {
    try {
        const academies = await prisma.academy.findMany({
            where: { isActive: true },
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                },
                teams: true,
                players: true,
                sponsors: {
                    where: { isActive: true }
                }
            }
        });
        return (0, apiResponse_1.success)(res, 'Académies récupérées avec succès', academies);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des académies:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des académies');
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const academy = await prisma.academy.findUnique({
            where: { id: parseInt(id) },
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                },
                staff: {
                    select: { id: true, name: true, email: true, role: true }
                },
                teams: {
                    include: {
                        coach: {
                            select: { id: true, name: true, email: true }
                        },
                        players: true
                    }
                },
                players: {
                    include: {
                        team: true,
                        stats: true
                    }
                },
                events: {
                    orderBy: { startDate: 'desc' }
                },
                announcements: {
                    orderBy: { createdAt: 'desc' }
                },
                sponsors: {
                    where: { isActive: true }
                }
            }
        });
        if (!academy) {
            return (0, apiResponse_1.notFound)(res, 'Académie non trouvée');
        }
        return (0, apiResponse_1.success)(res, 'Académie récupérée avec succès', academy);
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'académie:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération de l\'académie');
    }
});
router.post('/', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { name, description, address, city, region, phone, email, website, socialMedia, history, values } = req.body;
        if (!name || !address || !city || !region) {
            return (0, apiResponse_1.badRequest)(res, 'Les champs nom, adresse, ville et région sont obligatoires');
        }
        const academy = await prisma.academy.create({
            data: {
                name,
                description,
                address,
                city,
                region,
                phone,
                email,
                website,
                socialMedia,
                history,
                values,
                ownerId: userId
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        return (0, apiResponse_1.created)(res, 'Académie créée avec succès', academy);
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'académie:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la création de l\'académie');
    }
});
router.put('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const updateData = req.body;
        const academy = await prisma.academy.findUnique({
            where: { id: parseInt(id) }
        });
        if (!academy) {
            return (0, apiResponse_1.notFound)(res, 'Académie non trouvée');
        }
        if (academy.ownerId !== userId) {
            return (0, apiResponse_1.unauthorized)(res, 'Vous n\'êtes pas autorisé à modifier cette académie');
        }
        const updatedAcademy = await prisma.academy.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        return (0, apiResponse_1.success)(res, 'Académie mise à jour avec succès', updatedAcademy);
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de l\'académie:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la mise à jour de l\'académie');
    }
});
router.delete('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const academy = await prisma.academy.findUnique({
            where: { id: parseInt(id) }
        });
        if (!academy) {
            return (0, apiResponse_1.notFound)(res, 'Académie non trouvée');
        }
        if (academy.ownerId !== userId) {
            return (0, apiResponse_1.unauthorized)(res, 'Vous n\'êtes pas autorisé à supprimer cette académie');
        }
        await prisma.academy.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });
        return (0, apiResponse_1.success)(res, 'Académie supprimée avec succès');
    }
    catch (error) {
        console.error('Erreur lors de la suppression de l\'académie:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la suppression de l\'académie');
    }
});
router.get('/:academyId/teams', async (req, res) => {
    try {
        const { academyId } = req.params;
        const teams = await prisma.academyTeam.findMany({
            where: { academyId: parseInt(academyId) },
            include: {
                coach: {
                    select: { id: true, name: true, email: true }
                },
                players: true
            }
        });
        return (0, apiResponse_1.success)(res, 'Équipes récupérées avec succès', teams);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des équipes:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des équipes');
    }
});
router.post('/:academyId/teams', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { academyId } = req.params;
        const userId = req.user?.userId;
        const { name, category, color, coachId } = req.body;
        if (!name || !category) {
            return (0, apiResponse_1.badRequest)(res, 'Les champs nom et catégorie sont obligatoires');
        }
        const academy = await prisma.academy.findUnique({
            where: { id: parseInt(academyId) }
        });
        if (!academy || academy.ownerId !== userId) {
            return (0, apiResponse_1.unauthorized)(res, 'Vous n\'êtes pas autorisé à créer une équipe dans cette académie');
        }
        const team = await prisma.academyTeam.create({
            data: {
                name,
                category,
                color,
                coachId,
                academyId: parseInt(academyId)
            },
            include: {
                coach: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        return (0, apiResponse_1.created)(res, 'Équipe créée avec succès', team);
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'équipe:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la création de l\'équipe');
    }
});
router.get('/:academyId/players', async (req, res) => {
    try {
        const { academyId } = req.params;
        const players = await prisma.academyPlayer.findMany({
            where: { academyId: parseInt(academyId) },
            include: {
                team: true,
                stats: true
            }
        });
        return (0, apiResponse_1.success)(res, 'Joueurs récupérés avec succès', players);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des joueurs:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des joueurs');
    }
});
router.post('/:academyId/players', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { academyId } = req.params;
        const userId = req.user?.userId;
        const { firstName, lastName, birthDate, position, jerseyNumber, parentPhone, parentEmail, medicalInfo, teamId } = req.body;
        if (!firstName || !lastName || !birthDate || !position) {
            return (0, apiResponse_1.badRequest)(res, 'Les champs prénom, nom, date de naissance et position sont obligatoires');
        }
        const academy = await prisma.academy.findUnique({
            where: { id: parseInt(academyId) }
        });
        if (!academy || academy.ownerId !== userId) {
            return (0, apiResponse_1.unauthorized)(res, 'Vous n\'êtes pas autorisé à créer un joueur dans cette académie');
        }
        const player = await prisma.academyPlayer.create({
            data: {
                firstName,
                lastName,
                birthDate: new Date(birthDate),
                position,
                jerseyNumber,
                parentPhone,
                parentEmail,
                medicalInfo,
                teamId: teamId ? parseInt(teamId) : null,
                academyId: parseInt(academyId)
            },
            include: {
                team: true
            }
        });
        return (0, apiResponse_1.created)(res, 'Joueur créé avec succès', player);
    }
    catch (error) {
        console.error('Erreur lors de la création du joueur:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la création du joueur');
    }
});
router.get('/:academyId/events', async (req, res) => {
    try {
        const { academyId } = req.params;
        const events = await prisma.academyEvent.findMany({
            where: { academyId: parseInt(academyId) },
            include: {
                participants: {
                    include: {
                        player: true,
                        team: true
                    }
                }
            },
            orderBy: { startDate: 'desc' }
        });
        return (0, apiResponse_1.success)(res, 'Événements récupérés avec succès', events);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des événements');
    }
});
router.post('/:academyId/events', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { academyId } = req.params;
        const userId = req.user?.userId;
        const { title, description, type, startDate, endDate, location, isPublic, maxParticipants, registrationDeadline } = req.body;
        if (!title || !type || !startDate || !endDate) {
            return (0, apiResponse_1.badRequest)(res, 'Les champs titre, type, date de début et date de fin sont obligatoires');
        }
        const academy = await prisma.academy.findUnique({
            where: { id: parseInt(academyId) }
        });
        if (!academy || academy.ownerId !== userId) {
            return (0, apiResponse_1.unauthorized)(res, 'Vous n\'êtes pas autorisé à créer un événement dans cette académie');
        }
        const event = await prisma.academyEvent.create({
            data: {
                title,
                description,
                type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                location,
                isPublic: isPublic || false,
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
                registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
                academyId: parseInt(academyId)
            }
        });
        return (0, apiResponse_1.created)(res, 'Événement créé avec succès', event);
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la création de l\'événement');
    }
});
router.get('/:academyId/announcements', async (req, res) => {
    try {
        const { academyId } = req.params;
        const announcements = await prisma.academyAnnouncement.findMany({
            where: { academyId: parseInt(academyId) },
            orderBy: { createdAt: 'desc' }
        });
        return (0, apiResponse_1.success)(res, 'Annonces récupérées avec succès', announcements);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des annonces:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des annonces');
    }
});
router.post('/:academyId/announcements', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { academyId } = req.params;
        const userId = req.user?.userId;
        const { title, content, type, isPublic } = req.body;
        if (!title || !content || !type) {
            return (0, apiResponse_1.badRequest)(res, 'Les champs titre, contenu et type sont obligatoires');
        }
        const academy = await prisma.academy.findUnique({
            where: { id: parseInt(academyId) }
        });
        if (!academy || academy.ownerId !== userId) {
            return (0, apiResponse_1.unauthorized)(res, 'Vous n\'êtes pas autorisé à créer une annonce dans cette académie');
        }
        const announcement = await prisma.academyAnnouncement.create({
            data: {
                title,
                content,
                type,
                isPublic: isPublic || false,
                academyId: parseInt(academyId)
            }
        });
        return (0, apiResponse_1.created)(res, 'Annonce créée avec succès', announcement);
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'annonce:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la création de l\'annonce');
    }
});
router.get('/:academyId/payments', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { academyId } = req.params;
        const userId = req.user?.userId;
        const academy = await prisma.academy.findUnique({
            where: { id: parseInt(academyId) }
        });
        if (!academy || academy.ownerId !== userId) {
            return (0, apiResponse_1.unauthorized)(res, 'Vous n\'êtes pas autorisé à voir les paiements de cette académie');
        }
        const payments = await prisma.academyPayment.findMany({
            where: { academyId: parseInt(academyId) },
            include: {
                player: true,
                team: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return (0, apiResponse_1.success)(res, 'Paiements récupérés avec succès', payments);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des paiements:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la récupération des paiements');
    }
});
router.post('/:academyId/payments', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { academyId } = req.params;
        const userId = req.user?.userId;
        const { playerId, teamId, type, amount, description, dueDate, method } = req.body;
        if (!type || !amount) {
            return (0, apiResponse_1.badRequest)(res, 'Les champs type et montant sont obligatoires');
        }
        const academy = await prisma.academy.findUnique({
            where: { id: parseInt(academyId) }
        });
        if (!academy || academy.ownerId !== userId) {
            return (0, apiResponse_1.unauthorized)(res, 'Vous n\'êtes pas autorisé à créer un paiement dans cette académie');
        }
        const payment = await prisma.academyPayment.create({
            data: {
                playerId: playerId ? parseInt(playerId) : null,
                teamId: teamId ? parseInt(teamId) : null,
                type,
                amount: parseFloat(amount),
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                method,
                academyId: parseInt(academyId)
            },
            include: {
                player: true,
                team: true
            }
        });
        return (0, apiResponse_1.created)(res, 'Paiement créé avec succès', payment);
    }
    catch (error) {
        console.error('Erreur lors de la création du paiement:', error);
        return (0, apiResponse_1.badRequest)(res, 'Erreur lors de la création du paiement');
    }
});
exports.default = router;
//# sourceMappingURL=academy.routes.js.map