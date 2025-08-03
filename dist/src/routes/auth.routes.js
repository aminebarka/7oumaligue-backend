"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return (0, apiResponse_1.badRequest)(res, "Un utilisateur avec cet email existe déjà");
        }
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        const tenant = await database_1.prisma.tenant.create({
            data: {
                name: `${name}'s Organization`,
            },
        });
        const user = await database_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "admin",
                tenantId: tenant.id,
            },
        });
        const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
        return (0, apiResponse_1.created)(res, { user: userData, token }, "Compte créé avec succès");
    }
    catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la création du compte");
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { email },
            include: {
                tenant: true,
            },
        });
        if (!user) {
            return (0, apiResponse_1.unauthorized)(res, "Email ou mot de passe incorrect");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return (0, apiResponse_1.unauthorized)(res, "Email ou mot de passe incorrect");
        }
        const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
        return (0, apiResponse_1.success)(res, { user: userData, token }, "Connexion réussie");
    }
    catch (error) {
        console.error("Erreur lors de la connexion:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la connexion");
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return (0, apiResponse_1.unauthorized)(res, "Token invalide");
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return (0, apiResponse_1.unauthorized)(res, "Utilisateur non trouvé");
        }
        return (0, apiResponse_1.success)(res, user);
    }
    catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération du profil");
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    const { name, email } = req.body;
    const userId = req.user?.userId;
    try {
        if (!userId) {
            return (0, apiResponse_1.unauthorized)(res, "Token invalide");
        }
        if (email) {
            const existingUser = await database_1.prisma.user.findFirst({
                where: {
                    email,
                    NOT: { id: userId },
                },
            });
            if (existingUser) {
                return (0, apiResponse_1.badRequest)(res, "Cet email est déjà utilisé");
            }
        }
        const updatedUser = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return (0, apiResponse_1.success)(res, updatedUser, "Profil mis à jour avec succès");
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour du profil");
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;
    try {
        if (!userId) {
            return (0, apiResponse_1.unauthorized)(res, "Token invalide");
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return (0, apiResponse_1.unauthorized)(res, "Utilisateur non trouvé");
        }
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return (0, apiResponse_1.badRequest)(res, "Mot de passe actuel incorrect");
        }
        const saltRounds = 12;
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        return (0, apiResponse_1.success)(res, null, "Mot de passe modifié avec succès");
    }
    catch (error) {
        console.error("Erreur lors du changement de mot de passe:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors du changement de mot de passe");
    }
};
exports.changePassword = changePassword;
router.post("/register", exports.register);
router.post("/login", exports.login);
router.get("/profile", exports.getProfile);
router.put("/profile", exports.updateProfile);
router.put("/change-password", exports.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map