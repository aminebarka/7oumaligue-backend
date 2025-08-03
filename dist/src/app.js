"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes = require('./routes/auth.routes').default;
const tournament_routes_1 = __importDefault(require("./routes/tournament.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const player_routes_1 = __importDefault(require("./routes/player.routes"));
const match_routes_1 = __importDefault(require("./routes/match.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const apiResponse_1 = require("./utils/apiResponse");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:5174', 'http://localhost:5000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express_1.default.json());
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournament_routes_1.default);
app.use('/api/teams', team_routes_1.default);
app.use('/api/players', player_routes_1.default);
app.use('/api/matches', match_routes_1.default);
app.use((req, res) => {
    return (0, apiResponse_1.notFound)(res, 'Route non trouvée');
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map