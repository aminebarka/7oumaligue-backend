"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const jwt_simple_1 = require("../config/jwt-simple");
const apiResponse_1 = require("../utils/apiResponse");
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const validateRegistrationData = (data) => {
    const errors = [];
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
        errors.push("Le nom doit contenir au moins 2 caractères");
    }
    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
        errors.push("Email invalide");
    }
    if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
        errors.push("Le mot de passe doit contenir au moins 6 caractères");
    }
    return errors;
};
const register = async (req, res) => {
    console.log("🔍 Début de l'inscription avec les données:", req.body);
    const validationErrors = validateRegistrationData(req.body);
    if (validationErrors.length > 0) {
        console.error("❌ Erreurs de validation:", validationErrors);
        return (0, apiResponse_1.badRequest)(res, validationErrors.join(", "));
    }
    const { name, email, password, role = "player" } = req.body;
    try {
        console.log("🔍 Vérification de l'existence de l'utilisateur...");
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            console.error("❌ Utilisateur existe déjà:", email);
            return (0, apiResponse_1.badRequest)(res, "Un utilisateur avec cet email existe déjà");
        }
        console.log("🔍 Hachage du mot de passe...");
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        console.log("🔍 Création du tenant...");
        const tenant = await database_1.prisma.tenant.create({
            data: {
                name: `${name}'s Organization`,
            },
        });
        console.log("🔍 Création de l'utilisateur...");
        const user = await database_1.prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase(),
                password: hashedPassword,
                role: role,
                tenantId: tenant.id,
            },
        });
        console.log("🔍 Génération du token JWT...");
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
        const token = (0, jwt_simple_1.generateToken)(payload);
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
        console.log("✅ Inscription réussie pour:", email, "avec le rôle:", user.role);
        return (0, apiResponse_1.created)(res, { user: userData, token }, "Compte créé avec succès");
    }
    catch (error) {
        console.error("❌ Erreur lors de l'inscription:", error);
        console.error("❌ Détails de l'erreur:", {
            message: error?.message,
            code: error?.code,
            meta: error?.meta
        });
        return (0, apiResponse_1.badRequest)(res, `Erreur lors de la création du compte: ${error?.message || 'Erreur inconnue'}`);
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return (0, apiResponse_1.badRequest)(res, "Email et mot de passe requis");
    }
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
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
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
        const token = (0, jwt_simple_1.generateToken)(payload);
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
                    email: email.toLowerCase(),
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
                ...(name && { name: name.trim() }),
                ...(email && { email: email.toLowerCase() }),
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
        if (!currentPassword || !newPassword) {
            return (0, apiResponse_1.badRequest)(res, "Ancien et nouveau mot de passe requis");
        }
        if (newPassword.length < 6) {
            return (0, apiResponse_1.badRequest)(res, "Le nouveau mot de passe doit contenir au moins 6 caractères");
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
router.get("/debug", auth_middleware_1.authenticateToken, (req, res) => {
    console.log("🔍 Debug - Informations d'authentification:", {
        userId: req.user?.userId,
        email: req.user?.email,
        role: req.user?.role,
        tenantId: req.user?.tenantId,
        headers: req.headers,
        timestamp: new Date().toISOString()
    });
    return res.json({
        success: true,
        message: "Debug info",
        data: {
            user: {
                id: req.user?.userId,
                email: req.user?.email,
                role: req.user?.role,
                tenantId: req.user?.tenantId
            },
            permissions: {
                canCreateTournament: req.user?.role === 'admin' || req.user?.role === 'coach',
                canDeleteTournament: req.user?.role === 'admin',
                canManageUsers: req.user?.role === 'admin'
            },
            timestamp: new Date().toISOString()
        }
    });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map