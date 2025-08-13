import { Prisma } from '@prisma/client';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  tenantId: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      userId?: number;
      tenantId?: number;
    }
  }
}

import express from 'express';
import cors from 'cors';
const authRoutes = require('./routes/auth.routes').default;
import tournamentRoutes from './routes/tournament.routes';
import teamRoutes from './routes/team.routes';
import playerRoutes from './routes/player.routes';
import matchRoutes from './routes/match.routes';
import groupRoutes from './routes/group.routes';
import advancedRoutes from './routes/advanced.routes';
import tvRoutes from './routes/tv.routes';
import drawRoutes from './routes/draw.routes';
import playerCardRoutes from './routes/player-cards.routes';
import stadiumRoutes from './routes/stadium.routes';
import communityRoutes from './routes/community.routes';
import { errorHandler } from './middleware/error.middleware';
import { notFound } from './utils/apiResponse';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'https://backend-7oumaligue-hrd4bqesgcefg5h4.francecentral-01.azurewebsites.net', 'http://localhost:5173',"https://gray-tree-0ae561303.2.azurestaticapps.net",'https://gray-tree-0ae561303.2.azurestaticapps.net/'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Route de test pour vérifier que le serveur fonctionne
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Serveur fonctionnel' });
});

// Route de test simple pour vérifier les headers
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api', advancedRoutes);
app.use('/api', tvRoutes);
app.use('/api', drawRoutes);
app.use('/api', playerCardRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api', communityRoutes);

// Route de debug pour voir les routes
app.get('/api/debug/routes', (req, res) => {
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
  res.json({ routes });
});

// Route 404
app.use((req, res) => {
  return notFound(res, 'Route non trouvée');
});

// Gestion des erreurs
app.use(errorHandler);

export default app;
