"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function loadEnvVars() {
    if (process.env.DATABASE_URL)
        return;
    try {
        const envPath = path_1.default.resolve(__dirname, '../../.env');
        if (fs_1.default.existsSync(envPath)) {
            const envFile = fs_1.default.readFileSync(envPath, 'utf-8');
            const envLines = envFile.split('\n');
            for (const line of envLines) {
                const [key, ...values] = line.split('=');
                const value = values.join('=').trim();
                if (key && value && !process.env[key]) {
                    process.env[key] = value.replace(/^"|"$/g, '');
                }
            }
            logger_1.logger.warn('⚠️ Loaded environment variables from .env file');
        }
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to load .env file:', error);
    }
    if (!process.env.DATABASE_URL) {
        logger_1.logger.error('❌ CRITICAL: DATABASE_URL is not defined in environment variables');
        logger_1.logger.error('❌ Available environment keys:', Object.keys(process.env).join(', '));
        process.exit(1);
    }
}
loadEnvVars();
function ensurePrismaInitialized() {
    try {
        exports.prisma.$extends({});
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.prisma = globalThis.__prisma ||
    new client_1.PrismaClient({
        log: [
            {
                emit: "event",
                level: "query",
            },
            {
                emit: "event",
                level: "error",
            },
            {
                emit: "event",
                level: "info",
            },
            {
                emit: "event",
                level: "warn",
            },
        ],
    });
if (process.env.NODE_ENV !== "production") {
    globalThis.__prisma = exports.prisma;
}
if (process.env.NODE_ENV === "development") {
    exports.prisma.$on("query", (e) => {
        logger_1.logger.debug(`Query: ${e.query}`);
        logger_1.logger.debug(`Duration: ${e.duration}ms`);
    });
}
exports.prisma.$on("error", (e) => {
    logger_1.logger.error("Database error:", e.message);
    logger_1.logger.error("Database error details:", {
        target: e.target,
        timestamp: e.timestamp
    });
});
exports.prisma.$on("info", (e) => {
    logger_1.logger.info("Database info:", e.message);
});
exports.prisma.$on("warn", (e) => {
    logger_1.logger.warn("Database warning:", e.message);
});
const connectDatabase = async () => {
    const maxRetries = 5;
    const retryDelay = 2000;
    if (!ensurePrismaInitialized()) {
        logger_1.logger.error("❌ Prisma client not initialized. Running prisma generate...");
        try {
            const { execSync } = require('child_process');
            execSync('npx prisma generate', { stdio: 'inherit' });
            logger_1.logger.info("✅ Prisma client regenerated");
        }
        catch (error) {
            logger_1.logger.error("❌ Failed to regenerate Prisma client:", error);
            process.exit(1);
        }
    }
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await exports.prisma.$connect();
            logger_1.logger.info("✅ Database connected successfully");
            return;
        }
        catch (error) {
            logger_1.logger.error(`❌ Database connection attempt ${attempt} failed:`, error);
            if (attempt === maxRetries) {
                logger_1.logger.error("❌ All database connection attempts failed. Exiting...");
                process.exit(1);
            }
            logger_1.logger.info(`🔄 Retrying database connection in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};
exports.connectDatabase = connectDatabase;
process.on("beforeExit", async () => {
    try {
        await exports.prisma.$disconnect();
        logger_1.logger.info("🔌 Database disconnected gracefully");
    }
    catch (error) {
        logger_1.logger.error("❌ Error during database disconnection:", error);
    }
});
process.on("SIGINT", async () => {
    logger_1.logger.info("🛑 Received SIGINT, shutting down gracefully...");
    try {
        await exports.prisma.$disconnect();
        logger_1.logger.info("🔌 Database disconnected");
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error("❌ Error during shutdown:", error);
        process.exit(1);
    }
});
process.on("SIGTERM", async () => {
    logger_1.logger.info("🛑 Received SIGTERM, shutting down gracefully...");
    try {
        await exports.prisma.$disconnect();
        logger_1.logger.info("🔌 Database disconnected");
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error("❌ Error during shutdown:", error);
        process.exit(1);
    }
});
//# sourceMappingURL=database.js.map