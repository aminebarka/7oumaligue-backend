import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err }
  error.message = err.message

  // Log error with more details
  logger.error(`Error ${err.name}: ${err.message}`)
  logger.error(`Stack trace: ${err.stack}`)
  logger.error(`Request URL: ${req.url}`)
  logger.error(`Request method: ${req.method}`)
  logger.error(`User: ${req.user ? JSON.stringify(req.user) : 'Not authenticated'}`)

  // Empêcher le serveur de tomber sur les erreurs non critiques
  try {
    // Mongoose bad ObjectId
    if (err.name === "CastError") {
      const message = "Resource not found"
      error = { name: "CastError", message, statusCode: 404 } as AppError
    }

    // Mongoose duplicate key
    if (err.name === "MongoError" && (err as any).code === 11000) {
      const message = "Duplicate field value entered"
      error = { name: "DuplicateError", message, statusCode: 400 } as AppError
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
      const message = Object.values((err as any).errors)
        .map((val: any) => val.message)
        .join(", ")
      error = { name: "ValidationError", message, statusCode: 400 } as AppError
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
      const message = "Invalid token"
      error = { name: "JsonWebTokenError", message, statusCode: 401 } as AppError
    }

    if (err.name === "TokenExpiredError") {
      const message = "Token expired"
      error = { name: "TokenExpiredError", message, statusCode: 401 } as AppError
    }

    // Prisma errors - Improved handling
    if (err.name === "PrismaClientKnownRequestError") {
      const prismaError = err as any
      let message = "Database operation failed"
      
      // Handle specific Prisma error codes
      switch (prismaError.code) {
        case 'P2002':
          message = "Une valeur en double a été détectée"
          break
        case 'P2003':
          message = "Référence invalide dans la base de données"
          break
        case 'P2025':
          message = "Enregistrement non trouvé"
          break
        case 'P2014':
          message = "Violation de contrainte de clé étrangère"
          break
        default:
          message = `Erreur de base de données: ${prismaError.code}`
      }
      
      error = { name: "DatabaseError", message, statusCode: 400 } as AppError
    }

    if (err.name === "PrismaClientValidationError") {
      const message = "Données invalides pour l'opération"
      error = { name: "ValidationError", message, statusCode: 400 } as AppError
    }

    if (err.name === "PrismaClientInitializationError") {
      const message = "Erreur de connexion à la base de données"
      error = { name: "DatabaseConnectionError", message, statusCode: 500 } as AppError
    }

    // Handle unhandled errors
    if (!error.statusCode) {
      error.statusCode = 500
      error.message = "Erreur interne du serveur"
    }

    // Envoyer la réponse d'erreur
    res.status(error.statusCode).json({
      success: false,
      error: error.message || "Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })

  } catch (handlerError: any) {
    // Si le gestionnaire d'erreurs lui-même échoue, envoyer une réponse d'erreur générique
    console.error("❌ ERREUR CRITIQUE dans le gestionnaire d'erreurs:", handlerError);
    
    res.status(500).json({
      success: false,
      error: "Erreur interne du serveur",
    })
  }
}

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next)
