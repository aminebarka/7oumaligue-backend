"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavoriteStadiums = exports.getStadiumsByCity = exports.deleteStadium = exports.updateStadium = exports.getStadiumById = exports.getStadiums = exports.createStadium = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const createStadium = async (req, res) => {
    const { name, address, city, region, capacity, fieldCount, fieldTypes, amenities, description, images, contactInfo, pricing, isPartner } = req.body;
    try {
        if (!name || !city || !capacity) {
            return (0, apiResponse_1.badRequest)(res, "Nom, ville et capacité sont requis");
        }
        const stadium = await database_1.prisma.stadium.create({
            data: {
                name,
                address: address || '',
                city,
                region: region || city,
                capacity: parseInt(capacity),
                fieldCount: fieldCount || 1,
                fieldTypes: fieldTypes || ['11v11'],
                amenities: amenities || [],
                images: images || [],
                contactInfo: contactInfo || {},
                pricing: pricing || {},
                description: description || '',
                isPartner: isPartner || false,
                ownerId: req.user?.userId || 1,
            },
        });
        return (0, apiResponse_1.created)(res, stadium, "Stade créé avec succès");
    }
    catch (error) {
        console.error("Erreur création stade:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la création du stade");
    }
};
exports.createStadium = createStadium;
const getStadiums = async (req, res) => {
    try {
        const stadiums = await database_1.prisma.stadium.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return (0, apiResponse_1.success)(res, stadiums);
    }
    catch (error) {
        console.error("Erreur récupération stades:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des stades");
    }
};
exports.getStadiums = getStadiums;
const getStadiumById = async (req, res) => {
    const { id } = req.params;
    try {
        const stadium = await database_1.prisma.stadium.findUnique({
            where: {
                id: parseInt(id)
            },
        });
        if (!stadium) {
            return (0, apiResponse_1.notFound)(res, "Stade non trouvé");
        }
        return (0, apiResponse_1.success)(res, stadium);
    }
    catch (error) {
        console.error("Erreur récupération stade:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération du stade");
    }
};
exports.getStadiumById = getStadiumById;
const updateStadium = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const existingStadium = await database_1.prisma.stadium.findUnique({
            where: {
                id: parseInt(id)
            },
        });
        if (!existingStadium) {
            return (0, apiResponse_1.notFound)(res, "Stade non trouvé");
        }
        if (updateData.capacity) {
            updateData.capacity = parseInt(updateData.capacity);
        }
        const stadium = await database_1.prisma.stadium.update({
            where: {
                id: parseInt(id),
            },
            data: updateData,
        });
        return (0, apiResponse_1.success)(res, stadium, "Stade mis à jour avec succès");
    }
    catch (error) {
        console.error("Erreur mise à jour stade:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour du stade");
    }
};
exports.updateStadium = updateStadium;
const deleteStadium = async (req, res) => {
    const { id } = req.params;
    try {
        const existingStadium = await database_1.prisma.stadium.findUnique({
            where: {
                id: parseInt(id)
            },
        });
        if (!existingStadium) {
            return (0, apiResponse_1.notFound)(res, "Stade non trouvé");
        }
        await database_1.prisma.stadium.delete({
            where: {
                id: parseInt(id),
            },
        });
        return (0, apiResponse_1.success)(res, null, "Stade supprimé avec succès");
    }
    catch (error) {
        console.error("Erreur suppression stade:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la suppression du stade");
    }
};
exports.deleteStadium = deleteStadium;
const getStadiumsByCity = async (req, res) => {
    const { city } = req.params;
    try {
        const stadiums = await database_1.prisma.stadium.findMany({
            where: {
                city: {
                    contains: city,
                    mode: 'insensitive'
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        return (0, apiResponse_1.success)(res, stadiums);
    }
    catch (error) {
        console.error("Erreur récupération stades par ville:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des stades");
    }
};
exports.getStadiumsByCity = getStadiumsByCity;
const getFavoriteStadiums = async (req, res) => {
    try {
        const stadiums = await database_1.prisma.stadium.findMany({
            where: {
                isPartner: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        return (0, apiResponse_1.success)(res, stadiums);
    }
    catch (error) {
        console.error("Erreur récupération stades favoris:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des stades favoris");
    }
};
exports.getFavoriteStadiums = getFavoriteStadiums;
//# sourceMappingURL=stadium.controller.js.map