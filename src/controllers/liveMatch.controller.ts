import { Request, Response } from "express";
import { prisma } from "../config/database";
import { success, badRequest, notFound } from "../utils/apiResponse";

// TODO: Activer quand les modèles Prisma seront générés
// import { LiveMatchState, MatchEvent } from "@prisma/client";

// Obtenir l'état en direct d'un match
export const getLiveMatchState = async (req: Request, res: Response) => {
  const { matchId } = req.params;

  try {
    // TODO: Activer quand les modèles Prisma seront générés
    /*
    // Récupérer l'état en direct du match
    const liveState = await prisma.liveMatchState.findUnique({
      where: { matchId },
      include: {
        match: {
          include: {
            homeTeamRef: true,
            group: true,
            tournament: true,
          },
        },
      },
    });

    // Récupérer les événements du match
    const events = await prisma.matchEvent.findMany({
      where: { matchId },
      include: {
        player: true,
      },
      orderBy: { timestamp: 'asc' },
    });
    */

    // Version temporaire - retourner un état par défaut
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeamRef: true,
        group: true,
        tournament: true,
      },
    });

    if (!match) {
      return notFound(res, "Match non trouvé");
    }

    // État par défaut
    const defaultState = {
      id: `temp-${matchId}`,
      matchId,
      isLive: false,
      isPaused: false,
      matchTime: 0,
      homeScore: match.homeScore || 0,
      match,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return success(res, {
      liveState: defaultState,
      events: [],
    }, "État en direct récupéré");

    /*
    if (!liveState) {
      // Si pas d'état en direct, créer un état par défaut
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeamRef: true,
          group: true,
          tournament: true,
        },
      });

      if (!match) {
        return notFound(res, "Match non trouvé");
      }

      const defaultState = await prisma.liveMatchState.create({
        data: {
          matchId,
          isLive: false,
          isPaused: false,
          matchTime: 0,
          homeScore: match.homeScore || 0,
        },
        include: {
          match: {
            include: {
              homeTeamRef: true,
              group: true,
              tournament: true,
            },
          },
        },
      });

      return success(res, {
        liveState: defaultState,
        events: [],
      }, "État en direct récupéré");
    }

    return success(res, {
      liveState,
      events,
    }, "État en direct récupéré");
    */
  } catch (error) {
    console.error("Erreur lors de la récupération de l'état en direct:", error);
    return badRequest(res, "Erreur lors de la récupération de l'état en direct");
  }
};

// Démarrer un match en direct
export const startLiveMatch = async (req: Request, res: Response) => {
  const { matchId } = req.params;

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return notFound(res, "Match non trouvé");
    }

    // TODO: Activer quand les modèles Prisma seront générés
    /*
    // Créer ou mettre à jour l'état en direct
    const liveState = await prisma.liveMatchState.upsert({
      where: { matchId },
      update: {
        isLive: true,
        isPaused: false,
        matchTime: 0,
      },
      create: {
        matchId,
        isLive: true,
        isPaused: false,
        matchTime: 0,
        homeScore: match.homeScore || 0,
      },
      include: {
        match: {
          include: {
            homeTeamRef: true,
            awayTeamRef: true,
            group: true,
            tournament: true,
          },
        },
      },
    });
    */

    // Version temporaire
    const liveState = {
      id: `temp-${matchId}`,
      matchId,
      isLive: true,
      isPaused: false,
      matchTime: 0,
      homeScore: match.homeScore || 0,
      match,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return success(res, liveState, "Match démarré en direct");
  } catch (error) {
    console.error("Erreur lors du démarrage du match:", error);
    return badRequest(res, "Erreur lors du démarrage du match");
  }
};

// Mettre en pause/reprendre un match
export const togglePauseMatch = async (req: Request, res: Response) => {
  const { matchId } = req.params;

  try {
    // TODO: Activer quand les modèles Prisma seront générés
    /*
    const liveState = await prisma.liveMatchState.findUnique({
      where: { matchId },
    });

    if (!liveState) {
      return notFound(res, "Match en direct non trouvé");
    }

    const updatedState = await prisma.liveMatchState.update({
      where: { matchId },
      data: {
        isPaused: !liveState.isPaused,
      },
      include: {
        match: {
          include: {
            homeTeamRef: true,
            awayTeamRef: true,
            group: true,
            tournament: true,
          },
        },
      },
    });
    */

    // Version temporaire
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeamRef: true,
        group: true,
        tournament: true,
      },
    });

    if (!match) {
      return notFound(res, "Match non trouvé");
    }

    const updatedState = {
      id: `temp-${matchId}`,
      matchId,
      isLive: true,
      isPaused: true, // Toggle temporaire
      matchTime: 0,
      homeScore: match.homeScore || 0,
      match,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return success(res, updatedState, "État de pause mis à jour");
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la pause:", error);
    return badRequest(res, "Erreur lors de la mise à jour de la pause");
  }
};

// Terminer un match en direct
export const endLiveMatch = async (req: Request, res: Response) => {
  const { matchId } = req.params;

  try {
    // TODO: Activer quand les modèles Prisma seront générés
    /*
    const liveState = await prisma.liveMatchState.findUnique({
      where: { matchId },
    });

    if (!liveState) {
      return notFound(res, "Match en direct non trouvé");
    }

    const updatedState = await prisma.liveMatchState.update({
      where: { matchId },
      data: {
        isLive: false,
        isPaused: false,
      },
      include: {
        match: {
          include: {
            homeTeamRef: true,
            awayTeamRef: true,
            group: true,
            tournament: true,
          },
        },
      },
    });
    */

    // Version temporaire
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeamRef: true,
        group: true,
        tournament: true,
      },
    });

    if (!match) {
      return notFound(res, "Match non trouvé");
    }

    const updatedState = {
      id: `temp-${matchId}`,
      matchId,
      isLive: false,
      isPaused: false,
      matchTime: 0,
      homeScore: match.homeScore || 0,
      match,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return success(res, updatedState, "Match terminé");
  } catch (error) {
    console.error("Erreur lors de la fin du match:", error);
    return badRequest(res, "Erreur lors de la fin du match");
  }
};

// Mettre à jour le temps du match
export const updateMatchTime = async (req: Request, res: Response) => {
  const { matchId } = req.params;
  const { matchTime } = req.body;

  try {
    // TODO: Activer quand les modèles Prisma seront générés
    /*
    const liveState = await prisma.liveMatchState.findUnique({
      where: { matchId },
    });

    if (!liveState) {
      return notFound(res, "Match en direct non trouvé");
    }

    const updatedState = await prisma.liveMatchState.update({
      where: { matchId },
      data: {
        matchTime: parseInt(matchTime),
      },
      include: {
        match: {
          include: {
            homeTeamRef: true,
            awayTeamRef: true,
            group: true,
            tournament: true,
          },
        },
      },
    });
    */

    // Version temporaire
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeamRef: true,
        group: true,
        tournament: true,
      },
    });

    if (!match) {
      return notFound(res, "Match non trouvé");
    }

    const updatedState = {
      id: `temp-${matchId}`,
      matchId,
      isLive: true,
      isPaused: false,
      matchTime: parseInt(matchTime),
      homeScore: match.homeScore || 0,
      match,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return success(res, updatedState, "Temps du match mis à jour");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du temps:", error);
    return badRequest(res, "Erreur lors de la mise à jour du temps");
  }
};

// Mettre à jour le score du match
export const updateLiveMatchScore = async (req: Request, res: Response) => {
  const { matchId } = req.params;
  const { homeScore } = req.body;

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeamRef: true,
        group: true,
        tournament: true,
      },
    });

    if (!match) {
      return notFound(res, "Match non trouvé");
    }

    // Update match score
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore: parseInt(homeScore),
        status: "completed",
      },
      include: {
        homeTeamRef: true,
        group: true,
        tournament: true,
      },
    });

    // Update live match state
    await prisma.liveMatchState.upsert({
      where: { matchId },
      update: {
        homeScore: parseInt(homeScore),
        updatedAt: new Date(),
      },
      create: {
        matchId,
        homeScore: parseInt(homeScore),
        updatedAt: new Date(),
      },
    });

    return success(res, updatedMatch, "Score mis à jour avec succès");
  } catch (error) {
    console.error("Erreur mise à jour score live:", error);
    return badRequest(res, "Erreur lors de la mise à jour du score");
  }
};

// Ajouter un événement au match
export const addMatchEvent = async (req: Request, res: Response) => {
  const { matchId } = req.params;
  const { type, minute, playerId, playerName, team, description } = req.body;

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return notFound(res, "Match non trouvé");
    }

    // TODO: Activer quand les modèles Prisma seront générés
    /*
    const event = await prisma.matchEvent.create({
      data: {
        matchId,
        type,
        minute: parseInt(minute),
        playerId,
        playerName,
        team,
        description,
      },
      include: {
        player: true,
        match: {
          include: {
            homeTeamRef: true,
            awayTeamRef: true,
            group: true,
            tournament: true,
          },
        },
      },
    });
    */

    // Version temporaire
    const event = {
      id: `temp-event-${Date.now()}`,
      matchId,
      type,
      minute: parseInt(minute),
      playerId,
      playerName,
      team,
      description,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return success(res, event, "Événement ajouté");
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'événement:", error);
    return badRequest(res, "Erreur lors de l'ajout de l'événement");
  }
};

// Supprimer un événement
export const deleteMatchEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  try {
    // TODO: Activer quand les modèles Prisma seront générés
    /*
    const event = await prisma.matchEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return notFound(res, "Événement non trouvé");
    }

    await prisma.matchEvent.delete({
      where: { id: eventId },
    });
    */

    // Version temporaire
    return success(res, null, "Événement supprimé");
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    return badRequest(res, "Erreur lors de la suppression de l'événement");
  }
};

// Obtenir tous les événements d'un match
export const getMatchEvents = async (req: Request, res: Response) => {
  const { matchId } = req.params;

  try {
    // TODO: Activer quand les modèles Prisma seront générés
    /*
    const events = await prisma.matchEvent.findMany({
      where: { matchId },
      include: {
        player: true,
        match: {
          include: {
            homeTeamRef: true,
            awayTeamRef: true,
            group: true,
            tournament: true,
          },
        },
      },
      orderBy: { timestamp: 'asc' },
    });
    */

    // Version temporaire - retourner un tableau vide
    const events: any[] = [];

    return success(res, events, "Événements récupérés");
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    return badRequest(res, "Erreur lors de la récupération des événements");
  }
}; 