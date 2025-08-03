"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const player_controller_1 = require("../controllers/player.controller");
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
const playerValidation = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Le nom du joueur doit contenir entre 2 et 50 caractères"),
    (0, express_validator_1.body)("position").isIn(["Gardien", "Défenseur", "Milieu", "Attaquant"]).withMessage("Position invalide"),
    (0, express_validator_1.body)("level").isInt({ min: 1, max: 5 }).withMessage("Le niveau doit être entre 1 et 5"),
    (0, express_validator_1.body)("age").isInt({ min: 16, max: 50 }).withMessage("L'âge doit être entre 16 et 50 ans"),
    (0, express_validator_1.body)("jerseyNumber")
        .optional()
        .isInt({ min: 1, max: 99 })
        .withMessage("Le numéro de maillot doit être entre 1 et 99"),
    (0, express_validator_1.body)("teamId").optional().isString().withMessage("ID d'équipe invalide"),
];
const idValidation = [(0, express_validator_1.param)("id").isString().isLength({ min: 1 }).withMessage("ID invalide")];
router.get("/", auth_middleware_1.authenticateToken, player_controller_1.getPlayers);
router.get("/:id", auth_middleware_1.authenticateToken, idValidation, validateRequest, player_controller_1.getPlayerById);
router.get("/team/:teamId", auth_middleware_1.authenticateToken, idValidation, validateRequest, player_controller_1.getPlayersByTeam);
router.post("/", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, playerValidation, validateRequest, player_controller_1.createPlayer);
router.put("/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, player_controller_1.updatePlayer);
router.delete("/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, player_controller_1.deletePlayer);
exports.default = router;
//# sourceMappingURL=player.routes.js.map