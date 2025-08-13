"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(__dirname, '../../.env');
dotenv_1.default.config({ path: envPath, override: true });
if (process.env.WEBSITE_SITE_NAME || process.env.NODE_ENV === 'production') {
    console.log('⚙️ Applying Azure production settings');
    process.env.PORT = '8080';
    process.env.HOST = '0.0.0.0';
}
console.log('✅ ENV LOADED:', {
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? '***REDACTED***' : 'MISSING',
    WEBSITE_SITE_NAME: process.env.WEBSITE_SITE_NAME
});
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("./utils/logger");
const error_middleware_1 = require("./middleware/error.middleware");
const cors_middleware_1 = require("./middleware/cors.middleware");
const database_1 = require("./config/database");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const tournament_routes_1 = __importDefault(require("./routes/tournament.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const player_routes_1 = __importDefault(require("./routes/player.routes"));
const match_routes_1 = __importDefault(require("./routes/match.routes"));
const data_routes_1 = __importDefault(require("./routes/data.routes"));
const liveMatch_routes_1 = __importDefault(require("./routes/liveMatch.routes"));
const stadium_routes_1 = __importDefault(require("./routes/stadium.routes"));
const reservation_routes_1 = __importDefault(require("./routes/reservation.routes"));
const academy_routes_1 = __importDefault(require("./routes/academy.routes"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
if (isNaN(PORT)) {
    console.error('❌ INVALID PORT:', process.env.PORT);
    process.exit(1);
}
console.log('🚀 DEBUG - Final PORT value:', PORT);
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});
app.get('/robots933456.txt', (req, res) => {
    res.status(200).send('Azure health check passed');
});
app.use(cors_middleware_1.corsMiddleware);
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://gray-tree-0ae561303.2.azurestaticapps.net",
        'https://tonfrontend.azurestaticapps.net'
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin"
    ],
    exposedHeaders: ["Content-Length", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
    max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "1000"),
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    keyGenerator: (req) => {
        return req.user?.userId ? req.user.userId.toString() : req.ip || 'unknown';
    },
    handler: (req, res) => {
        logger_1.logger.warn(`Rate limit dépassé pour ${req.ip}`);
        const windowMs = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000");
        const retryAfterMinutes = Math.ceil(windowMs / 1000 / 60);
        res.status(429).json({
            success: false,
            error: "Trop de requêtes. Veuillez patienter avant de réessayer.",
            retryAfter: retryAfterMinutes
        });
    }
});
if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_RATE_LIMIT === 'true') {
    app.use("/api/", limiter);
    logger_1.logger.info("🔒 Rate limiting activé");
}
else {
    logger_1.logger.info("🔓 Rate limiting désactivé en développement");
}
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
    });
});
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Serveur fonctionnel' });
});
app.get('/api/auth/test', (req, res) => {
    res.json({
        success: true,
        message: 'Route auth accessible',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/routes', (req, res) => {
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
    res.json({
        success: true,
        message: 'Routes disponibles',
        routes: routes,
        timestamp: new Date().toISOString()
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
console.log("🔧 Enregistrement des routes...");
app.use('/api/auth', auth_routes_1.default);
console.log("✅ Route /api/auth enregistrée");
app.use('/api/tournaments', tournament_routes_1.default);
app.use('/api/teams', team_routes_1.default);
app.use('/api/players', player_routes_1.default);
app.use('/api/matches', match_routes_1.default);
app.use('/api/data', data_routes_1.default);
app.use('/api/live-matches', liveMatch_routes_1.default);
app.use('/api/stadiums', stadium_routes_1.default);
app.use('/api/reservations', reservation_routes_1.default);
app.use('/api/academies', academy_routes_1.default);
console.log("✅ Route /api/reservations enregistrée");
console.log("✅ Route /api/academies enregistrée");
console.log("✅ Toutes les routes enregistrées");
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
    });
});
app.use(error_middleware_1.errorHandler);
const startServer = async () => {
    const port = Number(process.env.PORT) || 8080;
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`✅ Server running on 0.0.0.0:${port}`);
        logger_1.logger.info(`🚀 Server running on 0.0.0.0:${port}`);
    });
    try {
        await (0, database_1.connectDatabase)();
        logger_1.logger.info("✅ Database connected");
    }
    catch (error) {
        logger_1.logger.error("❌ Database connection failed", error);
        logger_1.logger.info("⚠️ Server will continue without database connection");
    }
    process.on('SIGINT', () => {
        server.close(() => {
            logger_1.logger.info('Process terminated');
            process.exit(0);
        });
    });
};
process.on('uncaughtException', (error) => {
    logger_1.logger.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map