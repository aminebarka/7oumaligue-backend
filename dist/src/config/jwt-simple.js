"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
const refreshToken = (token) => {
    const decoded = (0, exports.verifyToken)(token);
    return (0, exports.generateToken)({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        tenantId: decoded.tenantId,
    });
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=jwt-simple.js.map