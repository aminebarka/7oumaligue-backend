export interface MatchSchedule {
    homeTeam: string;
    awayTeam: string;
    date: Date;
    round: string;
    groupId?: string;
    matchNumber: number;
}
export interface TournamentSchedule {
    groupPhase: MatchSchedule[];
    finalPhase: MatchSchedule[];
    totalDays: number;
}
export declare class TournamentScheduler {
    static generateTournamentSchedule(tournamentId: string): Promise<TournamentSchedule>;
    private static generateFIFAGroupMatches;
    private static generateFinalPhase;
    static calculateQualifiedTeams(tournamentId: string): Promise<string[]>;
    private static calculateGroupStandings;
}
//# sourceMappingURL=roundRobinUtils.d.ts.map