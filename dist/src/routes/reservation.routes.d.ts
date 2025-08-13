import type { Request, Response } from "express";
declare const router: import("express-serve-static-core").Router;
export declare const getReservations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCalendarReservations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createReservation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateReservation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteReservation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getReservationStatistics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export default router;
//# sourceMappingURL=reservation.routes.d.ts.map