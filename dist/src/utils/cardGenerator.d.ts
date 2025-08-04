interface PlayerCardData {
    player: any;
    stats: any;
    averageRating: number;
    reputationLevel: string;
    badges: any[];
}
export declare function generatePlayerCard(data: PlayerCardData): Promise<Buffer>;
export declare function generatePlayerCardSVG(data: PlayerCardData): string;
export {};
//# sourceMappingURL=cardGenerator.d.ts.map