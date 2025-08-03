"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tournament_controller_1 = require("../controllers/tournament.controller");
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
const tournamentValidation = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Le nom du tournoi doit contenir entre 3 et 100 caractères"),
    (0, express_validator_1.body)("startDate").isISO8601().withMessage("Date de début invalide"),
    (0, express_validator_1.body)("endDate")
        .isISO8601()
        .withMessage("Date de fin invalide")
        .custom((endDate, { req }) => {
        if (new Date(endDate) <= new Date(req.body.startDate)) {
            throw new Error("La date de fin doit être postérieure à la date de début");
        }
        return true;
    }),
    (0, express_validator_1.body)("numberOfGroups").isInt({ min: 1, max: 8 }).withMessage("Le nombre de groupes doit être entre 1 et 8"),
    (0, express_validator_1.body)("prize")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("La description du prix ne peut pas dépasser 200 caractères"),
    (0, express_validator_1.body)("rules")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Les règles ne peuvent pas dépasser 1000 caractères"),
];
const idValidation = [(0, express_validator_1.param)("id").isString().isLength({ min: 1 }).withMessage("ID invalide")];
const teamIdValidation = [(0, express_validator_1.body)("teamId").isString().isLength({ min: 1 }).withMessage("ID d'équipe invalide")];
router.get("/", auth_middleware_1.authenticateToken, tournament_controller_1.getTournaments);
router.get("/:id", auth_middleware_1.authenticateToken, idValidation, validateRequest, tournament_controller_1.getTournamentById);
router.post("/", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, tournamentValidation, validateRequest, tournament_controller_1.createTournament);
router.put("/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, idValidation, validateRequest, tournament_controller_1.updateTournament);
router.delete("/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, idValidation, validateRequest, tournament_controller_1.deleteTournament);
router.post("/:id/teams", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, idValidation, teamIdValidation, validateRequest, tournament_controller_1.addTeamToTournament);
router.delete("/:id/teams/:teamId", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, idValidation, validateRequest, tournament_controller_1.removeTeamFromTournament);
router.post("/:id/draw", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, idValidation, validateRequest, tournament_controller_1.performDraw);
exports.default = router;
//# sourceMappingURL=tournament.routes.js.map