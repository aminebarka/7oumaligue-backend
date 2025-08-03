"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const match_controller_1 = require("../controllers/match.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_validator_1 = require("express-validator");
const apiResponse_1 = require("../utils/apiResponse");
const router = express_1.default.Router();
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.badRequest)(res, errors
            .array()
            .map((err) => err.msg)
            .join(", "));
    }
    return next();
};
const matchValidation = [
    (0, express_validator_1.body)("date")
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage("Format de date invalide (YYYY-MM-DD)"),
    (0, express_validator_1.body)("time")
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Format d'heure invalide (HH:MM)"),
    (0, express_validator_1.body)("venue").trim().isLength({ min: 3, max: 100 }).withMessage("Le lieu doit contenir entre 3 et 100 caractères"),
    (0, express_validator_1.body)("homeTeam").isString().isLength({ min: 1 }).withMessage("Équipe domicile requise"),
    (0, express_validator_1.body)("awayTeam").isString().isLength({ min: 1 }).withMessage("Équipe visiteur requise"),
    (0, express_validator_1.body)("tournamentId").isString().isLength({ min: 1 }).withMessage("ID de tournoi requis"),
    (0, express_validator_1.body)("groupId").optional().isString().withMessage("ID de groupe invalide"),
];
const scoreValidation = [
    (0, express_validator_1.body)("homeScore").isInt({ min: 0, max: 50 }).withMessage("Score domicile invalide"),
    (0, express_validator_1.body)("awayScore").isInt({ min: 0, max: 50 }).withMessage("Score visiteur invalide"),
    (0, express_validator_1.body)("status").optional().isIn(["scheduled", "in_progress", "completed"]).withMessage("Statut invalide"),
];
const idValidation = [(0, express_validator_1.param)("id").isString().isLength({ min: 1 }).withMessage("ID invalide")];
router.get("/", auth_middleware_1.authenticateToken, match_controller_1.getMatches);
router.get("/:id", auth_middleware_1.authenticateToken, idValidation, validateRequest, match_controller_1.getMatchById);
router.post("/", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, matchValidation, validateRequest, match_controller_1.createMatch);
router.put("/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, match_controller_1.updateMatch);
router.put("/:id/score", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, scoreValidation, validateRequest, match_controller_1.updateMatchScore);
router.delete("/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, match_controller_1.deleteMatch);
exports.default = router;
//# sourceMappingURL=match.routes.js.map