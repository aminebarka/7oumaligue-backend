import type { Request, Response } from "express";
export declare const createTeam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTeams: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTeamById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateTeam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteTeam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addPlayerToTeam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removePlayerFromTeam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=team.controller.d.ts.map