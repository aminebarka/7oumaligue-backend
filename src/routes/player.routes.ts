import express from "express"
import {
  createPlayer,
  getPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
  getPlayersByTeam,
} from "../controllers/player.controller"
import { authenticateToken, requireAdminOrCoach } from "../middleware/auth.middleware"
import { body, param, validationResult } from "express-validator"
import { badRequest } from "../utils/apiResponse"

const router = express.Router()

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return badRequest(
      res,
      errors
        .array()
        .map((err) => err.msg)
        .join(", "),
    )
  }
  return next()
}

// Player validation
const playerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le nom du joueur doit contenir entre 2 et 50 caractères"),
  body("position").isIn(["Gardien", "Défenseur", "Milieu", "Attaquant"]).withMessage("Position invalide"),
  body("level").isInt({ min: 1, max: 5 }).withMessage("Le niveau doit être entre 1 et 5"),
  body("age").isInt({ min: 16, max: 50 }).withMessage("L'âge doit être entre 16 et 50 ans"),
  body("jerseyNumber")
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage("Le numéro de maillot doit être entre 1 et 99"),
  body("teamId").optional().isString().withMessage("ID d'équipe invalide"),
]

// ID validation
const idValidation = [param("id").isString().isLength({ min: 1 }).withMessage("ID invalide")]

// Routes
router.get("/", authenticateToken, getPlayers)
router.get("/:id", authenticateToken, idValidation, validateRequest, getPlayerById)
router.get("/team/:teamId", authenticateToken, idValidation, validateRequest, getPlayersByTeam)
router.post("/", authenticateToken, requireAdminOrCoach, playerValidation, validateRequest, createPlayer)
router.put("/:id", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, updatePlayer)
router.delete("/:id", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, deletePlayer)

export default router
