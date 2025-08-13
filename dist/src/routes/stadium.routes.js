"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createField = exports.createStadium = exports.getField = exports.getFields = exports.getStadiumAvailability = exports.getStadium = exports.getStadiums = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const getStadiums = async (req, res) => {
    try {
        const { city, region, neighborhood, fieldType, isActive, isPartner } = req.query;
        const where = {};
        if (city)
            where.city = city;
        if (region)
            where.region = region;
        if (neighborhood)
            where.neighborhood = neighborhood;
        if (isActive !== undefined)
            where.isActive = isActive === 'true';
        if (isPartner !== undefined)
            where.isPartner = isPartner === 'true';
        if (fieldType) {
            where.fields = {
                some: {
                    type: fieldType
                }
            };
        }
        const stadiums = await database_1.prisma.stadium.findMany({
            where,
            include: {
                fields: {
                    where: {
                        isActive: true
                    },
                    orderBy: {
                        number: 'asc'
                    }
                },
                _count: {
                    select: {
                        fields: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        return (0, apiResponse_1.success)(res, "Stades récupérés avec succès", stadiums);
    }
    catch (error) {
        console.error("Erreur lors de la récupération des stades:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des stades");
    }
};
exports.getStadiums = getStadiums;
const getStadium = async (req, res) => {
    try {
        const { id } = req.params;
        const stadium = await database_1.prisma.stadium.findUnique({
            where: { id: parseInt(id) },
            include: {
                fields: {
                    where: {
                        isActive: true
                    },
                    orderBy: {
                        number: 'asc'
                    },
                    include: {
                        _count: {
                            select: {
                                reservations: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        fields: true
                    }
                }
            }
        });
        if (!stadium) {
            return (0, apiResponse_1.notFound)(res, "Stade non trouvé");
        }
        return (0, apiResponse_1.success)(res, "Stade récupéré avec succès", stadium);
    }
    catch (error) {
        console.error("Erreur lors de la récupération du stade:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération du stade");
    }
};
exports.getStadium = getStadium;
const getStadiumAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, fieldId } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        const where = {
            field: {
                stadiumId: parseInt(id)
            },
            startTime: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: {
                in: ['pending', 'confirmed']
            }
        };
        if (fieldId) {
            where.fieldId = parseInt(fieldId);
        }
        const reservations = await database_1.prisma.reservation.findMany({
            where,
            include: {
                field: true,
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });
        const fields = await database_1.prisma.field.findMany({
            where: {
                stadiumId: parseInt(id),
                isActive: true
            },
            orderBy: {
                number: 'asc'
            }
        });
        const availability = fields.map(field => {
            const fieldReservations = reservations.filter(r => r.fieldId === field.id);
            const timeSlots = [];
            for (let hour = 8; hour < 22; hour++) {
                const slotStart = new Date(targetDate);
                slotStart.setHours(hour, 0, 0, 0);
                const slotEnd = new Date(targetDate);
                slotEnd.setHours(hour + 1, 0, 0, 0);
                const conflictingReservation = fieldReservations.find(r => r.startTime < slotEnd && r.endTime > slotStart);
                timeSlots.push({
                    hour,
                    startTime: slotStart.toISOString(),
                    endTime: slotEnd.toISOString(),
                    isAvailable: !conflictingReservation,
                    reservation: conflictingReservation ? {
                        id: conflictingReservation.id,
                        title: conflictingReservation.title,
                        user: conflictingReservation.user,
                        team: conflictingReservation.team,
                        status: conflictingReservation.status
                    } : null
                });
            }
            return {
                field,
                timeSlots,
                reservations: fieldReservations
            };
        });
        return (0, apiResponse_1.success)(res, "Disponibilité récupérée avec succès", {
            date: targetDate.toISOString(),
            availability
        });
    }
    catch (error) {
        console.error("Erreur lors de la récupération de la disponibilité:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération de la disponibilité");
    }
};
exports.getStadiumAvailability = getStadiumAvailability;
const getFields = async (req, res) => {
    try {
        const { stadiumId, type, size, isActive } = req.query;
        const where = {};
        if (stadiumId)
            where.stadiumId = parseInt(stadiumId);
        if (type)
            where.type = type;
        if (size)
            where.size = size;
        if (isActive !== undefined)
            where.isActive = isActive === 'true';
        const fields = await database_1.prisma.field.findMany({
            where,
            include: {
                stadium: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        neighborhood: true
                    }
                },
                _count: {
                    select: {
                        reservations: true
                    }
                }
            },
            orderBy: [
                { stadium: { name: 'asc' } },
                { number: 'asc' }
            ]
        });
        return (0, apiResponse_1.success)(res, "Terrains récupérés avec succès", fields);
    }
    catch (error) {
        console.error("Erreur lors de la récupération des terrains:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des terrains");
    }
};
exports.getFields = getFields;
const getField = async (req, res) => {
    try {
        const { id } = req.params;
        const field = await database_1.prisma.field.findUnique({
            where: { id: parseInt(id) },
            include: {
                stadium: true,
                reservations: {
                    where: {
                        status: {
                            in: ['pending', 'confirmed']
                        }
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        team: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        startTime: 'asc'
                    }
                }
            }
        });
        if (!field) {
            return (0, apiResponse_1.notFound)(res, "Terrain non trouvé");
        }
        return (0, apiResponse_1.success)(res, "Terrain récupéré avec succès", field);
    }
    catch (error) {
        console.error("Erreur lors de la récupération du terrain:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération du terrain");
    }
};
exports.getField = getField;
const createStadium = async (req, res) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return (0, apiResponse_1.unauthorized)(res, "Seuls les administrateurs peuvent créer des stades");
        }
        const { name, address, city, region, neighborhood, capacity, fieldCount, fieldTypes, amenities, images, contactInfo, pricing, description, isPartner, openingHours, specialDates } = req.body;
        const stadium = await database_1.prisma.stadium.create({
            data: {
                name,
                address,
                city,
                region,
                neighborhood,
                capacity,
                fieldCount,
                fieldTypes,
                amenities,
                images,
                contactInfo,
                pricing,
                description,
                isPartner,
                openingHours,
                specialDates,
                ownerId: req.user.userId
            }
        });
        return (0, apiResponse_1.created)(res, "Stade créé avec succès", stadium);
    }
    catch (error) {
        console.error("Erreur lors de la création du stade:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la création du stade");
    }
};
exports.createStadium = createStadium;
const createField = async (req, res) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return (0, apiResponse_1.unauthorized)(res, "Seuls les administrateurs peuvent créer des terrains");
        }
        const { name, number, type, size, stadiumId } = req.body;
        const stadium = await database_1.prisma.stadium.findUnique({
            where: { id: stadiumId }
        });
        if (!stadium) {
            return (0, apiResponse_1.notFound)(res, "Stade non trouvé");
        }
        const field = await database_1.prisma.field.create({
            data: {
                name,
                number,
                type,
                size,
                stadiumId
            },
            include: {
                stadium: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return (0, apiResponse_1.created)(res, "Terrain créé avec succès", field);
    }
    catch (error) {
        console.error("Erreur lors de la création du terrain:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la création du terrain");
    }
};
exports.createField = createField;
router.get("/", exports.getStadiums);
router.get("/:id", exports.getStadium);
router.get("/:id/availability", exports.getStadiumAvailability);
router.post("/", auth_middleware_1.authenticateToken, exports.createStadium);
router.get("/fields", exports.getFields);
router.get("/fields/:id", exports.getField);
router.post("/fields", auth_middleware_1.authenticateToken, exports.createField);
exports.default = router;
//# sourceMappingURL=stadium.routes.js.map