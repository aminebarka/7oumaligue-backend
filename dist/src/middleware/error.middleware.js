"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    logger_1.logger.error(`Error ${err.name}: ${err.message}`);
    logger_1.logger.error(`Stack trace: ${err.stack}`);
    logger_1.logger.error(`Request URL: ${req.url}`);
    logger_1.logger.error(`Request method: ${req.method}`);
    logger_1.logger.error(`User: ${req.user ? JSON.stringify(req.user) : 'Not authenticated'}`);
    try {
        if (err.name === "CastError") {
            const message = "Resource not found";
            error = { name: "CastError", message, statusCode: 404 };
        }
        if (err.name === "MongoError" && err.code === 11000) {
            const message = "Duplicate field value entered";
            error = { name: "DuplicateError", message, statusCode: 400 };
        }
        if (err.name === "ValidationError") {
            const message = Object.values(err.errors)
                .map((val) => val.message)
                .join(", ");
            error = { name: "ValidationError", message, statusCode: 400 };
        }
        if (err.name === "JsonWebTokenError") {
            const message = "Invalid token";
            error = { name: "JsonWebTokenError", message, statusCode: 401 };
        }
        if (err.name === "TokenExpiredError") {
            const message = "Token expired";
            error = { name: "TokenExpiredError", message, statusCode: 401 };
        }
        if (err.name === "PrismaClientKnownRequestError") {
            const prismaError = err;
            let message = "Database operation failed";
            switch (prismaError.code) {
                case 'P2002':
                    message = "Une valeur en double a été détectée";
                    break;
                case 'P2003':
                    message = "Référence invalide dans la base de données";
                    break;
                case 'P2025':
                    message = "Enregistrement non trouvé";
                    break;
                case 'P2014':
                    message = "Violation de contrainte de clé étrangère";
                    break;
                default:
                    message = `Erreur de base de données: ${prismaError.code}`;
            }
            error = { name: "DatabaseError", message, statusCode: 400 };
        }
        if (err.name === "PrismaClientValidationError") {
            const message = "Données invalides pour l'opération";
            error = { name: "ValidationError", message, statusCode: 400 };
        }
        if (err.name === "PrismaClientInitializationError") {
            const message = "Erreur de connexion à la base de données";
            error = { name: "DatabaseConnectionError", message, statusCode: 500 };
        }
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message = "Erreur interne du serveur";
        }
        res.status(error.statusCode).json({
            success: false,
            error: error.message || "Server Error",
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        });
    }
    catch (handlerError) {
        console.error("❌ ERREUR CRITIQUE dans le gestionnaire d'erreurs:", handlerError);
        res.status(500).json({
            success: false,
            error: "Erreur interne du serveur",
        });
    }
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.middleware.js.map