import { PrismaClient } from "@prisma/client"
import { logger } from "../utils/logger"

declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
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
  })

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma
}

// Log database queries in development
if (process.env.NODE_ENV === "development") {
  // @ts-expect-error
  prisma.$on("query", (e: Prisma.QueryEvent) => {
    logger.debug(`Query: ${e.query}`)
    logger.debug(`Duration: ${e.duration}ms`)
  });
}

// @ts-expect-error
prisma.$on("error", (e: Prisma.LogEvent) => {
  logger.error("Database error:", e.message)
  logger.error("Database error details:", {
    target: e.target,
    timestamp: e.timestamp
  })
});

// @ts-expect-error
prisma.$on("info", (e: Prisma.LogEvent) => {
  logger.info("Database info:", e.message)
});

// @ts-expect-error
prisma.$on("warn", (e: Prisma.LogEvent) => {
  logger.warn("Database warning:", e.message)
});

// Test database connection with retry logic
export const connectDatabase = async () => {
  const maxRetries = 5
  const retryDelay = 2000 // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect()
      logger.info("✅ Database connected successfully")
      return
    } catch (error) {
      logger.error(`❌ Database connection attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        logger.error("❌ All database connection attempts failed. Exiting...")
        process.exit(1)
      }
      
      logger.info(`🔄 Retrying database connection in ${retryDelay}ms...`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }
}

// Graceful shutdown
process.on("beforeExit", async () => {
  try {
    await prisma.$disconnect()
    logger.info("🔌 Database disconnected gracefully")
  } catch (error) {
    logger.error("❌ Error during database disconnection:", error)
  }
})

// Handle process termination
process.on("SIGINT", async () => {
  logger.info("🛑 Received SIGINT, shutting down gracefully...")
  try {
    await prisma.$disconnect()
    logger.info("🔌 Database disconnected")
    process.exit(0)
  } catch (error) {
    logger.error("❌ Error during shutdown:", error)
    process.exit(1)
  }
})

process.on("SIGTERM", async () => {
  logger.info("🛑 Received SIGTERM, shutting down gracefully...")
  try {
    await prisma.$disconnect()
    logger.info("🔌 Database disconnected")
    process.exit(0)
  } catch (error) {
    logger.error("❌ Error during shutdown:", error)
    process.exit(1)
  }
})
