import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../config/database"
import { success, created, badRequest, unauthorized } from "../utils/apiResponse"

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return badRequest(res, "Un utilisateur avec cet email existe déjà")
    }

    // Hasher le mot de passe
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Créer un tenant par défaut pour le nouvel utilisateur
    const tenant = await prisma.tenant.create({
      data: {
        name: `${name}'s Organization`,
      },
    })

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin", // Premier utilisateur est admin
        tenantId: tenant.id,
      },
    })

    // Générer le token JWT
    // @ts-ignore - Ignorer les erreurs de types pour jwt.sign
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    )

    // Retourner les données utilisateur (sans le mot de passe)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    }

    return created(res, { user: userData, token }, "Compte créé avec succès")
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return badRequest(res, "Erreur lors de la création du compte")
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    })

    if (!user) {
      return unauthorized(res, "Email ou mot de passe incorrect")
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return unauthorized(res, "Email ou mot de passe incorrect")
    }

    // Générer le token JWT
    // @ts-ignore - Ignorer les erreurs de types pour jwt.sign
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    )

    // Retourner les données utilisateur (sans le mot de passe)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    }

    return success(res, { user: userData, token }, "Connexion réussie")
  } catch (error) {
    console.error("Erreur lors de la connexion:", error)
    return badRequest(res, "Erreur lors de la connexion")
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return unauthorized(res, "Token invalide")
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
    })

    if (!user) {
      return unauthorized(res, "Utilisateur non trouvé")
    }

    return success(res, user)
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return badRequest(res, "Erreur lors de la récupération du profil")
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  const { name, email } = req.body
  const userId = req.user?.userId

  try {
    if (!userId) {
      return unauthorized(res, "Token invalide")
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      })

      if (existingUser) {
        return badRequest(res, "Cet email est déjà utilisé")
      }
    }

    const updatedUser = await prisma.user.update({
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
    })

    return success(res, updatedUser, "Profil mis à jour avec succès")
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return badRequest(res, "Erreur lors de la mise à jour du profil")
  }
}

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body
  const userId = req.user?.userId

  try {
    if (!userId) {
      return unauthorized(res, "Token invalide")
    }

    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return unauthorized(res, "Utilisateur non trouvé")
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isCurrentPasswordValid) {
      return badRequest(res, "Mot de passe actuel incorrect")
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    })

    return success(res, null, "Mot de passe modifié avec succès")
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error)
    return badRequest(res, "Erreur lors du changement de mot de passe")
  }
}
