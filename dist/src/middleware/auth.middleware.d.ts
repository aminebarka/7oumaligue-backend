import type { Request, Response, NextFunction } from "express";
interface JwtPayload {
    userId: number;
    email: string;
    role: string;
    tenantId: number;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => any;
export declare const requireRole: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => any;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => any;
export declare const requireAdminOrCoach: (req: Request, res: Response, next: NextFunction) => any;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map