import jwt from "jsonwebtoken"
import { logger } from "../utils/logger"

interface JwtPayload {
  userId: number
  email: string
  role: string
  tenantId: number
}

export const generateToken = (payload: JwtPayload): string => {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables")
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "7d"

    // Utiliser une approche plus simple pour éviter les problèmes de types
    // @ts-ignore - Ignorer les erreurs de types pour jwt.sign
    const token = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId
      },
      secret,
      { expiresIn }
    )

    return token
  } catch (error) {
    logger.error("Error generating JWT token:", error)
    throw new Error("Failed to generate authentication token")
  }
}

export const verifyToken = (token: string): JwtPayload => {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables")
    }

    const decoded = jwt.verify(token, secret) as JwtPayload
    return decoded
  } catch (error) {
    logger.error("Error verifying JWT token:", error)
    throw new Error("Invalid or expired token")
  }
}

export const refreshToken = (token: string): string => {
  try {
    const decoded = verifyToken(token)

    // Generate new token with same payload
    return generateToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
    })
  } catch (error) {
    logger.error("Error refreshing JWT token:", error)
    throw new Error("Failed to refresh token")
  }
}
