import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  createStadium,
  getStadiums,
  getStadiumById,
  updateStadium,
  deleteStadium,
  getStadiumsByCity,
  getFavoriteStadiums
} from '../controllers/stadium.controller';

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

// Routes pour les stades
router.post('/', createStadium);
router.get('/', getStadiums);
router.get('/favorites', getFavoriteStadiums);
router.get('/city/:city', getStadiumsByCity);
router.get('/:id', getStadiumById);
router.put('/:id', updateStadium);
router.delete('/:id', deleteStadium);

export default router; 