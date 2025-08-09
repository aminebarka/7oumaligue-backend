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
            userId?: number;
            tenantId?: number;
        }
    }
}
declare const app: import("express-serve-static-core").Express;
export default app;
//# sourceMappingURL=app.d.ts.map