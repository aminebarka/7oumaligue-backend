import type { Request, Response } from "express";
import { prisma } from "../config/database";
import { success, created, badRequest, unauthorized, notFound } from "../utils/apiResponse";
import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

// GET /stadiums - Récupérer tous les stades avec filtres
export const getStadiums = async (req: Request, res: Response) => {
  try {
    const {
      city,
      region,
      neighborhood,
      fieldType,
      isActive,
      isPartner
    } = req.query;

    const where: any = {};

    if (city) where.city = city as string;
    if (region) where.region = region as string;
    if (neighborhood) where.neighborhood = neighborhood as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (isPartner !== undefined) where.isPartner = isPartner === 'true';

    // Filtre par type de terrain
    if (fieldType) {
      where.fields = {
        some: {
          type: fieldType as string
        }
      };
    }

    const stadiums = await prisma.stadium.findMany({
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
            fields: true,
            reservations: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return success(res, stadiums, "Stades récupérés avec succès");
  } catch (error) {
    console.error("Erreur lors de la récupération des stades:", error);
    return badRequest(res, "Erreur lors de la récupération des stades");
  }
};

// GET /stadiums/:id - Récupérer un stade spécifique
export const getStadium = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stadium = await prisma.stadium.findUnique({
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
            fields: true,
            reservations: true
          }
        }
      }
    });

    if (!stadium) {
      return notFound(res, "Stade non trouvé");
    }

    return success(res, stadium, "Stade récupéré avec succès");
  } catch (error) {
    console.error("Erreur lors de la récupération du stade:", error);
    return badRequest(res, "Erreur lors de la récupération du stade");
  }
};

// GET /stadiums/:id/availability - Vérifier la disponibilité d'un stade
export const getStadiumAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, fieldId } = req.query;

    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
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
      where.fieldId = parseInt(fieldId as string);
    }

    const reservations = await prisma.reservation.findMany({
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

    // Récupérer tous les terrains du stade
    const fields = await prisma.field.findMany({
      where: {
        stadiumId: parseInt(id),
        isActive: true
      },
      orderBy: {
        number: 'asc'
      }
    });

    // Créer un planning par terrain
    const availability = fields.map(field => {
      const fieldReservations = reservations.filter(r => r.fieldId === field.id);
      
      // Créer des créneaux horaires (par exemple, de 8h à 22h)
      const timeSlots = [];
      for (let hour = 8; hour < 22; hour++) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(targetDate);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        const conflictingReservation = fieldReservations.find(r => 
          r.startTime < slotEnd && r.endTime > slotStart
        );

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

    return success(res, {
      date: targetDate.toISOString(),
      availability
    }, "Disponibilité récupérée avec succès");
  } catch (error) {
    console.error("Erreur lors de la récupération de la disponibilité:", error);
    return badRequest(res, "Erreur lors de la récupération de la disponibilité");
  }
};

// GET /fields - Récupérer tous les terrains avec filtres
export const getFields = async (req: Request, res: Response) => {
  try {
    const {
      stadiumId,
      type,
      size,
      isActive
    } = req.query;

    const where: any = {};

    if (stadiumId) where.stadiumId = parseInt(stadiumId as string);
    if (type) where.type = type as string;
    if (size) where.size = size as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const fields = await prisma.field.findMany({
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

    return success(res, fields, "Terrains récupérés avec succès");
  } catch (error) {
    console.error("Erreur lors de la récupération des terrains:", error);
    return badRequest(res, "Erreur lors de la récupération des terrains");
  }
};

// GET /fields/:id - Récupérer un terrain spécifique
export const getField = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const field = await prisma.field.findUnique({
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
      return notFound(res, "Terrain non trouvé");
    }

    return success(res, field, "Terrain récupéré avec succès");
  } catch (error) {
    console.error("Erreur lors de la récupération du terrain:", error);
    return badRequest(res, "Erreur lors de la récupération du terrain");
  }
};

// POST /stadiums - Créer un nouveau stade (admin seulement)
export const createStadium = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return unauthorized(res, "Seuls les administrateurs peuvent créer des stades");
    }

    const {
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
      specialDates
    } = req.body;

    const stadium = await prisma.stadium.create({
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
        ownerId: req.user!.userId
      }
    });

    return created(res, stadium, "Stade créé avec succès");
  } catch (error) {
    console.error("Erreur lors de la création du stade:", error);
    return badRequest(res, "Erreur lors de la création du stade");
  }
};

// POST /fields - Créer un nouveau terrain (admin seulement)
export const createField = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return unauthorized(res, "Seuls les administrateurs peuvent créer des terrains");
    }

    const {
      name,
      number,
      type,
      size,
      stadiumId
    } = req.body;

    // Vérifier que le stade existe
    const stadium = await prisma.stadium.findUnique({
      where: { id: stadiumId }
    });

    if (!stadium) {
      return notFound(res, "Stade non trouvé");
    }

    const field = await prisma.field.create({
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

    return created(res, field, "Terrain créé avec succès");
  } catch (error) {
    console.error("Erreur lors de la création du terrain:", error);
    return badRequest(res, "Erreur lors de la création du terrain");
  }
};

// Routes
router.get("/", getStadiums);
router.get("/:id", getStadium);
router.get("/:id/availability", getStadiumAvailability);
router.post("/", authenticateToken, createStadium);

// Routes pour les terrains
router.get("/fields", getFields);
router.get("/fields/:id", getField);
router.post("/fields", authenticateToken, createField);

export default router; 