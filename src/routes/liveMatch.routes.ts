import express from "express";
import {
  getLiveMatchState,
  startLiveMatch,
  togglePauseMatch,
  endLiveMatch,
  updateMatchTime,
  updateLiveMatchScore,
  addMatchEvent,
  deleteMatchEvent,
  getMatchEvents,
} from "../controllers/liveMatch.controller";
import { authenticateToken, requireAdminOrCoach } from "../middleware/auth.middleware";
import { body, param, validationResult } from "express-validator";
import { badRequest } from "../utils/apiResponse";

const router = express.Router();

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequest(
      res,
      errors
        .array()
        .map((err: any) => err.msg)
        .join(", "),
    );
  }
  return next();
};

// ID validation
const idValidation = [param("matchId").isString().isLength({ min: 1 }).withMessage("ID de match invalide")];

// Event validation
const eventValidation = [
  body("type").isIn(["goal", "yellow_card", "red_card", "substitution"]).withMessage("Type d'événement invalide"),
  body("minute").isInt({ min: 0, max: 120 }).withMessage("Minute invalide"),
  body("team").isIn(["home", "away"]).withMessage("Équipe invalide"),
  body("description").isString().isLength({ min: 1 }).withMessage("Description requise"),
];

// Score validation
const scoreValidation = [
  body("homeScore").isInt({ min: 0, max: 50 }).withMessage("Score domicile invalide"),
];

// Time validation
const timeValidation = [
  body("matchTime").isInt({ min: 0, max: 7200 }).withMessage("Temps de match invalide"),
];

// Routes publiques (lecture seule pour tous les utilisateurs connectés)
router.get("/:matchId/state", authenticateToken, idValidation, validateRequest, getLiveMatchState);
router.get("/:matchId/events", authenticateToken, idValidation, validateRequest, getMatchEvents);

// Routes admin/coach (contrôle)
router.post("/:matchId/start", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, startLiveMatch);
router.post("/:matchId/pause", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, togglePauseMatch);
router.post("/:matchId/end", authenticateToken, requireAdminOrCoach, idValidation, validateRequest, endLiveMatch);
router.put("/:matchId/time", authenticateToken, requireAdminOrCoach, idValidation, timeValidation, validateRequest, updateMatchTime);
router.put("/:matchId/score", authenticateToken, requireAdminOrCoach, idValidation, scoreValidation, validateRequest, updateLiveMatchScore);
router.post("/:matchId/events", authenticateToken, requireAdminOrCoach, idValidation, eventValidation, validateRequest, addMatchEvent);
router.delete("/events/:eventId", authenticateToken, requireAdminOrCoach, deleteMatchEvent);

export default router; 