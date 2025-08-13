"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReservationStatistics = exports.deleteReservation = exports.updateReservation = exports.createReservation = exports.getCalendarReservations = exports.getReservations = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const getReservations = async (req, res) => {
    try {
        const { stadiumId, fieldType, neighborhood, dateFrom, dateTo, status, purpose, userId, teamId } = req.query;
        const where = {};
        if (stadiumId) {
            where.field = {
                stadiumId: parseInt(stadiumId)
            };
        }
        if (fieldType) {
            where.field = {
                ...where.field,
                type: fieldType
            };
        }
        if (neighborhood) {
            where.field = {
                ...where.field,
                stadium: {
                    neighborhood: neighborhood
                }
            };
        }
        if (dateFrom || dateTo) {
            where.startTime = {};
            if (dateFrom)
                where.startTime.gte = new Date(dateFrom);
            if (dateTo)
                where.startTime.lte = new Date(dateTo);
        }
        if (status) {
            where.status = status;
        }
        if (purpose) {
            where.purpose = purpose;
        }
        if (userId) {
            where.userId = parseInt(userId);
        }
        if (teamId) {
            where.teamId = teamId;
        }
        const reservations = await database_1.prisma.reservation.findMany({
            where,
            include: {
                field: {
                    include: {
                        stadium: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        logo: true
                    }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });
        return (0, apiResponse_1.success)(res, "Réservations récupérées avec succès", reservations);
    }
    catch (error) {
        console.error("Erreur lors de la récupération des réservations:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des réservations");
    }
};
exports.getReservations = getReservations;
const getCalendarReservations = async (req, res) => {
    try {
        const { view, date, stadiumId } = req.query;
        let startDate;
        let endDate;
        const baseDate = date ? new Date(date) : new Date();
        switch (view) {
            case 'day':
                startDate = new Date(baseDate);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(baseDate);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'week':
                const dayOfWeek = baseDate.getDay();
                const diff = baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                startDate = new Date(baseDate.setDate(diff));
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'month':
                startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
                endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            default:
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
        }
        const where = {
            startTime: {
                gte: startDate,
                lte: endDate
            }
        };
        if (stadiumId) {
            where.field = {
                stadiumId: parseInt(stadiumId)
            };
        }
        const reservations = await database_1.prisma.reservation.findMany({
            where,
            include: {
                field: {
                    include: {
                        stadium: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        logo: true
                    }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });
        return (0, apiResponse_1.success)(res, "Données du calendrier récupérées avec succès", {
            reservations,
            view,
            date: baseDate.toISOString(),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
    }
    catch (error) {
        console.error("Erreur lors de la récupération du calendrier:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération du calendrier");
    }
};
exports.getCalendarReservations = getCalendarReservations;
const createReservation = async (req, res) => {
    try {
        const { fieldId, title, description, startTime, endTime, purpose, teamId } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return (0, apiResponse_1.unauthorized)(res, "Utilisateur non authentifié");
        }
        const field = await database_1.prisma.field.findFirst({
            where: {
                id: fieldId,
                isActive: true
            },
            include: {
                stadium: true
            }
        });
        if (!field) {
            return (0, apiResponse_1.notFound)(res, "Terrain non trouvé ou inactif");
        }
        const conflictingReservation = await database_1.prisma.reservation.findFirst({
            where: {
                fieldId,
                status: {
                    in: ['pending', 'confirmed']
                },
                OR: [
                    {
                        startTime: {
                            lt: new Date(endTime)
                        },
                        endTime: {
                            gt: new Date(startTime)
                        }
                    }
                ]
            }
        });
        if (conflictingReservation) {
            return (0, apiResponse_1.badRequest)(res, "Ce créneau est déjà réservé");
        }
        const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
        const pricing = field.stadium.pricing;
        const hourlyRate = pricing?.hourly || 50;
        const price = duration * hourlyRate;
        const reservation = await database_1.prisma.reservation.create({
            data: {
                fieldId,
                userId,
                teamId,
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                purpose,
                price,
                status: 'pending'
            },
            include: {
                field: {
                    include: {
                        stadium: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        logo: true
                    }
                }
            }
        });
        await database_1.prisma.reservationNotification.create({
            data: {
                reservationId: reservation.id,
                type: 'confirmation',
                message: `Réservation créée pour ${field.name} le ${new Date(startTime).toLocaleDateString('fr-FR')}`
            }
        });
        return (0, apiResponse_1.created)(res, "Réservation créée avec succès", reservation);
    }
    catch (error) {
        console.error("Erreur lors de la création de la réservation:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la création de la réservation");
    }
};
exports.createReservation = createReservation;
const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, startTime, endTime, purpose, status, notes } = req.body;
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        if (!userId) {
            return (0, apiResponse_1.unauthorized)(res, "Utilisateur non authentifié");
        }
        const existingReservation = await database_1.prisma.reservation.findUnique({
            where: { id: parseInt(id) },
            include: {
                field: true,
                user: true
            }
        });
        if (!existingReservation) {
            return (0, apiResponse_1.notFound)(res, "Réservation non trouvée");
        }
        if (existingReservation.userId !== userId && userRole !== 'admin') {
            return (0, apiResponse_1.unauthorized)(res, "Vous n'êtes pas autorisé à modifier cette réservation");
        }
        if (startTime || endTime) {
            const newStartTime = startTime ? new Date(startTime) : existingReservation.startTime;
            const newEndTime = endTime ? new Date(endTime) : existingReservation.endTime;
            const conflictingReservation = await database_1.prisma.reservation.findFirst({
                where: {
                    fieldId: existingReservation.fieldId,
                    id: {
                        not: parseInt(id)
                    },
                    status: {
                        in: ['pending', 'confirmed']
                    },
                    OR: [
                        {
                            startTime: {
                                lt: newEndTime
                            },
                            endTime: {
                                gt: newStartTime
                            }
                        }
                    ]
                }
            });
            if (conflictingReservation) {
                return (0, apiResponse_1.badRequest)(res, "Ce créneau est déjà réservé");
            }
        }
        const updatedReservation = await database_1.prisma.reservation.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                purpose,
                status,
                notes
            },
            include: {
                field: {
                    include: {
                        stadium: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        logo: true
                    }
                }
            }
        });
        if (status && status !== existingReservation.status) {
            await database_1.prisma.reservationNotification.create({
                data: {
                    reservationId: parseInt(id),
                    type: 'change',
                    message: `Statut de la réservation changé de ${existingReservation.status} à ${status}`
                }
            });
        }
        return (0, apiResponse_1.success)(res, "Réservation mise à jour avec succès", updatedReservation);
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour de la réservation:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour de la réservation");
    }
};
exports.updateReservation = updateReservation;
const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        if (!userId) {
            return (0, apiResponse_1.unauthorized)(res, "Utilisateur non authentifié");
        }
        const reservation = await database_1.prisma.reservation.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true
            }
        });
        if (!reservation) {
            return (0, apiResponse_1.notFound)(res, "Réservation non trouvée");
        }
        if (reservation.userId !== userId && userRole !== 'admin') {
            return (0, apiResponse_1.unauthorized)(res, "Vous n'êtes pas autorisé à supprimer cette réservation");
        }
        await database_1.prisma.reservation.delete({
            where: { id: parseInt(id) }
        });
        await database_1.prisma.reservationNotification.create({
            data: {
                reservationId: parseInt(id),
                type: 'cancellation',
                message: "Réservation annulée"
            }
        });
        return (0, apiResponse_1.success)(res, "Réservation supprimée avec succès", null);
    }
    catch (error) {
        console.error("Erreur lors de la suppression de la réservation:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la suppression de la réservation");
    }
};
exports.deleteReservation = deleteReservation;
const getReservationStatistics = async (req, res) => {
    try {
        const { fieldId, stadiumId, dateFrom, dateTo } = req.query;
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        if (!userId) {
            return (0, apiResponse_1.unauthorized)(res, "Utilisateur non authentifié");
        }
        const where = {};
        if (fieldId) {
            where.fieldId = parseInt(fieldId);
        }
        if (stadiumId) {
            where.field = {
                stadiumId: parseInt(stadiumId)
            };
        }
        if (dateFrom || dateTo) {
            where.startTime = {};
            if (dateFrom)
                where.startTime.gte = new Date(dateFrom);
            if (dateTo)
                where.startTime.lte = new Date(dateTo);
        }
        if (userRole !== 'admin') {
            where.userId = userId;
        }
        const [totalReservations, confirmedReservations, pendingReservations, cancelledReservations, totalRevenue, averageDuration] = await Promise.all([
            database_1.prisma.reservation.count({ where }),
            database_1.prisma.reservation.count({ where: { ...where, status: 'confirmed' } }),
            database_1.prisma.reservation.count({ where: { ...where, status: 'pending' } }),
            database_1.prisma.reservation.count({ where: { ...where, status: 'cancelled' } }),
            database_1.prisma.reservation.aggregate({
                where: { ...where, status: 'confirmed' },
                _sum: { price: true }
            }),
            database_1.prisma.reservation.aggregate({
                where: { ...where, status: 'confirmed' },
                _avg: {}
            })
        ]);
        const statistics = {
            total: totalReservations,
            confirmed: confirmedReservations,
            pending: pendingReservations,
            cancelled: cancelledReservations,
            revenue: totalRevenue._sum.price || 0,
            averageDuration: 0,
            occupancyRate: totalReservations > 0 ? (confirmedReservations / totalReservations) * 100 : 0
        };
        return (0, apiResponse_1.success)(res, "Statistiques récupérées avec succès", statistics);
    }
    catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des statistiques");
    }
};
exports.getReservationStatistics = getReservationStatistics;
router.get("/", auth_middleware_1.authenticateToken, exports.getReservations);
router.get("/calendar", auth_middleware_1.authenticateToken, exports.getCalendarReservations);
router.post("/", auth_middleware_1.authenticateToken, exports.createReservation);
router.patch("/:id", auth_middleware_1.authenticateToken, exports.updateReservation);
router.delete("/:id", auth_middleware_1.authenticateToken, exports.deleteReservation);
router.get("/statistics", auth_middleware_1.authenticateToken, exports.getReservationStatistics);
exports.default = router;
//# sourceMappingURL=reservation.routes.js.map