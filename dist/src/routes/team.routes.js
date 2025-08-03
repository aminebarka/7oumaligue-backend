"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const team_controller_1 = require("../controllers/team.controller");
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
const teamValidation = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Le nom de l'équipe doit contenir entre 2 et 50 caractères"),
    (0, express_validator_1.body)("coachName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Le nom du coach doit contenir entre 2 et 50 caractères"),
    (0, express_validator_1.body)("logo").optional().trim().isLength({ max: 10 }).withMessage("Le logo ne peut pas dépasser 10 caractères"),
];
const idValidation = [(0, express_validator_1.param)("id").isString().isLength({ min: 1 }).withMessage("ID invalide")];
const playerIdValidation = [(0, express_validator_1.body)("playerId").isString().isLength({ min: 1 }).withMessage("ID de joueur invalide")];
router.get("/", auth_middleware_1.authenticateToken, team_controller_1.getTeams);
router.get("/:id", auth_middleware_1.authenticateToken, idValidation, validateRequest, team_controller_1.getTeamById);
router.post("/", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, teamValidation, validateRequest, team_controller_1.createTeam);
router.put("/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, team_controller_1.updateTeam);
router.delete("/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, team_controller_1.deleteTeam);
router.post("/:id/players", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, playerIdValidation, validateRequest, team_controller_1.addPlayerToTeam);
router.delete("/:id/players/:playerId", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, team_controller_1.removePlayerFromTeam);
exports.default = router;
//# sourceMappingURL=team.routes.js.map