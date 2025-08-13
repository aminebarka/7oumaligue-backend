import express from "express"
import { prisma } from "../config/database"
import { authenticateToken } from "../middleware/auth.middleware"
import { success } from "../utils/apiResponse"

const router = express.Router()

// Route pour récupérer toutes les données
router.get("/all", authenticateToken, async (req, res) => {
  try {
    console.log("📊 Récupération de toutes les données pour l'utilisateur:", req.user?.email)

    // Récupérer toutes les données sans filtrer par tenantId pour permettre l'accès en lecture seule
    const [tournaments, teams, players, matches] = await Promise.all([
      prisma.tournament.findMany({
        include: {
          groups: true,
          matches: true,
        },
      }),
      prisma.team.findMany({
        include: {
          playerRecords: true,
        },
      }),
      prisma.player.findMany({
        include: {
          team: true,
        },
      }),
      prisma.match.findMany({
        include: {
          homeTeamRef: true,
          group: true,
          tournament: true,
        },
      }),
    ])

    const data = {
      tournaments: tournaments.length,
      teams: teams.length,
      players: players.length,
      matches: matches.length,
      details: {
        tournaments,
        teams,
        players,
        matches,
      },
    }

    console.log(`✅ Données récupérées: ${data.tournaments} tournois, ${data.teams} équipes, ${data.players} joueurs, ${data.matches} matchs`)

    return success(res, "Données récupérées avec succès", data)
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données:", error)
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des données",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    })
  }
})

export default router 