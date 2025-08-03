import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TeamWithStats {
  id: string;
  teamId: string;
  team: {
    id: string;
    name: string;
    logo: string | null;
  };
  playerCount: number;
  totalLevel: number;
  avgLevel: number;
  players: any[];
}

export interface DrawResult {
  groups: any[];
  teamStats: TeamWithStats[];
  balanceScore: number;
  isBalanced: boolean;
}

export class DrawSystem {
  /**
   * Calcule la force d'une équipe basée sur ses joueurs
   */
  static calculateTeamStrength(players: any[]): { playerCount: number; totalLevel: number; avgLevel: number } {
    const playerCount = players.length;
    const totalLevel = players.reduce((sum, p) => sum + p.level, 0);
    const avgLevel = playerCount > 0 ? totalLevel / playerCount : 0;
    
    return { playerCount, totalLevel, avgLevel };
  }

  /**
   * Calcule le score de force d'une équipe pour le tri
   */
  static calculateTeamScore(team: TeamWithStats): number {
    return team.avgLevel * 0.7 + team.playerCount * 0.3;
  }

  /**
   * Trie les équipes par force (plus forte d'abord)
   */
  static sortTeamsByStrength(teams: TeamWithStats[]): TeamWithStats[] {
    return teams.sort((a, b) => {
      const scoreA = this.calculateTeamScore(a);
      const scoreB = this.calculateTeamScore(b);
      return scoreB - scoreA;
    });
  }

  /**
   * Répartit les équipes en groupes équilibrés
   */
  static distributeTeamsToGroups(teams: TeamWithStats[], numberOfGroups: number): TeamWithStats[][] {
    const groups: TeamWithStats[][] = [];
    for (let i = 0; i < numberOfGroups; i++) {
      groups.push([]);
    }

    // Algorithme serpentin pour équilibrer les groupes
    for (let i = 0; i < teams.length; i++) {
      const groupIndex = i % 2 === 0 
        ? Math.floor(i / 2) 
        : numberOfGroups - 1 - Math.floor(i / 2);
      
      if (groupIndex < numberOfGroups) {
        groups[groupIndex].push(teams[i]);
      }
    }

    return groups;
  }

  /**
   * Calcule l'équilibre des groupes
   */
  static calculateGroupBalance(groups: TeamWithStats[][]): { stdDev: number; isBalanced: boolean } {
    const groupStats = groups.map(group => {
      const totalPlayers = group.reduce((sum, team) => sum + team.playerCount, 0);
      const totalLevel = group.reduce((sum, team) => sum + team.totalLevel, 0);
      const avgLevel = totalPlayers > 0 ? totalLevel / totalPlayers : 0;
      
      return { totalPlayers, totalLevel, avgLevel };
    });

    const levels = groupStats.map(stat => stat.avgLevel);
    const mean = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const variance = levels.reduce((sum, level) => sum + Math.pow(level - mean, 2), 0) / levels.length;
    const stdDev = Math.sqrt(variance);

    return {
      stdDev,
      isBalanced: stdDev < 1.0
    };
  }

  /**
   * Répartit les joueurs équitablement entre les équipes
   */
  static async distributePlayersToTeams(
    allPlayers: any[], 
    teams: any[], 
    tenantId: number
  ): Promise<void> {
    if (allPlayers.length === 0 || teams.length === 0) {
      console.log("⚠️  Aucun joueur ou équipe à traiter");
      return;
    }

    const playersPerTeam = Math.floor(allPlayers.length / teams.length);
    const remainingPlayers = allPlayers.length % teams.length;

    console.log(`📋 Joueurs par équipe: ${playersPerTeam}`);
    console.log(`📋 Joueurs restants: ${remainingPlayers}`);

    // Compteurs pour suivre l'équilibre
    const teamPlayerCounts = new Array(teams.length).fill(0);
    const teamTotalLevels = new Array(teams.length).fill(0);

    // Fonction pour calculer le score d'équilibre d'une équipe
    const getTeamBalanceScore = (teamIndex: number): number => {
      const playerCount = teamPlayerCounts[teamIndex];
      const avgLevel = playerCount > 0 ? teamTotalLevels[teamIndex] / playerCount : 0;
      return avgLevel * 0.7 + playerCount * 0.3;
    };

    let playerIndex = 0;

    // Répartition principale avec algorithme serpentin amélioré
    for (let round = 0; round < playersPerTeam; round++) {
      // Trier les équipes par score d'équilibre (plus faible d'abord)
      const teamOrder = teams.map((_, index) => index)
        .sort((a, b) => getTeamBalanceScore(a) - getTeamBalanceScore(b));

      // Alterner la direction pour l'équilibre
      const direction = round % 2 === 0 ? 1 : -1;
      const orderedTeams = direction === 1 ? teamOrder : teamOrder.reverse();

      for (const teamIndex of orderedTeams) {
        if (playerIndex < allPlayers.length) {
          const player = allPlayers[playerIndex];
          
          await prisma.player.update({
            where: { id: player.id },
            data: { teamId: teams[teamIndex].teamId }
          });

          // Mettre à jour les compteurs
          teamPlayerCounts[teamIndex]++;
          teamTotalLevels[teamIndex] += player.level;

          console.log(`   Joueur ${player.name} (niveau ${player.level}) → Équipe ${teams[teamIndex].teamId} (${teamPlayerCounts[teamIndex]} joueurs, niveau moyen: ${(teamTotalLevels[teamIndex] / teamPlayerCounts[teamIndex]).toFixed(1)})`);
          playerIndex++;
        }
      }
    }

    // Répartition des joueurs restants (équipes les plus faibles d'abord)
    const remainingTeamOrder = teams.map((_, index) => index)
      .sort((a, b) => getTeamBalanceScore(a) - getTeamBalanceScore(b));

    for (let i = 0; i < remainingPlayers && playerIndex < allPlayers.length; i++) {
      const teamIndex = remainingTeamOrder[i];
      const player = allPlayers[playerIndex];
      
      await prisma.player.update({
        where: { id: player.id },
        data: { teamId: teams[teamIndex].teamId }
      });

      teamPlayerCounts[teamIndex]++;
      teamTotalLevels[teamIndex] += player.level;

      console.log(`   Joueur restant ${player.name} (niveau ${player.level}) → Équipe ${teams[teamIndex].teamId} (${teamPlayerCounts[teamIndex]} joueurs, niveau moyen: ${(teamTotalLevels[teamIndex] / teamPlayerCounts[teamIndex]).toFixed(1)})`);
      playerIndex++;
    }
  }

  /**
   * Valide l'équilibre final des équipes
   */
  static async validateFinalBalance(teams: any[]): Promise<{ stdDev: number; isBalanced: boolean }> {
    const finalTeams = await Promise.all(
      teams.map(async (tournamentTeam) => {
        const players = await prisma.player.findMany({
          where: { teamId: tournamentTeam.teamId }
        });
        
        const stats = this.calculateTeamStrength(players);
        
        return {
          teamId: tournamentTeam.teamId,
          ...stats
        };
      })
    );

    console.log("📊 Équilibre final des équipes:");
    finalTeams.forEach((team, index) => {
      console.log(`   Équipe ${index + 1}: ${team.playerCount} joueurs, niveau moyen ${team.avgLevel.toFixed(1)}`);
    });

    // Calculer l'équilibre global
    const levels = finalTeams.map(t => t.avgLevel);
    const mean = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const variance = levels.reduce((sum, level) => sum + Math.pow(level - mean, 2), 0) / levels.length;
    const stdDev = Math.sqrt(variance);

    console.log(`⚖️  Équilibre global: écart-type = ${stdDev.toFixed(2)}`);
    
    const isBalanced = stdDev < 1.0;
    if (stdDev < 0.5) {
      console.log("✅ Équilibre excellent!");
    } else if (stdDev < 1.0) {
      console.log("⚠️  Équilibre acceptable");
    } else {
      console.log("❌ Équilibre à améliorer");
    }

    return { stdDev, isBalanced };
  }
} 