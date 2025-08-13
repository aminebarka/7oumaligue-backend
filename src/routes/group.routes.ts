import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware';
import { success, created, badRequest, notFound } from '../utils/apiResponse';

const router = express.Router();
const prisma = new PrismaClient();

// Route de test pour vérifier que les routes fonctionnent
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Routes de groupes fonctionnelles' });
});

// Route de test pour vérifier les paramètres
router.get('/test/:id', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Route avec paramètre fonctionnelle',
    id: req.params.id 
  });
});

// GET /groups - Récupérer tous les groupes d'un tournoi
router.get('/tournament/:tournamentId', authenticateToken, async (req, res) => {
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
  } catch (error) {
    console.error('Erreur lors de la récupération des groupes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des groupes'
    });
  }
});

// POST /groups - Créer un nouveau groupe
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, tournamentId } = req.body;
    
    if (!name || !tournamentId) {
      return badRequest(res, 'Nom et ID du tournoi requis');
    }
    
    // Vérifier que le tournoi existe
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    });
    
    if (!tournament) {
      return notFound(res, 'Tournoi non trouvé');
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
    
    return created(res, 'Groupe créé avec succès', group);
  } catch (error) {
    console.error('Erreur lors de la création du groupe:', error);
    return badRequest(res, 'Erreur lors de la création du groupe');
  }
});

// PATCH /groups/:id - Modifier un groupe
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return badRequest(res, 'Nom du groupe requis');
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
    
    return success(res, 'Groupe modifié avec succès', group);
  } catch (error) {
    console.error('Erreur lors de la modification du groupe:', error);
    return badRequest(res, 'Erreur lors de la modification du groupe');
  }
});

// DELETE /groups/:id - Supprimer un groupe
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Supprimer d'abord les équipes du groupe
    await prisma.groupTeam.deleteMany({
      where: { groupId: id }
    });
    
    // Supprimer les matchs du groupe
    await prisma.match.deleteMany({
      where: { groupId: id }
    });
    
    // Supprimer le groupe
    await prisma.group.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Groupe supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du groupe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du groupe'
    });
  }
});

// POST /groups/:id/teams - Ajouter une équipe à un groupe
router.post('/:id/teams', authenticateToken, async (req, res) => {
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
    
    // Vérifier que le groupe existe
    const group = await prisma.group.findUnique({
      where: { id }
    });
    
    if (!group) {
      console.log('❌ Groupe non trouvé:', id);
      return notFound(res, 'Groupe non trouvé');
    }
    
    // Vérifier que l'équipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });
    
    if (!team) {
      console.log('❌ Équipe non trouvée:', teamId);
      return notFound(res, 'Équipe non trouvée');
    }
    
    // Vérifier que l'équipe n'est pas déjà dans un groupe du même tournoi
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
      return badRequest(res, 'Cette équipe est déjà dans un groupe de ce tournoi');
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
    
    return created(res, 'Équipe ajoutée au groupe avec succès', groupTeam);
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de l\'équipe au groupe:', error);
    return badRequest(res, 'Erreur lors de l\'ajout de l\'équipe au groupe');
  }
});

// DELETE /groups/:id/teams/:teamId - Retirer une équipe d'un groupe
router.delete('/:id/teams/:teamId', authenticateToken, async (req, res) => {
  try {
    const { id, teamId } = req.params;
    
    console.log('🔍 Tentative de retrait d\'équipe du groupe:', { groupId: id, teamId });
    
    // Vérifier que le groupe existe
    const group = await prisma.group.findUnique({
      where: { id }
    });
    
    if (!group) {
      console.log('❌ Groupe non trouvé:', id);
      return notFound(res, 'Groupe non trouvé');
    }
    
    // Vérifier que l'équipe existe dans ce groupe
    const existingGroupTeam = await prisma.groupTeam.findFirst({
      where: {
        groupId: id,
        teamId
      }
    });
    
    if (!existingGroupTeam) {
      console.log('❌ Équipe non trouvée dans ce groupe:', { groupId: id, teamId });
      return notFound(res, 'Équipe non trouvée dans ce groupe');
    }
    
    console.log('✅ Suppression des matchs de l\'équipe dans ce groupe');
    
    // Supprimer les matchs de cette équipe dans ce groupe
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
    
    // Retirer l'équipe du groupe
    await prisma.groupTeam.deleteMany({
      where: {
        groupId: id,
        teamId
      }
    });
    
    console.log('✅ Équipe retirée avec succès');
    
    return success(res, 'Équipe retirée du groupe avec succès', { message: 'Équipe retirée du groupe avec succès' });
  } catch (error) {
    console.error('❌ Erreur lors du retrait de l\'équipe du groupe:', error);
    return badRequest(res, 'Erreur lors du retrait de l\'équipe du groupe');
  }
});

export default router; 