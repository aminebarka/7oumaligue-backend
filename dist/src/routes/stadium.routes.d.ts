import type { Request, Response } from "express";
declare const router: import("express-serve-static-core").Router;
export declare const getStadiums: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getStadium: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getStadiumAvailability: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getFields: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getField: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createStadium: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createField: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export default router;
//# sourceMappingURL=stadium.routes.d.ts.map