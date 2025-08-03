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
});
exports.prisma.$on("info", (e) => {
    logger_1.logger.info("Database info:", e.message);
});
exports.prisma.$on("warn", (e) => {
    logger_1.logger.warn("Database warning:", e.message);
});
const connectDatabase = async () => {
    try {
        await exports.prisma.$connect();
        logger_1.logger.info("✅ Database connected successfully");
    }
    catch (error) {
        logger_1.logger.error("❌ Database connection failed:", error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
process.on("beforeExit", async () => {
    await exports.prisma.$disconnect();
    logger_1.logger.info("🔌 Database disconnected");
});
//# sourceMappingURL=database.js.map