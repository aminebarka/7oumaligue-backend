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
export declare class DrawSystem {
    static calculateTeamStrength(players: any[]): {
        playerCount: number;
        totalLevel: number;
        avgLevel: number;
    };
    static calculateTeamScore(team: TeamWithStats): number;
    static sortTeamsByStrength(teams: TeamWithStats[]): TeamWithStats[];
    static distributeTeamsToGroups(teams: TeamWithStats[], numberOfGroups: number): TeamWithStats[][];
    static calculateGroupBalance(groups: TeamWithStats[][]): {
        stdDev: number;
        isBalanced: boolean;
    };
    static distributePlayersToTeams(allPlayers: any[], teams: any[], tenantId: number): Promise<void>;
    static validateFinalBalance(teams: any[]): Promise<{
        stdDev: number;
        isBalanced: boolean;
    }>;
}
//# sourceMappingURL=drawUtils.d.ts.map