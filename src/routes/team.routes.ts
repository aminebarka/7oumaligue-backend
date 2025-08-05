import express from "express"
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addPlayerToTeam,
  removePlayerFromTeam,
} from "../controllers/team.controller"
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
        .map((err: any) => err.msg)
        .join(", "),
    )
  }
  return next()
}

// Team validation
const teamValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le nom de l'équipe doit contenir entre 2 et 50 caractères"),
  body("coachName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le nom du coach doit contenir entre 2 et 50 caractères"),
  body("logo").optional().trim().isLength({ max: 10 }).withMessage("Le logo ne peut pas dépasser 10 caractères"),
]

// ID validation
const idValidation = [param("id").isString().isLength({ min: 1 }).withMessage("ID invalide")]

// Player ID validation
const playerIdValidation = [body("playerId").isString().isLength({ min: 1 }).withMessage("ID de joueur invalide")]

// Routes
router.get("/", authenticateToken, getTeams)
router.get("/:id", authenticateToken, idValidation, validateRequest, getTeamById)
router.post("/", authenticateToken, requireAdminOrCoach, teamValidation, validateRequest, createTeam)
router.put("/:id", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, updateTeam)
router.delete("/:id", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, deleteTeam)
router.post(
  "/:id/players",
  authenticateToken,
  requireAdminOrCoach,
  idValidation,
  playerIdValidation,
  validateRequest,
  addPlayerToTeam,
)
router.delete(
  "/:id/players/:playerId",
  authenticateToken,
  requireAdminOrCoach,
  idValidation,
  validateRequest,
  removePlayerFromTeam,
)

export default router
