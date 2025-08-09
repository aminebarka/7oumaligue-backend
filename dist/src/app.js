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
const group_routes_1 = __importDefault(require("./routes/group.routes"));
const advanced_routes_1 = __importDefault(require("./routes/advanced.routes"));
const tv_routes_1 = __importDefault(require("./routes/tv.routes"));
const draw_routes_1 = __importDefault(require("./routes/draw.routes"));
const player_cards_routes_1 = __importDefault(require("./routes/player-cards.routes"));
const stadium_routes_1 = __importDefault(require("./routes/stadium.routes"));
const community_routes_1 = __importDefault(require("./routes/community.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const apiResponse_1 = require("./utils/apiResponse");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:5174', 'http://localhost:5000', 'http://localhost:5173', "https://gray-tree-0ae561303.2.azurestaticapps.net", 'https://gray-tree-0ae561303.2.azurestaticapps.net/'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express_1.default.json());
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Serveur fonctionnel' });
});
app.get('/api/debug/headers', (req, res) => {
    res.json({
        success: true,
        message: 'Headers reçus',
        headers: {
            authorization: req.headers.authorization ? 'Présent' : 'Absent',
            'content-type': req.headers['content-type'],
            'user-agent': req.headers['user-agent']
        }
    });
});
app.get('/api/stadiums/test', async (req, res) => {
    try {
        console.log('🔍 Test de récupération des stades...');
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const stadiums = await prisma.stadium.findMany({
            select: {
                id: true,
                name: true,
                address: true,
                city: true,
                region: true,
                capacity: true,
                fieldCount: true,
                fieldTypes: true,
                amenities: true,
                description: true,
                isPartner: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        console.log(`✅ ${stadiums.length} stades récupérés`);
        await prisma.$disconnect();
        res.json({
            success: true,
            data: stadiums,
            message: 'Test des stades réussi'
        });
    }
    catch (error) {
        console.error('❌ Erreur test stades:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du test des stades',
            error: error.message
        });
    }
});
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournament_routes_1.default);
app.use('/api/teams', team_routes_1.default);
app.use('/api/players', player_routes_1.default);
app.use('/api/matches', match_routes_1.default);
app.use('/api/groups', group_routes_1.default);
app.use('/api', advanced_routes_1.default);
app.use('/api', tv_routes_1.default);
app.use('/api', draw_routes_1.default);
app.use('/api', player_cards_routes_1.default);
app.use('/api/stadiums', stadium_routes_1.default);
app.use('/api', community_routes_1.default);
app.get('/api/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        }
        else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    routes.push({
                        path: handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    res.json({ routes });
});
app.use((req, res) => {
    return (0, apiResponse_1.notFound)(res, 'Route non trouvée');
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map