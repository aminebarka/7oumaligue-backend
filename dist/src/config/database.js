"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
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