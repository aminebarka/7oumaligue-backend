import type { Request, Response } from "express";
export declare const createMatch: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMatches: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMatchById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateMatch: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateMatchScore: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteMatch: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=match.controller.d.ts.map