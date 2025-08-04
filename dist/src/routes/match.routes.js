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
    (0, express_validator_1.body)("date").isISO8601().withMessage("Date invalide"),
    (0, express_validator_1.body)("time").isString().withMessage("Heure invalide"),
    (0, express_validator_1.body)("venue").isString().withMessage("Lieu invalide"),
    (0, express_validator_1.body)("homeTeam").isString().withMessage("Équipe domicile invalide"),
    (0, express_validator_1.body)("tournamentId").isString().withMessage("Tournoi invalide"),
    (0, express_validator_1.body)("groupId").optional().isString().withMessage("Groupe invalide"),
];
const scoreValidation = [
    (0, express_validator_1.body)("homeScore").isInt({ min: 0, max: 50 }).withMessage("Score domicile invalide"),
];
const idValidation = [(0, express_validator_1.param)("id").isString().isLength({ min: 1 }).withMessage("ID invalide")];
router.get("/", match_controller_1.getMatches);
router.get("/:id", auth_middleware_1.authenticateToken, idValidation, validateRequest, match_controller_1.getMatchById);
router.post("/", matchValidation, validateRequest, match_controller_1.createMatch);
router.put("/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, match_controller_1.updateMatch);
router.put("/:id/score", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, scoreValidation, validateRequest, match_controller_1.updateMatchScore);
router.delete("/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, match_controller_1.deleteMatch);
exports.default = router;
//# sourceMappingURL=match.routes.js.map