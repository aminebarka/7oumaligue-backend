import type { Request, Response } from "express";
import { prisma } from "../config/database";
import { success, created, badRequest, unauthorized, notFound } from "../utils/apiResponse";
import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

// GET /reservations - Récupérer toutes les réservations avec filtres
export const getReservations = async (req: Request, res: Response) => {
  try {
    const {
      stadiumId,
      fieldType,
      neighborhood,
      dateFrom,
      dateTo,
      status,
      purpose,
      userId,
      teamId
    } = req.query;

    const where: any = {};

    // Filtres par stade
    if (stadiumId) {
      where.field = {
        stadiumId: parseInt(stadiumId as string)
      };
    }

    // Filtres par type de terrain
    if (fieldType) {
      where.field = {
        ...where.field,
        type: fieldType
      };
    }

    // Filtres par quartier
    if (neighborhood) {
      where.field = {
        ...where.field,
        stadium: {
          neighborhood: neighborhood as string
        }
      };
    }

    // Filtres par date
    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) where.startTime.gte = new Date(dateFrom as string);
      if (dateTo) where.startTime.lte = new Date(dateTo as string);
    }

    // Filtres par statut
    if (status) {
      where.status = status;
    }

    // Filtres par but
    if (purpose) {
      where.purpose = purpose;
    }

    // Filtres par utilisateur
    if (userId) {
      where.userId = parseInt(userId as string);
    }

    // Filtres par équipe
    if (teamId) {
      where.teamId = teamId;
    }

    const reservations = await prisma.reservation.findMany({
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

    return success(res, "Réservations récupérées avec succès", reservations);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    return badRequest(res, "Erreur lors de la récupération des réservations");
  }
};

// GET /reservations/calendar - Récupérer les réservations pour le calendrier
export const getCalendarReservations = async (req: Request, res: Response) => {
  try {
    const { view, date, stadiumId } = req.query;
    
    let startDate: Date;
    let endDate: Date;
    
    const baseDate = date ? new Date(date as string) : new Date();
    
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

    const where: any = {
      startTime: {
        gte: startDate,
        lte: endDate
      }
    };

    if (stadiumId) {
      where.field = {
        stadiumId: parseInt(stadiumId as string)
      };
    }

    const reservations = await prisma.reservation.findMany({
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

    return success(res, "Données du calendrier récupérées avec succès", {
      reservations,
      view,
      date: baseDate.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du calendrier:", error);
    return badRequest(res, "Erreur lors de la récupération du calendrier");
  }
};

// POST /reservations - Créer une nouvelle réservation
export const createReservation = async (req: Request, res: Response) => {
  try {
    const {
      fieldId,
      title,
      description,
      startTime,
      endTime,
      purpose,
      teamId
    } = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      return unauthorized(res, "Utilisateur non authentifié");
    }

    // Vérifier que le terrain existe et est actif
    const field = await prisma.field.findFirst({
      where: {
        id: fieldId,
        isActive: true
      },
      include: {
        stadium: true
      }
    });

    if (!field) {
      return notFound(res, "Terrain non trouvé ou inactif");
    }

    // Vérifier les conflits de réservation
    const conflictingReservation = await prisma.reservation.findFirst({
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
      return badRequest(res, "Ce créneau est déjà réservé");
    }

    // Calculer le prix
    const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60); // heures
    const pricing = field.stadium.pricing as any;
    const hourlyRate = pricing?.hourly || 50;
    const price = duration * hourlyRate;

    // Créer la réservation
    const reservation = await prisma.reservation.create({
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

    // Créer une notification
    await prisma.reservationNotification.create({
      data: {
        reservationId: reservation.id,
        type: 'confirmation',
        message: `Réservation créée pour ${field.name} le ${new Date(startTime).toLocaleDateString('fr-FR')}`
      }
    });

    return created(res, "Réservation créée avec succès", reservation);
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    return badRequest(res, "Erreur lors de la création de la réservation");
  }
};

// PATCH /reservations/:id - Mettre à jour une réservation
export const updateReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startTime,
      endTime,
      purpose,
      status,
      notes
    } = req.body;

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return unauthorized(res, "Utilisateur non authentifié");
    }

    // Vérifier que la réservation existe
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: {
        field: true,
        user: true
      }
    });

    if (!existingReservation) {
      return notFound(res, "Réservation non trouvée");
    }

    // Vérifier les permissions (seul le propriétaire ou un admin peut modifier)
    if (existingReservation.userId !== userId && userRole !== 'admin') {
      return unauthorized(res, "Vous n'êtes pas autorisé à modifier cette réservation");
    }

    // Si on change l'heure, vérifier les conflits
    if (startTime || endTime) {
      const newStartTime = startTime ? new Date(startTime) : existingReservation.startTime;
      const newEndTime = endTime ? new Date(endTime) : existingReservation.endTime;

      const conflictingReservation = await prisma.reservation.findFirst({
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
        return badRequest(res, "Ce créneau est déjà réservé");
      }
    }

    // Mettre à jour la réservation
    const updatedReservation = await prisma.reservation.update({
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

    // Créer une notification de changement
    if (status && status !== existingReservation.status) {
      await prisma.reservationNotification.create({
        data: {
          reservationId: parseInt(id),
          type: 'change',
          message: `Statut de la réservation changé de ${existingReservation.status} à ${status}`
        }
      });
    }

    return success(res, "Réservation mise à jour avec succès", updatedReservation);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réservation:", error);
    return badRequest(res, "Erreur lors de la mise à jour de la réservation");
  }
};

// DELETE /reservations/:id - Supprimer une réservation
export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return unauthorized(res, "Utilisateur non authentifié");
    }

    // Vérifier que la réservation existe
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true
      }
    });

    if (!reservation) {
      return notFound(res, "Réservation non trouvée");
    }

    // Vérifier les permissions
    if (reservation.userId !== userId && userRole !== 'admin') {
      return unauthorized(res, "Vous n'êtes pas autorisé à supprimer cette réservation");
    }

    // Supprimer la réservation
    await prisma.reservation.delete({
      where: { id: parseInt(id) }
    });

    // Créer une notification d'annulation
    await prisma.reservationNotification.create({
      data: {
        reservationId: parseInt(id),
        type: 'cancellation',
        message: "Réservation annulée"
      }
    });

    return success(res, "Réservation supprimée avec succès", null);
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation:", error);
    return badRequest(res, "Erreur lors de la suppression de la réservation");
  }
};

// GET /reservations/statistics - Statistiques des réservations
export const getReservationStatistics = async (req: Request, res: Response) => {
  try {
    const { fieldId, stadiumId, dateFrom, dateTo } = req.query;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return unauthorized(res, "Utilisateur non authentifié");
    }

    const where: any = {};

    if (fieldId) {
      where.fieldId = parseInt(fieldId as string);
    }

    if (stadiumId) {
      where.field = {
        stadiumId: parseInt(stadiumId as string)
      };
    }

    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) where.startTime.gte = new Date(dateFrom as string);
      if (dateTo) where.startTime.lte = new Date(dateTo as string);
    }

    // Si l'utilisateur n'est pas admin, filtrer par ses réservations
    if (userRole !== 'admin') {
      where.userId = userId;
    }

    const [
      totalReservations,
      confirmedReservations,
      pendingReservations,
      cancelledReservations,
      totalRevenue,
      averageDuration
    ] = await Promise.all([
      prisma.reservation.count({ where }),
      prisma.reservation.count({ where: { ...where, status: 'confirmed' } }),
      prisma.reservation.count({ where: { ...where, status: 'pending' } }),
      prisma.reservation.count({ where: { ...where, status: 'cancelled' } }),
      prisma.reservation.aggregate({
        where: { ...where, status: 'confirmed' },
        _sum: { price: true }
      }),
      prisma.reservation.aggregate({
        where: { ...where, status: 'confirmed' },
        _avg: {
          // Calculer la durée moyenne en heures
        }
      })
    ]);

    const statistics = {
      total: totalReservations,
      confirmed: confirmedReservations,
      pending: pendingReservations,
      cancelled: cancelledReservations,
      revenue: totalRevenue._sum.price || 0,
      averageDuration: 0, // TODO: Implémenter le calcul de durée moyenne
      occupancyRate: totalReservations > 0 ? (confirmedReservations / totalReservations) * 100 : 0
    };

    return success(res, "Statistiques récupérées avec succès", statistics);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return badRequest(res, "Erreur lors de la récupération des statistiques");
  }
};

// Routes
router.get("/", authenticateToken, getReservations);
router.get("/calendar", authenticateToken, getCalendarReservations);
router.post("/", authenticateToken, createReservation);
router.patch("/:id", authenticateToken, updateReservation);
router.delete("/:id", authenticateToken, deleteReservation);
router.get("/statistics", authenticateToken, getReservationStatistics);

export default router;
