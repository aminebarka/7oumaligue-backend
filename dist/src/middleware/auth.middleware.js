"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminOrCoach = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiResponse_1 = require("../utils/apiResponse");
const authenticateToken = (req, res, next) => {
    try {
        console.log("🔐 Vérification d'authentification pour:", req.path);
        console.log("Headers:", {
            authorization: req.headers.authorization ? "Présent" : "Absent",
            "content-type": req.headers["content-type"]
        });
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            console.log("❌ Token d'accès manquant");
            return (0, apiResponse_1.unauthorized)(res, "Token d'accès requis");
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
            if (!decoded.userId || !decoded.email || !decoded.role || !decoded.tenantId) {
                console.log("❌ Token invalide - données manquantes:", decoded);
                return (0, apiResponse_1.unauthorized)(res, "Token invalide - données manquantes");
            }
            req.user = decoded;
            console.log("✅ Utilisateur authentifié:", {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                tenantId: decoded.tenantId
            });
            return next();
        }
        catch (jwtError) {
            console.error("❌ Erreur de vérification JWT:", {
                name: jwtError.name,
                message: jwtError.message
            });
            if (jwtError.name === 'TokenExpiredError') {
                return (0, apiResponse_1.unauthorized)(res, "Token expiré");
            }
            if (jwtError.name === 'JsonWebTokenError') {
                return (0, apiResponse_1.unauthorized)(res, "Token invalide");
            }
            return (0, apiResponse_1.unauthorized)(res, "Erreur d'authentification");
        }
    }
    catch (error) {
        console.error("❌ ERREUR CRITIQUE dans le middleware d'authentification:", {
            error: error?.message,
            stack: error?.stack
        });
        return (0, apiResponse_1.unauthorized)(res, "Erreur d'authentification");
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                console.log("❌ Authentification requise pour les rôles:", roles);
                return (0, apiResponse_1.unauthorized)(res, "Authentification requise");
            }
            if (!roles.includes(req.user.role)) {
                console.log("❌ Permissions insuffisantes:", {
                    userRole: req.user.role,
                    requiredRoles: roles
                });
                return (0, apiResponse_1.unauthorized)(res, "Permissions insuffisantes");
            }
            console.log("✅ Permissions validées pour le rôle:", req.user.role);
            return next();
        }
        catch (error) {
            console.error("❌ ERREUR CRITIQUE dans le middleware de rôles:", {
                error: error?.message,
                stack: error?.stack
            });
            return (0, apiResponse_1.unauthorized)(res, "Erreur de vérification des permissions");
        }
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)(["admin"]);
exports.requireAdminOrCoach = (0, exports.requireRole)(["admin", "coach"]);
//# sourceMappingURL=auth.middleware.js.map