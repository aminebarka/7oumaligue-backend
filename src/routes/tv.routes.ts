import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { PrismaClient } from '@prisma/client'
import { success, created, badRequest, notFound } from '../utils/apiResponse'

const router = Router()
const prisma = new PrismaClient()

// Route pour obtenir le flux TV d'un tournoi
router.get('/tournaments/:id/tv-feed', async (req, res) => {
  try {
    const { id } = req.params
    const tournament = await prisma.tournament.findUnique({
      where: { id: String(id) },
      include: {
        tournamentTeams: {
          include: {
            team: true
          }
        },
        matches: {
          include: {
            homeTeamRef: true
          },
          orderBy: {
            date: 'asc'
          }
        }
      }
    })

    if (!tournament) {
      return notFound(res, 'Tournoi non trouvé')
    }

    // Obtenir le match en cours
    const currentMatch = await prisma.match.findFirst({
      where: {
        tournamentId: String(id),
        status: 'in_progress'
      },
      include: {
        homeTeamRef: true
      }
    })

    // Obtenir les prochains matchs
    const upcomingMatches = await prisma.match.findMany({
      where: {
        tournamentId: String(id),
        status: 'scheduled',
        date: {
          gte: new Date().toISOString()
        }
      },
      include: {
        homeTeamRef: true
      },
      orderBy: {
        date: 'asc'
      },
      take: 5
    })

    // Générer le HTML pour l'affichage TV
    const tvHtml = generateTVHTML(tournament, currentMatch, upcomingMatches)

    res.setHeader('Content-Type', 'text/html')
    return res.send(tvHtml)
  } catch (error) {
    console.error('Erreur lors de la génération du flux TV:', error)
    return badRequest(res, 'Erreur lors de la génération du flux TV')
  }
})

// Route pour obtenir les données JSON du flux TV (pour WebSocket)
router.get('/tournaments/:id/tv-data', async (req, res) => {
  try {
    const { id } = req.params
    const tournament = await prisma.tournament.findUnique({
      where: { id: String(id) },
      include: {
        tournamentTeams: {
          include: {
            team: true
          }
        }
      }
    })

    if (!tournament) {
      return notFound(res, 'Tournoi non trouvé')
    }

    const currentMatch = await prisma.match.findFirst({
      where: {
        tournamentId: String(id),
        status: 'in_progress'
      },
      include: {
        homeTeamRef: true
      }
    })

    const upcomingMatches = await prisma.match.findMany({
      where: {
        tournamentId: String(id),
        status: 'scheduled',
        date: {
          gte: new Date().toISOString()
        }
      },
      include: {
        homeTeamRef: true
      },
      orderBy: {
        date: 'asc'
      },
      take: 5
    })

    return success(res, {
      tournament,
      currentMatch,
      upcomingMatches,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des données TV:', error)
    return badRequest(res, 'Erreur lors de la récupération des données TV')
  }
})

// Fonction pour générer le HTML de l'affichage TV
function generateTVHTML(tournament: any, currentMatch: any, upcomingMatches: any[]) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>7ouma Ligue - TV Display</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            overflow: hidden;
            height: 100vh;
        }

        .tv-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .tournament-title {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .tournament-subtitle {
            font-size: 1.5rem;
            opacity: 0.9;
        }

        .content {
            flex: 1;
            display: flex;
            gap: 20px;
        }

        .current-match {
            flex: 2;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }

        .upcoming-matches {
            flex: 1;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }

        .match-card {
            background: rgba(255,255,255,0.15);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 15px;
            border: 1px solid rgba(255,255,255,0.3);
        }

        .teams {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .team {
            text-align: center;
            flex: 1;
        }

        .team-name {
            font-size: 1.8rem;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .team-logo {
            font-size: 3rem;
            margin-bottom: 10px;
        }

        .score {
            font-size: 4rem;
            font-weight: bold;
            color: #ffd700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .vs {
            font-size: 2rem;
            font-weight: bold;
            margin: 0 20px;
            color: #ffd700;
        }

        .match-info {
            text-align: center;
            margin-top: 20px;
        }

        .match-status {
            font-size: 1.2rem;
            color: #ff6b6b;
            font-weight: bold;
        }

        .match-time {
            font-size: 1rem;
            opacity: 0.8;
            margin-top: 5px;
        }

        .upcoming-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
        }

        .upcoming-match {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            border: 1px solid rgba(255,255,255,0.2);
        }

        .upcoming-teams {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 1.1rem;
            font-weight: bold;
        }

        .upcoming-time {
            text-align: center;
            font-size: 0.9rem;
            opacity: 0.8;
            margin-top: 5px;
        }

        .live-indicator {
            background: #ff6b6b;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
            display: inline-block;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }

        .no-match {
            text-align: center;
            font-size: 1.5rem;
            opacity: 0.7;
            padding: 40px;
        }

        .clock {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 2rem;
            font-weight: bold;
            color: #ffd700;
        }
    </style>
</head>
<body>
    <div class="clock" id="clock"></div>
    
    <div class="tv-container">
        <div class="header">
            <div class="tournament-title">${tournament.name}</div>
            <div class="tournament-subtitle">7ouma Ligue</div>
        </div>

        <div class="content">
            <div class="current-match">
                ${currentMatch ? `
                    <div class="match-card">
                        <div class="teams">
                            <div class="team">
                                <div class="team-logo">${currentMatch.homeTeamRef?.logo || '⚽'}</div>
                                <div class="team-name">${currentMatch.homeTeamRef?.name || 'Équipe A'}</div>
                            </div>
                            <div class="score">${currentMatch.homeScore}</div>
                        </div>
                        <div class="match-info">
                            <div class="live-indicator">EN DIRECT</div>
                            <div class="match-time">${new Date(currentMatch.date).toLocaleString('fr-FR')}</div>
                        </div>
                    </div>
                ` : `
                    <div class="no-match">
                        <div class="team-logo">⚽</div>
                        <div>Aucun match en cours</div>
                    </div>
                `}
            </div>

            <div class="upcoming-matches">
                <div class="upcoming-title">Prochains Matchs</div>
                ${upcomingMatches.length > 0 ? upcomingMatches.map(match => `
                    <div class="upcoming-match">
                        <div class="upcoming-teams">
                            <span>${match.homeTeamRef?.name || 'Équipe A'}</span>
                        </div>
                        <div class="upcoming-time">${new Date(match.date).toLocaleString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit'
                        })}</div>
                    </div>
                `).join('') : `
                    <div class="no-match">
                        Aucun match programmé
                    </div>
                `}
            </div>
        </div>
    </div>

    <script>
        // Mise à jour de l'horloge
        function updateClock() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            document.getElementById('clock').textContent = timeString;
        }

        // Mise à jour toutes les secondes
        setInterval(updateClock, 1000);
        updateClock();

        // WebSocket pour les mises à jour en temps réel
        const ws = new WebSocket('ws://localhost:5000/ws');
        
        ws.onopen = function() {
            console.log('WebSocket connecté');
        };
        
        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'match_update') {
                // Recharger la page pour les mises à jour
                location.reload();
            }
        };
        
        ws.onerror = function(error) {
            console.log('Erreur WebSocket:', error);
        };
    </script>
</body>
</html>
  `
}

export default router 