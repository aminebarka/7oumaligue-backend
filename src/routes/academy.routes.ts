import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware';
import { success, created, badRequest, unauthorized, notFound } from '../utils/apiResponse';

const router = express.Router();
const prisma = new PrismaClient();

// ===== ROUTES DES ACADÉMIES =====

// GET /api/academies - Récupérer toutes les académies
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

    return success(res, 'Académies récupérées avec succès', academies);
  } catch (error) {
    console.error('Erreur lors de la récupération des académies:', error);
    return badRequest(res, 'Erreur lors de la récupération des académies');
  }
});

// GET /api/academies/:id - Récupérer une académie spécifique
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
      return notFound(res, 'Académie non trouvée');
    }

    return success(res, 'Académie récupérée avec succès', academy);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'académie:', error);
    return badRequest(res, 'Erreur lors de la récupération de l\'académie');
  }
});

// POST /api/academies - Créer une nouvelle académie
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
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
      values
    } = req.body;

    if (!name || !address || !city || !region) {
      return badRequest(res, 'Les champs nom, adresse, ville et région sont obligatoires');
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
        ownerId: userId!
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return created(res, 'Académie créée avec succès', academy);
  } catch (error) {
    console.error('Erreur lors de la création de l\'académie:', error);
    return badRequest(res, 'Erreur lors de la création de l\'académie');
  }
});

// PUT /api/academies/:id - Mettre à jour une académie
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const updateData = req.body;

    // Vérifier que l'utilisateur est propriétaire de l'académie
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(id) }
    });

    if (!academy) {
      return notFound(res, 'Académie non trouvée');
    }

    if (academy.ownerId !== userId) {
      return unauthorized(res, 'Vous n\'êtes pas autorisé à modifier cette académie');
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

    return success(res, 'Académie mise à jour avec succès', updatedAcademy);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'académie:', error);
    return badRequest(res, 'Erreur lors de la mise à jour de l\'académie');
  }
});

// DELETE /api/academies/:id - Supprimer une académie
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(id) }
    });

    if (!academy) {
      return notFound(res, 'Académie non trouvée');
    }

    if (academy.ownerId !== userId) {
      return unauthorized(res, 'Vous n\'êtes pas autorisé à supprimer cette académie');
    }

    await prisma.academy.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    return success(res, 'Académie supprimée avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'académie:', error);
    return badRequest(res, 'Erreur lors de la suppression de l\'académie');
  }
});

// ===== ROUTES DES ÉQUIPES =====

// GET /api/academies/:academyId/teams - Récupérer les équipes d'une académie
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

    return success(res, 'Équipes récupérées avec succès', teams);
  } catch (error) {
    console.error('Erreur lors de la récupération des équipes:', error);
    return badRequest(res, 'Erreur lors de la récupération des équipes');
  }
});

// POST /api/academies/:academyId/teams - Créer une nouvelle équipe
router.post('/:academyId/teams', authenticateToken, async (req, res) => {
  try {
    const { academyId } = req.params;
    const userId = req.user?.userId;
    const { name, category, color, coachId } = req.body;

    if (!name || !category) {
      return badRequest(res, 'Les champs nom et catégorie sont obligatoires');
    }

    // Vérifier que l'utilisateur est propriétaire de l'académie
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(academyId) }
    });

    if (!academy || academy.ownerId !== userId) {
      return unauthorized(res, 'Vous n\'êtes pas autorisé à créer une équipe dans cette académie');
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

    return created(res, 'Équipe créée avec succès', team);
  } catch (error) {
    console.error('Erreur lors de la création de l\'équipe:', error);
    return badRequest(res, 'Erreur lors de la création de l\'équipe');
  }
});

// ===== ROUTES DES JOUEURS =====

// GET /api/academies/:academyId/players - Récupérer les joueurs d'une académie
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

    return success(res, 'Joueurs récupérés avec succès', players);
  } catch (error) {
    console.error('Erreur lors de la récupération des joueurs:', error);
    return badRequest(res, 'Erreur lors de la récupération des joueurs');
  }
});

// POST /api/academies/:academyId/players - Créer un nouveau joueur
router.post('/:academyId/players', authenticateToken, async (req, res) => {
  try {
    const { academyId } = req.params;
    const userId = req.user?.userId;
    const {
      firstName,
      lastName,
      birthDate,
      position,
      jerseyNumber,
      parentPhone,
      parentEmail,
      medicalInfo,
      teamId
    } = req.body;

    if (!firstName || !lastName || !birthDate || !position) {
      return badRequest(res, 'Les champs prénom, nom, date de naissance et position sont obligatoires');
    }

    // Vérifier que l'utilisateur est propriétaire de l'académie
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(academyId) }
    });

    if (!academy || academy.ownerId !== userId) {
      return unauthorized(res, 'Vous n\'êtes pas autorisé à créer un joueur dans cette académie');
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

    return created(res, 'Joueur créé avec succès', player);
  } catch (error) {
    console.error('Erreur lors de la création du joueur:', error);
    return badRequest(res, 'Erreur lors de la création du joueur');
  }
});

// ===== ROUTES DES ÉVÉNEMENTS =====

// GET /api/academies/:academyId/events - Récupérer les événements d'une académie
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

    return success(res, 'Événements récupérés avec succès', events);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return badRequest(res, 'Erreur lors de la récupération des événements');
  }
});

// POST /api/academies/:academyId/events - Créer un nouvel événement
router.post('/:academyId/events', authenticateToken, async (req, res) => {
  try {
    const { academyId } = req.params;
    const userId = req.user?.userId;
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      location,
      isPublic,
      maxParticipants,
      registrationDeadline
    } = req.body;

    if (!title || !type || !startDate || !endDate) {
      return badRequest(res, 'Les champs titre, type, date de début et date de fin sont obligatoires');
    }

    // Vérifier que l'utilisateur est propriétaire de l'académie
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(academyId) }
    });

    if (!academy || academy.ownerId !== userId) {
      return unauthorized(res, 'Vous n\'êtes pas autorisé à créer un événement dans cette académie');
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

    return created(res, 'Événement créé avec succès', event);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return badRequest(res, 'Erreur lors de la création de l\'événement');
  }
});

// ===== ROUTES DES ANNONCES =====

// GET /api/academies/:academyId/announcements - Récupérer les annonces d'une académie
router.get('/:academyId/announcements', async (req, res) => {
  try {
    const { academyId } = req.params;
    const announcements = await prisma.academyAnnouncement.findMany({
      where: { academyId: parseInt(academyId) },
      orderBy: { createdAt: 'desc' }
    });

    return success(res, 'Annonces récupérées avec succès', announcements);
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    return badRequest(res, 'Erreur lors de la récupération des annonces');
  }
});

// POST /api/academies/:academyId/announcements - Créer une nouvelle annonce
router.post('/:academyId/announcements', authenticateToken, async (req, res) => {
  try {
    const { academyId } = req.params;
    const userId = req.user?.userId;
    const { title, content, type, isPublic } = req.body;

    if (!title || !content || !type) {
      return badRequest(res, 'Les champs titre, contenu et type sont obligatoires');
    }

    // Vérifier que l'utilisateur est propriétaire de l'académie
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(academyId) }
    });

    if (!academy || academy.ownerId !== userId) {
      return unauthorized(res, 'Vous n\'êtes pas autorisé à créer une annonce dans cette académie');
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

    return created(res, 'Annonce créée avec succès', announcement);
  } catch (error) {
    console.error('Erreur lors de la création de l\'annonce:', error);
    return badRequest(res, 'Erreur lors de la création de l\'annonce');
  }
});

// ===== ROUTES DES PAIEMENTS =====

// GET /api/academies/:academyId/payments - Récupérer les paiements d'une académie
router.get('/:academyId/payments', authenticateToken, async (req, res) => {
  try {
    const { academyId } = req.params;
    const userId = req.user?.userId;

    // Vérifier que l'utilisateur est propriétaire de l'académie
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(academyId) }
    });

    if (!academy || academy.ownerId !== userId) {
      return unauthorized(res, 'Vous n\'êtes pas autorisé à voir les paiements de cette académie');
    }

    const payments = await prisma.academyPayment.findMany({
      where: { academyId: parseInt(academyId) },
      include: {
        player: true,
        team: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return success(res, 'Paiements récupérés avec succès', payments);
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    return badRequest(res, 'Erreur lors de la récupération des paiements');
  }
});

// POST /api/academies/:academyId/payments - Créer un nouveau paiement
router.post('/:academyId/payments', authenticateToken, async (req, res) => {
  try {
    const { academyId } = req.params;
    const userId = req.user?.userId;
    const {
      playerId,
      teamId,
      type,
      amount,
      description,
      dueDate,
      method
    } = req.body;

    if (!type || !amount) {
      return badRequest(res, 'Les champs type et montant sont obligatoires');
    }

    // Vérifier que l'utilisateur est propriétaire de l'académie
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(academyId) }
    });

    if (!academy || academy.ownerId !== userId) {
      return unauthorized(res, 'Vous n\'êtes pas autorisé à créer un paiement dans cette académie');
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

    return created(res, 'Paiement créé avec succès', payment);
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    return badRequest(res, 'Erreur lors de la création du paiement');
  }
});

export default router;
