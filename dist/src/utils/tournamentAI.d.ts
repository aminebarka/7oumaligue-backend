export interface TournamentSuggestion {
    format: 'groups' | 'knockout' | 'league' | 'mixed';
    numberOfGroups: number;
    teamsPerGroup: number;
    totalMatches: number;
    estimatedDuration: string;
    description: string;
    advantages: string[];
    disadvantages: string[];
    recommended: boolean;
}
export interface TournamentConstraints {
    numberOfTeams: number;
    maxDuration: string;
    availableFields: number;
    maxMatchesPerDay: number;
    includeThirdPlace: boolean;
}
export declare class TournamentAI {
    static suggestFormat(constraints: TournamentConstraints): TournamentSuggestion[];
    private static generateGroupSuggestions;
    private static generateKnockoutSuggestion;
    private static generateLeagueSuggestion;
    private static generateMixedSuggestion;
    private static calculateKnockoutMatches;
    private static calculateByes;
    private static estimateDuration;
    private static markBestSuggestion;
    static generatePersonalizedRecommendation(teams: number, venue: string, timeSlot: string, budget: number): TournamentSuggestion;
}
//# sourceMappingURL=tournamentAI.d.ts.map