import type { Request, Response } from "express";
export declare const createTournament: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTournaments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTournamentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateTournament: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteTournament: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addTeamToTournament: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeTeamFromTournament: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const performDraw: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=tournament.controller.d.ts.map