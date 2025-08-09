import { Request, Response } from "express";
export declare const getLiveMatchState: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const startLiveMatch: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const togglePauseMatch: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const endLiveMatch: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateMatchTime: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateLiveMatchScore: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addMatchEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteMatchEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMatchEvents: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=liveMatch.controller.d.ts.map