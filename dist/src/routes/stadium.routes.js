"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const stadium_controller_1 = require("../controllers/stadium.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticateToken);
router.post('/', stadium_controller_1.createStadium);
router.get('/', stadium_controller_1.getStadiums);
router.get('/favorites', stadium_controller_1.getFavoriteStadiums);
router.get('/city/:city', stadium_controller_1.getStadiumsByCity);
router.get('/:id', stadium_controller_1.getStadiumById);
router.put('/:id', stadium_controller_1.updateStadium);
router.delete('/:id', stadium_controller_1.deleteStadium);
exports.default = router;
//# sourceMappingURL=stadium.routes.js.map