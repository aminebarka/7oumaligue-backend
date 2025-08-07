"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const os_1 = __importDefault(require("os"));
const logger_1 = require("./utils/logger");
const error_middleware_1 = require("./middleware/error.middleware");
const cors_middleware_1 = require("./middleware/cors.middleware");
const database_1 = require("./config/database");
const authRoutes = require('./routes/auth.routes').default;
const tournamentRoutes = require('./routes/tournament.routes').default;
const teamRoutes = require('./routes/team.routes').default;
const playerRoutes = require('./routes/player.routes').default;
const matchRoutes = require('./routes/match.routes').default;
const dataRoutes = require('./routes/data.routes').default;
const liveMatchRoutes = require('./routes/liveMatch.routes').default;
const stadiumRoutes = require('./routes/stadium.routes').default;
dotenv_1.default.config();
console.log('🔍 DEBUG - process.env.PORT:', process.env.PORT);
console.log('🔍 DEBUG - NODE_ENV:', process.env.NODE_ENV);
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
console.log('🚀 DEBUG - Final PORT value:', PORT);
app.use(cors_middleware_1.corsMiddleware);
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
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
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/live-matches', liveMatchRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
    });
});
app.use(error_middleware_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
        const port = Number(PORT);
        console.log('🎯 DEBUG - About to start server on', host + ':' + port);
        app.listen(port, host, () => {
            console.log(`✅ Server running on ${host}:${port}`);
            logger_1.logger.info(`🚀 Server running on ${host}:${port}`);
            logger_1.logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
            logger_1.logger.info(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
            console.log(`🖥️  Network interfaces:`);
            Object.entries(os_1.default.networkInterfaces()).forEach(([name, interfaces]) => {
                interfaces?.forEach(info => {
                    if (info.family === 'IPv4') {
                        console.log(`  - ${name}: ${info.address} (${info.family})`);
                    }
                });
            });
        });
    }
    catch (error) {
        logger_1.logger.error("❌ Failed to start server:", error);
        process.exit(1);
    }
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