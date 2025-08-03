import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface MatchSchedule {
  homeTeam: string
  awayTeam: string
  date: Date
  round: string
  groupId?: string
  matchNumber: number
}

export interface TournamentSchedule {
  groupPhase: MatchSchedule[]
  finalPhase: MatchSchedule[]
  totalDays: number
}

export class TournamentScheduler {
  /**
   * Génère le planning complet d'un tournoi avec 1 match par jour (structure FIFA)
   */
  static async generateTournamentSchedule(tournamentId: string): Promise<TournamentSchedule> {
    console.log('📅 Génération du planning du tournoi:', tournamentId)
    
    // Récupérer le tournoi et ses groupes
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        groups: {
          include: {
            groupTeams: {
              include: {
                team: true
              }
            }
          }
        }
      }
    })

    if (!tournament) {
      throw new Error('Tournoi non trouvé')
    }

    const groups = tournament.groups
    console.log(`📊 ${groups.length} groupes trouvés`)

    // Phase de groupes : Structure FIFA officielle
    const groupPhase: MatchSchedule[] = []
    let currentDay = 1

    // Générer les matchs selon la structure FIFA
    const groupMatches = this.generateFIFAGroupMatches(groups, currentDay)
    groupPhase.push(...groupMatches)
    
    currentDay += 18 // 18 jours pour la phase de groupes

    // Jour de repos
    const restDay = currentDay
    console.log(`😴 Jour de repos: ${restDay}`)
    currentDay++

    // Phase finale
    const finalPhase = this.generateFinalPhase(tournamentId, currentDay)

    const totalDays = currentDay + finalPhase.length - 1

    console.log(`📅 Planning généré: ${totalDays} jours total`)
    console.log(`   - Phase de groupes: ${groupPhase.length} matchs`)
    console.log(`   - Phase finale: ${finalPhase.length} matchs`)

    return {
      groupPhase,
      finalPhase,
      totalDays
    }
  }

  /**
   * Génère les matchs de groupes selon la structure FIFA officielle
   */
  private static generateFIFAGroupMatches(groups: any[], startDay: number): MatchSchedule[] {
    const matches: MatchSchedule[] = []
    
    // Structure FIFA officielle pour chaque groupe
    const fifaStructure = [
      // Jour 1-6: Premier tour de chaque groupe
      { day: 1, groupIndex: 0, match: 0 }, // A1 vs A2
      { day: 2, groupIndex: 0, match: 1 }, // A3 vs A4
      { day: 3, groupIndex: 1, match: 0 }, // B1 vs B2
      { day: 4, groupIndex: 1, match: 1 }, // B3 vs B4
      { day: 5, groupIndex: 2, match: 0 }, // C1 vs C2
      { day: 6, groupIndex: 2, match: 1 }, // C3 vs C4
      
      // Jour 7-12: Deuxième tour (alterné)
      { day: 7, groupIndex: 0, match: 2 }, // A1 vs A3
      { day: 8, groupIndex: 1, match: 2 }, // B1 vs B3
      { day: 9, groupIndex: 2, match: 2 }, // C1 vs C3
      { day: 10, groupIndex: 0, match: 3 }, // A2 vs A4
      { day: 11, groupIndex: 1, match: 3 }, // B2 vs B4
      { day: 12, groupIndex: 2, match: 3 }, // C2 vs C4
      
      // Jour 13-18: Troisième tour (alterné)
      { day: 13, groupIndex: 0, match: 4 }, // A1 vs A4
      { day: 14, groupIndex: 1, match: 4 }, // B1 vs B4
      { day: 15, groupIndex: 2, match: 4 }, // C1 vs C4
      { day: 16, groupIndex: 0, match: 5 }, // A2 vs A3
      { day: 17, groupIndex: 1, match: 5 }, // B2 vs B3
      { day: 18, groupIndex: 2, match: 5 }  // C2 vs C3
    ]

    // Générer les matchs selon la structure FIFA
    for (const structure of fifaStructure) {
      const group = groups[structure.groupIndex]
      if (!group) continue

      const teams = group.groupTeams.map((gt: any) => gt.team.id)
      if (teams.length < 4) continue

      // Structure des matchs FIFA pour un groupe de 4 équipes
      const groupMatchStructure = [
        { home: 0, away: 1 }, // A1 vs A2
        { home: 2, away: 3 }, // A3 vs A4
        { home: 0, away: 2 }, // A1 vs A3
        { home: 1, away: 3 }, // A2 vs A4
        { home: 0, away: 3 }, // A1 vs A4
        { home: 1, away: 2 }  // A2 vs A3
      ]

      const match = groupMatchStructure[structure.match]
      if (match) {
        const matchDate = new Date()
        matchDate.setDate(matchDate.getDate() + startDay + structure.day - 2)
        matchDate.setHours(20, 0, 0, 0) // 20h00 par défaut

        matches.push({
          homeTeam: teams[match.home],
          awayTeam: teams[match.away],
          date: matchDate,
          round: 'Groupes',
          groupId: group.id,
          matchNumber: startDay + structure.day - 1
        })

        console.log(`📅 Jour ${structure.day}: ${teams[match.home]} vs ${teams[match.away]} (Groupe ${group.name})`)
      }
    }

    return matches
  }

  /**
   * Génère la phase finale (quarts, demi, finale)
   */
  private static generateFinalPhase(tournamentId: string, startDay: number): MatchSchedule[] {
    const finalMatches: MatchSchedule[] = []
    let currentDay = startDay

    // Quarts de finale (4 matchs sur 4 jours)
    for (let i = 1; i <= 4; i++) {
      const matchDate = new Date()
      matchDate.setDate(matchDate.getDate() + currentDay - 1)
      matchDate.setHours(20, 0, 0, 0)

      finalMatches.push({
        homeTeam: `QF${i}_HOME`, // Placeholder - sera remplacé par les équipes qualifiées
        awayTeam: `QF${i}_AWAY`,
        date: matchDate,
        round: '1/4 de Finale',
        matchNumber: currentDay
      })
      currentDay++
    }

    // Demi-finales (2 matchs sur 2 jours)
    for (let i = 1; i <= 2; i++) {
      const matchDate = new Date()
      matchDate.setDate(matchDate.getDate() + currentDay - 1)
      matchDate.setHours(20, 0, 0, 0)

      finalMatches.push({
        homeTeam: `SF${i}_HOME`,
        awayTeam: `SF${i}_AWAY`,
        date: matchDate,
        round: '1/2 Finale',
        matchNumber: currentDay
      })
      currentDay++
    }

    // Finale
    const finalDate = new Date()
    finalDate.setDate(finalDate.getDate() + currentDay - 1)
    finalDate.setHours(20, 0, 0, 0)

    finalMatches.push({
      homeTeam: 'FINAL_HOME',
      awayTeam: 'FINAL_AWAY',
      date: finalDate,
      round: 'Finale',
      matchNumber: currentDay
    })

    return finalMatches
  }

  /**
   * Calcule les équipes qualifiées pour la phase finale
   */
  static async calculateQualifiedTeams(tournamentId: string): Promise<string[]> {
    console.log('🏆 Calcul des équipes qualifiées pour la phase finale')
    
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        groups: {
          include: {
            groupTeams: {
              include: {
                team: true
              }
            }
          }
        }
      }
    })

    if (!tournament) {
      throw new Error('Tournoi non trouvé')
    }

    const qualifiedTeams: string[] = []

    // Pour chaque groupe, prendre les 2 premiers + les 2 meilleurs 3èmes
    const allThirdPlaces: Array<{teamId: string, points: number, goalDifference: number, goalsFor: number}> = []

    for (const group of tournament.groups) {
      const standings = await this.calculateGroupStandings(group.id)
      
      // Ajouter les 2 premiers de chaque groupe
      if (standings.length >= 1) qualifiedTeams.push(standings[0].teamId)
      if (standings.length >= 2) qualifiedTeams.push(standings[1].teamId)
      
      // Garder le 3ème pour comparaison
      if (standings.length >= 3) {
        allThirdPlaces.push({
          teamId: standings[2].teamId,
          points: standings[2].points,
          goalDifference: standings[2].goalDifference,
          goalsFor: standings[2].goalsFor
        })
      }
    }

    // Ajouter les 2 meilleurs 3èmes
    allThirdPlaces.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })

    if (allThirdPlaces.length >= 1) qualifiedTeams.push(allThirdPlaces[0].teamId)
    if (allThirdPlaces.length >= 2) qualifiedTeams.push(allThirdPlaces[1].teamId)

    console.log(`✅ ${qualifiedTeams.length} équipes qualifiées:`, qualifiedTeams)
    return qualifiedTeams
  }

  /**
   * Calcule le classement d'un groupe
   */
  private static async calculateGroupStandings(groupId: string): Promise<Array<{
    teamId: string,
    points: number,
    goalDifference: number,
    goalsFor: number,
    goalsAgainst: number
  }>> {
    // Récupérer le groupe avec ses équipes
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        groupTeams: {
          include: {
            team: true
          }
        }
      }
    })

    if (!group) {
      return []
    }

    const matches = await prisma.match.findMany({
      where: { groupId }
    })

    const teamStats = new Map<string, {
      played: number,
      wins: number,
      draws: number,
      losses: number,
      goalsFor: number,
      goalsAgainst: number,
      points: number,
    }>()

    // Initialiser les stats pour toutes les équipes du groupe
    for (const groupTeam of group.groupTeams) {
      teamStats.set(groupTeam.teamId, { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 })
    }

    // Calculer les stats
    for (const match of matches) {
      if (match.homeScore !== null && match.homeTeam) {
        const homeStats = teamStats.get(match.homeTeam) || {
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        };

        homeStats.played += 1;
        homeStats.goalsFor += match.homeScore;
        homeStats.goalsAgainst += 0; // Pas d'équipe adverse

        if (match.homeScore > 0) {
          homeStats.wins += 1;
          homeStats.points += 3;
        } else {
          homeStats.draws += 1;
          homeStats.points += 1;
        }

        teamStats.set(match.homeTeam, homeStats);
      }
    }

    // Convertir en tableau et trier
    const standings = Array.from(teamStats.entries()).map(([teamId, stats]) => ({
      teamId,
      points: stats.points,
      goalDifference: stats.goalsFor - stats.goalsAgainst,
      goalsFor: stats.goalsFor,
      goalsAgainst: stats.goalsAgainst
    }))

    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
      return 0
    })

    return standings
  }
} 