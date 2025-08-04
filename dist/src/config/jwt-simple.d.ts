interface JwtPayload {
    userId: number;
    email: string;
    role: string;
    tenantId: number;
}
export declare const generateToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const refreshToken: (token: string) => string;
export {};
//# sourceMappingURL=jwt-simple.d.ts.map