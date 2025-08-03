import jwt from "jsonwebtoken"

interface JwtPayload {
  userId: number
  email: string
  role: string
  tenantId: number
}

export const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET || "your-secret-key"
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d"

  // @ts-ignore - Ignorer les erreurs de types pour jwt.sign
  return jwt.sign(payload, secret, { expiresIn })
}

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET || "your-secret-key"
  
  // @ts-ignore - Ignorer les erreurs de types pour jwt.verify
  return jwt.verify(token, secret) as JwtPayload
}

export const refreshToken = (token: string): string => {
  const decoded = verifyToken(token)
  return generateToken({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    tenantId: decoded.tenantId,
  })
} 