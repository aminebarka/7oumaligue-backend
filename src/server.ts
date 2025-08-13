import dotenv from 'dotenv';
import path from 'path';

// Charger .env IMMÉDIATEMENT
const envPath = path.resolve(__dirname, '../../.env'); // Adapté pour dist/src
dotenv.config({ path: envPath, override: true });

// Forcer les valeurs pour Azure SI nécessaire
if (process.env.WEBSITE_SITE_NAME || process.env.NODE_ENV === 'production') {
  console.log('⚙️ Applying Azure production settings');
  process.env.PORT = '8080';
  process.env.HOST = '0.0.0.0';
}

// Debug complet des variables
console.log('✅ ENV LOADED:', {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? '***REDACTED***' : 'MISSING',
  WEBSITE_SITE_NAME: process.env.WEBSITE_SITE_NAME
});

import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import os from "os"
import { logger } from "./utils/logger"
import { errorHandler } from "./middleware/error.middleware"
import { corsMiddleware } from "./middleware/cors.middleware"
import { connectDatabase } from "./config/database"

// Import routes
import authRoutes from './routes/auth.routes';
import tournamentRoutes from './routes/tournament.routes';
import teamRoutes from './routes/team.routes';
import playerRoutes from './routes/player.routes';
import matchRoutes from './routes/match.routes';
import dataRoutes from './routes/data.routes';
import liveMatchRoutes from './routes/liveMatch.routes';
import stadiumRoutes from './routes/stadium.routes';
import reservationRoutes from './routes/reservation.routes';
import academyRoutes from './routes/academy.routes';

const app = express()
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Validation finale
if (isNaN(PORT)) {
  console.error('❌ INVALID PORT:', process.env.PORT);
  process.exit(1);
}

console.log('🚀 DEBUG - Final PORT value:', PORT)

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});
app.get('/robots933456.txt', (req, res) => {
  res.status(200).send('Azure health check passed');
}); 
// CORS middleware personnalisé - DOIT être en premier
app.use(corsMiddleware)

// CORS configuration - DOIT être avant helmet
app.use(
  cors({
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
  keyGenerator: (req: any) => {
    // Utiliser l'IP ou l'ID utilisateur si disponible
    return req.user?.userId ? req.user.userId.toString() : req.ip || 'unknown';
  },
  handler: (req: any, res: any) => {
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

// Route de test pour vérifier l'authentification
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Route auth accessible',
    timestamp: new Date().toISOString()
  });
});

// Route de test pour vérifier les routes disponibles
app.get('/api/routes', (req, res) => {
  const routes: Array<{path: string, methods: string[]}> = [];
  
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler: any) => {
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
console.log("🔧 Enregistrement des routes...");

app.use('/api/auth', authRoutes);
console.log("✅ Route /api/auth enregistrée");

app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/live-matches', liveMatchRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/academies', academyRoutes);
console.log("✅ Route /api/reservations enregistrée");
console.log("✅ Route /api/academies enregistrée");

console.log("✅ Toutes les routes enregistrées");

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
// Remplacez la fonction startServer par :
const startServer = async () => {
  // Démarrer le serveur IMMÉDIATEMENT
  const port = Number(process.env.PORT) || 8080;
  
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on 0.0.0.0:${port}`);
    logger.info(`🚀 Server running on 0.0.0.0:${port}`);
  });

  // Connexion DB en arrière-plan (ne bloque pas le démarrage)
  try {
    await connectDatabase();
    logger.info("✅ Database connected");
  } catch (error) {
    logger.error("❌ Database connection failed", error);
    logger.info("⚠️ Server will continue without database connection");
  }

  // Gestion propre des arrêts
  process.on('SIGINT', () => {
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
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