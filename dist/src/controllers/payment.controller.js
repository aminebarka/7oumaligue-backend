"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const client_1 = require("@prisma/client");
const apiResponse_1 = require("../utils/apiResponse");
const prisma = new client_1.PrismaClient();
class PaymentController {
    static async createPayment(req, res) {
        try {
            const { tournamentId, teamId, amount, paymentMethod, playerCount, organizerId } = req.body;
            const tournament = await prisma.tournament.findUnique({
                where: { id: tournamentId }
            });
            if (!tournament) {
                return (0, apiResponse_1.notFound)(res, 'Tournoi non trouvé');
            }
            const team = await prisma.team.findUnique({
                where: { id: teamId }
            });
            if (!team) {
                return (0, apiResponse_1.notFound)(res, 'Équipe non trouvée');
            }
            const commission = amount * 0.05;
            const netAmount = amount - commission;
            const transaction = await prisma.paymentTransaction.create({
                data: {
                    tournamentId,
                    teamId,
                    amount,
                    commission,
                    netAmount,
                    paymentMethod,
                    playerCount,
                    organizerId,
                    status: 'pending',
                    transactionId: this.generateTransactionId()
                }
            });
            let paymentUrl = '';
            let paymentData = {};
            switch (paymentMethod) {
                case 'flouci':
                    paymentUrl = await this.generateFlouciPayment(transaction);
                    break;
                case 'd17':
                    paymentUrl = await this.generateD17Payment(transaction);
                    break;
                case 'card':
                    paymentUrl = await this.generateCardPayment(transaction);
                    break;
                case 'cash':
                    await prisma.paymentTransaction.update({
                        where: { id: transaction.id },
                        data: { status: 'completed' }
                    });
                    break;
            }
            return (0, apiResponse_1.success)(res, 'Demande de paiement créée avec succès', {
                transactionId: transaction.transactionId,
                paymentUrl,
                amount,
                commission,
                netAmount
            });
        }
        catch (error) {
            console.error('Erreur lors de la création du paiement:', error);
            return error(res, 'Erreur lors de la création du paiement');
        }
    }
    static async checkPaymentStatus(req, res) {
        try {
            const { transactionId } = req.params;
            const transaction = await prisma.paymentTransaction.findFirst({
                where: { transactionId },
                include: {
                    tournament: true,
                    team: true
                }
            });
            if (!transaction) {
                return (0, apiResponse_1.notFound)(res, 'Transaction non trouvée');
            }
            return (0, apiResponse_1.success)(res, 'Statut du paiement récupéré avec succès', {
                transactionId: transaction.transactionId,
                status: transaction.status,
                amount: transaction.amount,
                paymentMethod: transaction.paymentMethod,
                tournament: transaction.tournament,
                team: transaction.team,
                createdAt: transaction.createdAt
            });
        }
        catch (error) {
            console.error('Erreur lors de la vérification du paiement:', error);
            return error(res, 'Erreur lors de la vérification du paiement');
        }
    }
    static async paymentWebhook(req, res) {
        try {
            const { transactionId, status, paymentData } = req.body;
            if (!this.verifyWebhookSignature(req)) {
                return res.status(401).json({ error: 'Signature invalide' });
            }
            const transaction = await prisma.paymentTransaction.findFirst({
                where: { transactionId }
            });
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction non trouvée' });
            }
            await prisma.paymentTransaction.update({
                where: { id: transaction.id },
                data: {
                    status: status === 'success' ? 'completed' : 'failed',
                    paymentData: JSON.stringify(paymentData),
                    completedAt: status === 'success' ? new Date() : null
                }
            });
            if (status === 'success') {
                await this.registerTeamToTournament(transaction);
            }
            return res.json({ success: true });
        }
        catch (error) {
            console.error('Erreur dans le webhook de paiement:', error);
            return res.status(500).json({ error: 'Erreur interne' });
        }
    }
    static async getPaymentStats(req, res) {
        try {
            const { organizerId } = req.params;
            const { startDate, endDate } = req.query;
            const whereClause = {
                organizerId: parseInt(organizerId)
            };
            if (startDate && endDate) {
                whereClause.createdAt = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }
            const transactions = await prisma.paymentTransaction.findMany({
                where: whereClause,
                include: {
                    tournament: true,
                    team: true
                }
            });
            const stats = {
                totalTransactions: transactions.length,
                totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
                totalCommission: transactions.reduce((sum, t) => sum + t.commission, 0),
                completedTransactions: transactions.filter((t) => t.status === 'completed').length,
                pendingTransactions: transactions.filter((t) => t.status === 'pending').length,
                failedTransactions: transactions.filter((t) => t.status === 'failed').length,
                paymentMethods: this.groupByPaymentMethod(transactions),
                monthlyStats: this.getMonthlyStats(transactions)
            };
            return (0, apiResponse_1.success)(res, 'Statistiques récupérées avec succès', stats);
        }
        catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            return error(res, 'Erreur lors de la récupération des statistiques');
        }
    }
    static generateTransactionId() {
        return `7OUMA_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    static async generateFlouciPayment(transaction) {
        const flouciData = {
            amount: transaction.amount,
            currency: 'TND',
            description: `Inscription ${transaction.teamId} - ${transaction.tournamentId}`,
            callback_url: `${process.env.API_URL}/api/payments/webhook`,
            return_url: `${process.env.FRONTEND_URL}/payment/success/${transaction.transactionId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel/${transaction.transactionId}`,
            transaction_id: transaction.transactionId
        };
        return `https://flouci.com/pay/${transaction.transactionId}`;
    }
    static async generateD17Payment(transaction) {
        const d17Data = {
            amount: transaction.amount,
            currency: 'TND',
            description: `Inscription équipe - ${transaction.tournamentId}`,
            transaction_id: transaction.transactionId,
            callback_url: `${process.env.API_URL}/api/payments/webhook`
        };
        return `https://d17.tn/pay/${transaction.transactionId}`;
    }
    static async generateCardPayment(transaction) {
        const cardData = {
            amount: transaction.amount,
            currency: 'TND',
            description: `Inscription équipe - ${transaction.tournamentId}`,
            transaction_id: transaction.transactionId,
            callback_url: `${process.env.API_URL}/api/payments/webhook`
        };
        return `${process.env.API_URL}/api/payments/card/${transaction.transactionId}`;
    }
    static verifyWebhookSignature(req) {
        return true;
    }
    static async registerTeamToTournament(transaction) {
        try {
            const existingRegistration = await prisma.tournamentTeam.findFirst({
                where: {
                    tournamentId: transaction.tournamentId,
                    teamId: transaction.teamId
                }
            });
            if (!existingRegistration) {
                await prisma.tournamentTeam.create({
                    data: {
                        tournamentId: transaction.tournamentId,
                        teamId: transaction.teamId
                    }
                });
            }
            await this.sendPaymentNotification(transaction);
        }
        catch (error) {
            console.error('Erreur lors de l\'inscription de l\'équipe:', error);
        }
    }
    static async sendPaymentNotification(transaction) {
        console.log(`Notification: Paiement reçu pour l'équipe ${transaction.teamId} dans le tournoi ${transaction.tournamentId}`);
    }
    static groupByPaymentMethod(transactions) {
        return transactions.reduce((acc, transaction) => {
            const method = transaction.paymentMethod;
            acc[method] = (acc[method] || 0) + 1;
            return acc;
        }, {});
    }
    static getMonthlyStats(transactions) {
        const monthlyData = transactions.reduce((acc, transaction) => {
            const month = new Date(transaction.createdAt).toISOString().substr(0, 7);
            if (!acc[month]) {
                acc[month] = {
                    total: 0,
                    count: 0,
                    commission: 0
                };
            }
            acc[month].total += transaction.amount;
            acc[month].count += 1;
            acc[month].commission += transaction.commission;
            return acc;
        }, {});
        return Object.entries(monthlyData).map(([month, data]) => ({
            month,
            total: data.total,
            count: data.count,
            commission: data.commission
        }));
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map