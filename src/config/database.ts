import { PrismaClient } from "@prisma/client"
import { logger } from "../utils/logger"
import path from "path"
import fs from "fs"

// Fonction pour charger les variables d'environnement
function loadEnvVars() {
  // 1. Vérifier si DATABASE_URL est déjà définie
  if (process.env.DATABASE_URL) return;
  
  // 2. Essayer de charger depuis .env
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf-8');
      const envLines = envFile.split('\n');
      
      for (const line of envLines) {
        const [key, ...values] = line.split('=');
        const value = values.join('=').trim();
        
        // Ne traiter que les lignes avec une clé et une valeur
        if (key && value && !process.env[key]) {
          process.env[key] = value.replace(/^"|"$/g, '');
        }
      }
      logger.warn('⚠️ Loaded environment variables from .env file');
    }
  } catch (error) {
    logger.error('❌ Failed to load .env file:', error);
  }
  
  // 3. Vérification finale
  if (!process.env.DATABASE_URL) {
    logger.error('❌ CRITICAL: DATABASE_URL is not defined in environment variables');
    logger.error('❌ Available environment keys:', Object.keys(process.env).join(', '));
    process.exit(1);
  }
}

// Appeler cette fonction immédiatement
loadEnvVars();

declare global {
  var __prisma: PrismaClient | undefined
}
function ensurePrismaInitialized() {
  try {
    // Tente d'accéder à une propriété pour vérifier l'initialisation
    prisma.$extends({});
    return true;
  } catch (e) {
    return false;
  }
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
  if (!ensurePrismaInitialized()) {
    logger.error("❌ Prisma client not initialized. Running prisma generate...");
    try {
      // Tenter de régénérer le client
      const { execSync } = require('child_process');
      execSync('npx prisma generate', { stdio: 'inherit' });
      logger.info("✅ Prisma client regenerated");
    } catch (error) {
      logger.error("❌ Failed to regenerate Prisma client:", error);
      process.exit(1);
    }}
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
