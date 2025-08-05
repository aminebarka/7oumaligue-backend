import express from "express"
import {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  addTeamToTournament,
  removeTeamFromTournament,
  performDraw,
  generateMatches,
  generateFinalPhaseMatches,
  updateFinalPhaseMatches,
  addTeamToGroup,
  removeTeamFromGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  getStadiums,
} from "../controllers/tournament.controller"
import { authenticateToken, requireAdmin, requireAdminOrCoach } from "../middleware/auth.middleware"
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

// Tournament validation
const tournamentValidation = [
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Le nom du tournoi doit contenir entre 3 et 100 caractères"),
  body("startDate").isISO8601().withMessage("Date de début invalide"),
  body("endDate")
    .isISO8601()
    .withMessage("Date de fin invalide")
    .custom((endDate: any, { req }: any) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error("La date de fin doit être postérieure à la date de début")
      }
      return true
    }),
  body("numberOfGroups").isInt({ min: 1, max: 8 }).withMessage("Le nombre de groupes doit être entre 1 et 8"),
  body("prize")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("La description du prix ne peut pas dépasser 200 caractères"),
  body("rules")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Les règles ne peuvent pas dépasser 1000 caractères"),
]

// ID validation
const idValidation = [param("id").isString().isLength({ min: 1 }).withMessage("ID invalide")]

// Team ID validation
const teamIdValidation = [body("teamId").isString().isLength({ min: 1 }).withMessage("ID d'équipe invalide")]

// Match generation validation
const matchGenerationValidation = [
  body("matchTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Format d'heure invalide (HH:MM)")
]

// Group team validation
const groupTeamValidation = [
  body("groupId").isString().isLength({ min: 1 }).withMessage("ID de groupe invalide"),
  body("teamId").isString().isLength({ min: 1 }).withMessage("ID d'équipe invalide")
]

// Group validation
const groupValidation = [
  body("name").isString().isLength({ min: 1, max: 100 }).withMessage("Nom de groupe invalide"),
  body("tournamentId").isString().isLength({ min: 1 }).withMessage("ID de tournoi invalide")
]

// Group update validation
const groupUpdateValidation = [
  body("groupId").isString().isLength({ min: 1 }).withMessage("ID de groupe invalide"),
  body("name").isString().isLength({ min: 1, max: 100 }).withMessage("Nom de groupe invalide")
]

// Routes - Lecture seule pour tous les utilisateurs authentifiés
router.get("/", authenticateToken, getTournaments)
router.get("/:id", authenticateToken, idValidation, validateRequest, getTournamentById)
router.get("/stadiums/list", authenticateToken, getStadiums)

// Route directe pour les stades (pour compatibilité)
router.get("/stadiums", authenticateToken, getStadiums)

// Routes - Écriture réservée aux admins/coaches
router.post("/", authenticateToken, requireAdminOrCoach, tournamentValidation, validateRequest, createTournament)
router.put("/:id", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, updateTournament)
router.delete("/:id", authenticateToken, requireAdmin, idValidation, validateRequest, deleteTournament)
router.post(
  "/:id/teams",
  authenticateToken,
  requireAdminOrCoach,
  idValidation,
  teamIdValidation,
  validateRequest,
  addTeamToTournament,
)
router.delete(
  "/:id/teams/:teamId",
  authenticateToken,
  requireAdminOrCoach,
  idValidation,
  validateRequest,
  removeTeamFromTournament,
)
router.post("/:id/draw", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, performDraw)
router.post("/:id/generate-matches", authenticateToken, requireAdminOrCoach, idValidation, matchGenerationValidation, validateRequest, generateMatches)
router.post("/:id/generate-final-matches", authenticateToken, requireAdminOrCoach, idValidation, matchGenerationValidation, validateRequest, generateFinalPhaseMatches)
router.post("/:id/update-final-phase", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, updateFinalPhaseMatches)

// Routes temporaires pour la gestion des groupes - Écriture réservée aux admins/coaches
router.post("/groups/add-team", authenticateToken, requireAdminOrCoach, groupTeamValidation, validateRequest, addTeamToGroup)
router.post("/groups/remove-team", authenticateToken, requireAdminOrCoach, groupTeamValidation, validateRequest, removeTeamFromGroup)
router.post("/groups/create", authenticateToken, requireAdminOrCoach, groupValidation, validateRequest, createGroup)
router.post("/groups/update", authenticateToken, requireAdminOrCoach, groupUpdateValidation, validateRequest, updateGroup)
router.post("/groups/delete", authenticateToken, requireAdminOrCoach, [body("groupId").isString().isLength({ min: 1 }).withMessage("ID de groupe invalide")], validateRequest, deleteGroup)

export default router
