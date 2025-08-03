"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const generateToken = (payload) => {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    }
    catch (error) {
        logger_1.logger.error("Error generating JWT token:", error);
        throw new Error("Failed to generate authentication token");
    }
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch (error) {
        logger_1.logger.error("Error verifying JWT token:", error);
        throw new Error("Invalid or expired token");
    }
};
exports.verifyToken = verifyToken;
const refreshToken = (token) => {
    try {
        const decoded = (0, exports.verifyToken)(token);
        return (0, exports.generateToken)({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            tenantId: decoded.tenantId,
        });
    }
    catch (error) {
        logger_1.logger.error("Error refreshing JWT token:", error);
        throw new Error("Failed to refresh token");
    }
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=jwt.js.map