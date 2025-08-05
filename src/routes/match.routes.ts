import express from "express"
import {
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  updateMatchScore,
  deleteMatch,
} from "../controllers/match.controller"
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

// Match validation
const matchValidation = [
  body("date").isISO8601().withMessage("Date invalide"),
  body("time").isString().withMessage("Heure invalide"),
  body("venue").isString().withMessage("Lieu invalide"),
  body("homeTeam").isString().withMessage("Équipe domicile invalide"),
  body("tournamentId").isString().withMessage("Tournoi invalide"),
  body("groupId").optional().isString().withMessage("Groupe invalide"),
]

// Score validation
const scoreValidation = [
  body("homeScore").isInt({ min: 0, max: 50 }).withMessage("Score domicile invalide"),
]

// ID validation
const idValidation = [param("id").isString().isLength({ min: 1 }).withMessage("ID invalide")]

// Routes
router.get("/", getMatches) // Temporairement sans auth
router.get("/:id", authenticateToken, idValidation, validateRequest, getMatchById)
router.post("/", matchValidation, validateRequest, createMatch) // Temporairement sans auth
router.put("/:id", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, updateMatch)
router.put(
  "/:id/score",
  authenticateToken,
  requireAdminOrCoach,
  idValidation,
  scoreValidation,
  validateRequest,
  updateMatchScore,
)
router.delete("/:id", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, deleteMatch)

export default router
