"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.deleteUser = exports.updateUserRole = exports.getAllUsers = exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const jwt_simple_1 = require("../config/jwt-simple");
const apiResponse_1 = require("../utils/apiResponse");
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
console.log("🔧 Initialisation des routes d'authentification...");
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
        return (0, apiResponse_1.created)(res, "Compte créé avec succès", { user: userData, token });
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
        return (0, apiResponse_1.success)(res, "Connexion réussie", { user: userData, token });
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
        return (0, apiResponse_1.success)(res, "Profil récupéré avec succès", user);
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
        return (0, apiResponse_1.success)(res, "Profil mis à jour avec succès", updatedUser);
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
        return (0, apiResponse_1.success)(res, "Mot de passe modifié avec succès", null);
    }
    catch (error) {
        console.error("Erreur lors du changement de mot de passe:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors du changement de mot de passe");
    }
};
exports.changePassword = changePassword;
const getAllUsers = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return (0, apiResponse_1.unauthorized)(res, "Accès non autorisé");
        }
        const users = await database_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        socialPosts: true,
                        teamFans: true,
                        players: true,
                        teams: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return (0, apiResponse_1.success)(res, "Utilisateurs récupérés avec succès", users);
    }
    catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des utilisateurs");
    }
};
exports.getAllUsers = getAllUsers;
const updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    try {
        if (req.user?.role !== 'admin') {
            return (0, apiResponse_1.unauthorized)(res, "Accès non autorisé");
        }
        const validRoles = ['player', 'coach', 'admin'];
        if (!validRoles.includes(role)) {
            return (0, apiResponse_1.badRequest)(res, "Rôle invalide");
        }
        if (parseInt(userId) === req.user?.userId && role !== 'admin') {
            return (0, apiResponse_1.badRequest)(res, "Vous ne pouvez pas modifier votre propre rôle d'administrateur");
        }
        const updatedUser = await database_1.prisma.user.update({
            where: { id: parseInt(userId) },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        return (0, apiResponse_1.success)(res, "Rôle utilisateur mis à jour avec succès", updatedUser);
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour du rôle:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la mise à jour du rôle");
    }
};
exports.updateUserRole = updateUserRole;
const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        if (req.user?.role !== 'admin') {
            return (0, apiResponse_1.unauthorized)(res, "Accès non autorisé");
        }
        if (parseInt(userId) === req.user?.userId) {
            return (0, apiResponse_1.badRequest)(res, "Vous ne pouvez pas supprimer votre propre compte");
        }
        await database_1.prisma.user.delete({
            where: { id: parseInt(userId) }
        });
        return (0, apiResponse_1.success)(res, "Utilisateur supprimé avec succès", null);
    }
    catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la suppression de l'utilisateur");
    }
};
exports.deleteUser = deleteUser;
const getUserStats = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return (0, apiResponse_1.unauthorized)(res, "Accès non autorisé");
        }
        const [totalUsers, playerCount, coachCount, adminCount, recentUsers] = await Promise.all([
            database_1.prisma.user.count(),
            database_1.prisma.user.count({ where: { role: 'player' } }),
            database_1.prisma.user.count({ where: { role: 'coach' } }),
            database_1.prisma.user.count({ where: { role: 'admin' } }),
            database_1.prisma.user.findMany({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            })
        ]);
        const stats = {
            total: totalUsers,
            byRole: {
                players: playerCount,
                coaches: coachCount,
                admins: adminCount
            },
            recentUsers
        };
        return (0, apiResponse_1.success)(res, "Statistiques utilisateurs récupérées avec succès", stats);
    }
    catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        return (0, apiResponse_1.badRequest)(res, "Erreur lors de la récupération des statistiques");
    }
};
exports.getUserStats = getUserStats;
router.post("/register", exports.register);
router.post("/login", exports.login);
router.get("/profile", exports.getProfile);
router.put("/profile", exports.updateProfile);
router.put("/change-password", exports.changePassword);
console.log("🔧 Enregistrement des routes de gestion des utilisateurs...");
router.get("/users", auth_middleware_1.authenticateToken, exports.getAllUsers);
console.log("✅ Route GET /users enregistrée");
router.get("/users/stats", auth_middleware_1.authenticateToken, exports.getUserStats);
console.log("✅ Route GET /users/stats enregistrée");
router.put("/users/:userId/role", auth_middleware_1.authenticateToken, exports.updateUserRole);
console.log("✅ Route PUT /users/:userId/role enregistrée");
router.delete("/users/:userId", auth_middleware_1.authenticateToken, exports.deleteUser);
console.log("✅ Route DELETE /users/:userId enregistrée");
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
router.get("/test-db", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        console.log("🔍 Test de la base de données...");
        const userCount = await database_1.prisma.user.count();
        console.log("✅ Nombre d'utilisateurs:", userCount);
        const testUser = await database_1.prisma.user.findFirst({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        console.log("✅ Utilisateur de test:", testUser);
        return res.json({
            success: true,
            message: "Test de base de données réussi",
            data: {
                userCount,
                testUser,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error("❌ Erreur lors du test de base de données:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors du test de base de données",
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map