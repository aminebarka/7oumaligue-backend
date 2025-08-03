"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminOrCoach = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiResponse_1 = require("../utils/apiResponse");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return (0, apiResponse_1.unauthorized)(res, "Token d'accès requis");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
        req.user = decoded;
        return next();
    }
    catch (error) {
        console.error("Erreur de vérification du token:", error);
        return (0, apiResponse_1.unauthorized)(res, "Token invalide");
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, apiResponse_1.unauthorized)(res, "Authentification requise");
        }
        if (!roles.includes(req.user.role)) {
            return (0, apiResponse_1.unauthorized)(res, "Permissions insuffisantes");
        }
        return next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)(["admin"]);
exports.requireAdminOrCoach = (0, exports.requireRole)(["admin", "coach"]);
//# sourceMappingURL=auth.middleware.js.map