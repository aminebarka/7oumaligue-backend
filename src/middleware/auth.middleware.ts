import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { unauthorized } from "../utils/apiResponse"

interface JwtPayload {
  userId: number
  email: string
  role: string
  tenantId: number
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("🔐 Vérification d'authentification pour:", req.path);
    console.log("Headers:", {
      authorization: req.headers.authorization ? "Présent" : "Absent",
      "content-type": req.headers["content-type"]
    });

    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      console.log("❌ Token d'accès manquant");
      return unauthorized(res, "Token d'accès requis")
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload
      
      // Vérifier que le token contient les données requises
      if (!decoded.userId || !decoded.email || !decoded.role || !decoded.tenantId) {
        console.log("❌ Token invalide - données manquantes:", decoded);
        return unauthorized(res, "Token invalide - données manquantes")
      }

      req.user = decoded
      console.log("✅ Utilisateur authentifié:", {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        tenantId: decoded.tenantId
      });
      
      return next()
    } catch (jwtError: any) {
      console.error("❌ Erreur de vérification JWT:", {
        name: jwtError.name,
        message: jwtError.message
      });
      
      if (jwtError.name === 'TokenExpiredError') {
        return unauthorized(res, "Token expiré")
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return unauthorized(res, "Token invalide")
      }
      
      return unauthorized(res, "Erreur d'authentification")
    }
  } catch (error: any) {
    console.error("❌ ERREUR CRITIQUE dans le middleware d'authentification:", {
      error: error?.message,
      stack: error?.stack
    });
    
    // Ne pas faire tomber le serveur, retourner une erreur d'authentification
    return unauthorized(res, "Erreur d'authentification")
  }
}

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        console.log("❌ Authentification requise pour les rôles:", roles);
        return unauthorized(res, "Authentification requise")
      }

      if (!roles.includes(req.user.role)) {
        console.log("❌ Permissions insuffisantes:", {
          userRole: req.user.role,
          requiredRoles: roles
        });
        return unauthorized(res, "Permissions insuffisantes")
      }

      console.log("✅ Permissions validées pour le rôle:", req.user.role);
      return next()
    } catch (error: any) {
      console.error("❌ ERREUR CRITIQUE dans le middleware de rôles:", {
        error: error?.message,
        stack: error?.stack
      });
      
      return unauthorized(res, "Erreur de vérification des permissions")
    }
  }
}

export const requireAdmin = requireRole(["admin"])
export const requireAdminOrCoach = requireRole(["admin", "coach"])
