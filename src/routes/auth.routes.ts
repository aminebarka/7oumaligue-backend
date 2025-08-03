import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import { generateToken } from "../config/jwt-simple";
import { success, created, badRequest, unauthorized } from "../utils/apiResponse";
import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

// Validation des données d'inscription
const validateRegistrationData = (data: any) => {
  const errors: string[] = [];
  
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

export const register = async (req: Request, res: Response) => {
  console.log("🔍 Début de l'inscription avec les données:", req.body);
  
  // Validation des données d'entrée
  const validationErrors = validateRegistrationData(req.body);
  if (validationErrors.length > 0) {
    console.error("❌ Erreurs de validation:", validationErrors);
    return badRequest(res, validationErrors.join(", "));
  }

  const { name, email, password, role = "player" } = req.body;

  try {
    console.log("🔍 Vérification de l'existence de l'utilisateur...");
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.error("❌ Utilisateur existe déjà:", email);
      return badRequest(res, "Un utilisateur avec cet email existe déjà");
    }

    console.log("🔍 Hachage du mot de passe...");
    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("🔍 Création du tenant...");
    // Créer un tenant par défaut pour le nouvel utilisateur
    const tenant = await prisma.tenant.create({
      data: {
        name: `${name}'s Organization`,
      },
    });

    console.log("🔍 Création de l'utilisateur...");
    // Créer l'utilisateur avec le rôle spécifié
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role, // Utiliser le rôle spécifié au lieu de forcer "admin"
        tenantId: tenant.id,
      },
    });

    console.log("🔍 Génération du token JWT...");
    // Générer le token JWT avec la fonction appropriée
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    
    const token = generateToken(payload);

    // Retourner les données utilisateur (sans le mot de passe)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    console.log("✅ Inscription réussie pour:", email, "avec le rôle:", user.role);
    return created(res, { user: userData, token }, "Compte créé avec succès");
  } catch (error: any) {
    console.error("❌ Erreur lors de l'inscription:", error);
    console.error("❌ Détails de l'erreur:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    });
    return badRequest(res, `Erreur lors de la création du compte: ${error?.message || 'Erreur inconnue'}`);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validation des données de connexion
  if (!email || !password) {
    return badRequest(res, "Email et mot de passe requis");
  }

  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      return unauthorized(res, "Email ou mot de passe incorrect");
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return unauthorized(res, "Email ou mot de passe incorrect");
    }

    // Générer le token JWT avec la fonction appropriée
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    
    const token = generateToken(payload);

    // Retourner les données utilisateur (sans le mot de passe)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return success(res, { user: userData, token }, "Connexion réussie");
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return badRequest(res, "Erreur lors de la connexion");
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return unauthorized(res, "Token invalide");
    }

    const user = await prisma.user.findUnique({
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
      return unauthorized(res, "Utilisateur non trouvé");
    }

    return success(res, user);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return badRequest(res, "Erreur lors de la récupération du profil");
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return unauthorized(res, "Token invalide");
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return badRequest(res, "Cet email est déjà utilisé");
      }
    }

    const updatedUser = await prisma.user.update({
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

    return success(res, updatedUser, "Profil mis à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return badRequest(res, "Erreur lors de la mise à jour du profil");
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return unauthorized(res, "Token invalide");
    }

    if (!currentPassword || !newPassword) {
      return badRequest(res, "Ancien et nouveau mot de passe requis");
    }

    if (newPassword.length < 6) {
      return badRequest(res, "Le nouveau mot de passe doit contenir au moins 6 caractères");
    }

    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return unauthorized(res, "Utilisateur non trouvé");
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return badRequest(res, "Mot de passe actuel incorrect");
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return success(res, null, "Mot de passe modifié avec succès");
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    return badRequest(res, "Erreur lors du changement de mot de passe");
  }
};

// Routes
router.post("/register", register);
router.post("/login", login);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

// Endpoint de debug pour vérifier l'authentification
router.get("/debug", authenticateToken, (req: Request, res: Response) => {
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

export default router;