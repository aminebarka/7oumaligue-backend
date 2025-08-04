import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"
import { logger } from "./utils/logger"
import { errorHandler } from "./middleware/error.middleware"
import { corsMiddleware } from "./middleware/cors.middleware"
import { connectDatabase } from "./config/database"

// Import routes
const authRoutes = require('./routes/auth.routes').default;
const tournamentRoutes = require('./routes/tournament.routes').default;
const teamRoutes = require('./routes/team.routes').default;
const playerRoutes = require('./routes/player.routes').default;
const matchRoutes = require('./routes/match.routes').default;
const dataRoutes = require('./routes/data.routes').default;
const liveMatchRoutes = require('./routes/liveMatch.routes').default;
const stadiumRoutes = require('./routes/stadium.routes').default;

// Load environment variables
dotenv.config()

// Debug: Log the PORT value
console.log('🔍 DEBUG - process.env.PORT:', process.env.PORT)
console.log('🔍 DEBUG - NODE_ENV:', process.env.NODE_ENV)

const app = express()
const PORT = process.env.PORT || 8080

console.log('🚀 DEBUG - Final PORT value:', PORT)

// CORS middleware personnalisé - DOIT être en premier
app.use(corsMiddleware)

// CORS configuration - DOIT être avant helmet
app.use(
  cors({
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
  }),
)

// Security middleware - après CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// Rate limiting - Configuration plus permissive pour le développement
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "1000"), // Augmenté à 1000 requêtes par fenêtre
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies
  skipFailedRequests: false, // Compter les requêtes échouées
  keyGenerator: (req) => {
    // Utiliser l'IP ou l'ID utilisateur si disponible
    return req.user?.userId ? req.user.userId.toString() : req.ip || 'unknown';
  },
  handler: (req, res) => {
    logger.warn(`Rate limit dépassé pour ${req.ip}`);
    const windowMs = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000");
    const retryAfterMinutes = Math.ceil(windowMs / 1000 / 60);
    res.status(429).json({
      success: false,
      error: "Trop de requêtes. Veuillez patienter avant de réessayer.",
      retryAfter: retryAfterMinutes
    });
  }
})

// Appliquer le rate limiting seulement si activé
if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_RATE_LIMIT === 'true') {
  app.use("/api/", limiter)
  logger.info("🔒 Rate limiting activé")
} else {
  logger.info("🔓 Rate limiting désactivé en développement")
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Route de test pour vérifier que le serveur fonctionne
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Serveur fonctionnel' });
});

// Route de test temporaire pour les stades (sans authentification)
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
  } catch (error: any) {
    console.error('❌ Erreur test stades:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du test des stades',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/live-matches', liveMatchRoutes);
app.use('/api/stadiums', stadiumRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server with database connection
const startServer = async () => {
  try {
    // Connect to database first
    await connectDatabase()
    
    // Start the server
    console.log('🎯 DEBUG - About to start server on port:', PORT)
    app.listen(PORT, () => {
      console.log('✅ DEBUG - Server successfully started on port:', PORT)
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
      logger.info(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}`)
    })
  } catch (error) {
    logger.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the server
startServer()

export default app;