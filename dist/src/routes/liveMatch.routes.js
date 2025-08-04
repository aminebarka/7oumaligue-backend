"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const liveMatch_controller_1 = require("../controllers/liveMatch.controller");
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
const idValidation = [(0, express_validator_1.param)("matchId").isString().isLength({ min: 1 }).withMessage("ID de match invalide")];
const eventValidation = [
    (0, express_validator_1.body)("type").isIn(["goal", "yellow_card", "red_card", "substitution"]).withMessage("Type d'événement invalide"),
    (0, express_validator_1.body)("minute").isInt({ min: 0, max: 120 }).withMessage("Minute invalide"),
    (0, express_validator_1.body)("team").isIn(["home", "away"]).withMessage("Équipe invalide"),
    (0, express_validator_1.body)("description").isString().isLength({ min: 1 }).withMessage("Description requise"),
];
const scoreValidation = [
    (0, express_validator_1.body)("homeScore").isInt({ min: 0, max: 50 }).withMessage("Score domicile invalide"),
];
const timeValidation = [
    (0, express_validator_1.body)("matchTime").isInt({ min: 0, max: 7200 }).withMessage("Temps de match invalide"),
];
router.get("/:matchId/state", auth_middleware_1.authenticateToken, idValidation, validateRequest, liveMatch_controller_1.getLiveMatchState);
router.get("/:matchId/events", auth_middleware_1.authenticateToken, idValidation, validateRequest, liveMatch_controller_1.getMatchEvents);
router.post("/:matchId/start", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, liveMatch_controller_1.startLiveMatch);
router.post("/:matchId/pause", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, liveMatch_controller_1.togglePauseMatch);
router.post("/:matchId/end", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, validateRequest, liveMatch_controller_1.endLiveMatch);
router.put("/:matchId/time", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, timeValidation, validateRequest, liveMatch_controller_1.updateMatchTime);
router.put("/:matchId/score", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, scoreValidation, validateRequest, liveMatch_controller_1.updateLiveMatchScore);
router.post("/:matchId/events", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, idValidation, eventValidation, validateRequest, liveMatch_controller_1.addMatchEvent);
router.delete("/events/:eventId", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdminOrCoach, liveMatch_controller_1.deleteMatchEvent);
exports.default = router;
//# sourceMappingURL=liveMatch.routes.js.map