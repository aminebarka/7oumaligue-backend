"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentScheduler = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TournamentScheduler {
    static async generateTournamentSchedule(tournamentId) {
        console.log('📅 Génération du planning du tournoi:', tournamentId);
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
        });
        if (!tournament) {
            throw new Error('Tournoi non trouvé');
        }
        const groups = tournament.groups;
        console.log(`📊 ${groups.length} groupes trouvés`);
        const groupPhase = [];
        let currentDay = 1;
        const groupMatches = this.generateFIFAGroupMatches(groups, currentDay);
        groupPhase.push(...groupMatches);
        currentDay += 18;
        const restDay = currentDay;
        console.log(`😴 Jour de repos: ${restDay}`);
        currentDay++;
        const finalPhase = this.generateFinalPhase(tournamentId, currentDay);
        const totalDays = currentDay + finalPhase.length - 1;
        console.log(`📅 Planning généré: ${totalDays} jours total`);
        console.log(`   - Phase de groupes: ${groupPhase.length} matchs`);
        console.log(`   - Phase finale: ${finalPhase.length} matchs`);
        return {
            groupPhase,
            finalPhase,
            totalDays
        };
    }
    static generateFIFAGroupMatches(groups, startDay) {
        const matches = [];
        const fifaStructure = [
            { day: 1, groupIndex: 0, match: 0 },
            { day: 2, groupIndex: 0, match: 1 },
            { day: 3, groupIndex: 1, match: 0 },
            { day: 4, groupIndex: 1, match: 1 },
            { day: 5, groupIndex: 2, match: 0 },
            { day: 6, groupIndex: 2, match: 1 },
            { day: 7, groupIndex: 0, match: 2 },
            { day: 8, groupIndex: 1, match: 2 },
            { day: 9, groupIndex: 2, match: 2 },
            { day: 10, groupIndex: 0, match: 3 },
            { day: 11, groupIndex: 1, match: 3 },
            { day: 12, groupIndex: 2, match: 3 },
            { day: 13, groupIndex: 0, match: 4 },
            { day: 14, groupIndex: 1, match: 4 },
            { day: 15, groupIndex: 2, match: 4 },
            { day: 16, groupIndex: 0, match: 5 },
            { day: 17, groupIndex: 1, match: 5 },
            { day: 18, groupIndex: 2, match: 5 }
        ];
        for (const structure of fifaStructure) {
            const group = groups[structure.groupIndex];
            if (!group)
                continue;
            const teams = group.groupTeams.map((gt) => gt.team.id);
            if (teams.length < 4)
                continue;
            const groupMatchStructure = [
                { home: 0, away: 1 },
                { home: 2, away: 3 },
                { home: 0, away: 2 },
                { home: 1, away: 3 },
                { home: 0, away: 3 },
                { home: 1, away: 2 }
            ];
            const match = groupMatchStructure[structure.match];
            if (match) {
                const matchDate = new Date();
                matchDate.setDate(matchDate.getDate() + startDay + structure.day - 2);
                matchDate.setHours(20, 0, 0, 0);
                matches.push({
                    homeTeam: teams[match.home],
                    awayTeam: teams[match.away],
                    date: matchDate,
                    round: 'Groupes',
                    groupId: group.id,
                    matchNumber: startDay + structure.day - 1
                });
                console.log(`📅 Jour ${structure.day}: ${teams[match.home]} vs ${teams[match.away]} (Groupe ${group.name})`);
            }
        }
        return matches;
    }
    static generateFinalPhase(tournamentId, startDay) {
        const finalMatches = [];
        let currentDay = startDay;
        for (let i = 1; i <= 4; i++) {
            const matchDate = new Date();
            matchDate.setDate(matchDate.getDate() + currentDay - 1);
            matchDate.setHours(20, 0, 0, 0);
            finalMatches.push({
                homeTeam: `QF${i}_HOME`,
                awayTeam: `QF${i}_AWAY`,
                date: matchDate,
                round: '1/4 de Finale',
                matchNumber: currentDay
            });
            currentDay++;
        }
        for (let i = 1; i <= 2; i++) {
            const matchDate = new Date();
            matchDate.setDate(matchDate.getDate() + currentDay - 1);
            matchDate.setHours(20, 0, 0, 0);
            finalMatches.push({
                homeTeam: `SF${i}_HOME`,
                awayTeam: `SF${i}_AWAY`,
                date: matchDate,
                round: '1/2 Finale',
                matchNumber: currentDay
            });
            currentDay++;
        }
        const finalDate = new Date();
        finalDate.setDate(finalDate.getDate() + currentDay - 1);
        finalDate.setHours(20, 0, 0, 0);
        finalMatches.push({
            homeTeam: 'FINAL_HOME',
            awayTeam: 'FINAL_AWAY',
            date: finalDate,
            round: 'Finale',
            matchNumber: currentDay
        });
        return finalMatches;
    }
    static async calculateQualifiedTeams(tournamentId) {
        console.log('🏆 Calcul des équipes qualifiées pour la phase finale');
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
        });
        if (!tournament) {
            throw new Error('Tournoi non trouvé');
        }
        const qualifiedTeams = [];
        const allThirdPlaces = [];
        for (const group of tournament.groups) {
            const standings = await this.calculateGroupStandings(group.id);
            if (standings.length >= 1)
                qualifiedTeams.push(standings[0].teamId);
            if (standings.length >= 2)
                qualifiedTeams.push(standings[1].teamId);
            if (standings.length >= 3) {
                allThirdPlaces.push({
                    teamId: standings[2].teamId,
                    points: standings[2].points,
                    goalDifference: standings[2].goalDifference,
                    goalsFor: standings[2].goalsFor
                });
            }
        }
        allThirdPlaces.sort((a, b) => {
            if (b.points !== a.points)
                return b.points - a.points;
            if (b.goalDifference !== a.goalDifference)
                return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });
        if (allThirdPlaces.length >= 1)
            qualifiedTeams.push(allThirdPlaces[0].teamId);
        if (allThirdPlaces.length >= 2)
            qualifiedTeams.push(allThirdPlaces[1].teamId);
        console.log(`✅ ${qualifiedTeams.length} équipes qualifiées:`, qualifiedTeams);
        return qualifiedTeams;
    }
    static async calculateGroupStandings(groupId) {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                groupTeams: {
                    include: {
                        team: true
                    }
                }
            }
        });
        if (!group) {
            return [];
        }
        const matches = await prisma.match.findMany({
            where: { groupId }
        });
        const teamStats = new Map();
        for (const groupTeam of group.groupTeams) {
            teamStats.set(groupTeam.teamId, { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });
        }
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
                homeStats.goalsAgainst += 0;
                if (match.homeScore > 0) {
                    homeStats.wins += 1;
                    homeStats.points += 3;
                }
                else {
                    homeStats.draws += 1;
                    homeStats.points += 1;
                }
                teamStats.set(match.homeTeam, homeStats);
            }
        }
        const standings = Array.from(teamStats.entries()).map(([teamId, stats]) => ({
            teamId,
            points: stats.points,
            goalDifference: stats.goalsFor - stats.goalsAgainst,
            goalsFor: stats.goalsFor,
            goalsAgainst: stats.goalsAgainst
        }));
        standings.sort((a, b) => {
            if (b.points !== a.points)
                return b.points - a.points;
            if (b.goalDifference !== a.goalDifference)
                return b.goalDifference - a.goalDifference;
            if (b.goalsFor !== a.goalsFor)
                return b.goalsFor - a.goalsFor;
            return 0;
        });
        return standings;
    }
}
exports.TournamentScheduler = TournamentScheduler;
//# sourceMappingURL=roundRobinUtils.js.map