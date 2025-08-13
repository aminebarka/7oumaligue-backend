import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { success, error, badRequest, notFound } from '../utils/apiResponse'

const prisma = new PrismaClient()

export interface PaymentRequest {
  tournamentId: string
  teamId: string
  amount: number
  paymentMethod: 'flouci' | 'd17' | 'card' | 'cash'
  playerCount: number
  organizerId: number
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  message: string
  error?: string
}

export class PaymentController {
  // Créer une demande de paiement
  static async createPayment(req: Request, res: Response) {
    try {
      const { tournamentId, teamId, amount, paymentMethod, playerCount, organizerId }: PaymentRequest = req.body

      // Vérifier que le tournoi existe
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId }
      })

      if (!tournament) {
        return notFound(res, 'Tournoi non trouvé')
      }

      // Vérifier que l'équipe existe
      const team = await prisma.team.findUnique({
        where: { id: teamId }
      })

      if (!team) {
        return notFound(res, 'Équipe non trouvée')
      }

      // Calculer les frais de commission (5% pour 7ouma Ligue)
      const commission = amount * 0.05
      const netAmount = amount - commission

      // Créer la transaction
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
      })

      // Générer l'URL de paiement selon la méthode
      let paymentUrl = ''
      let paymentData = {}

      switch (paymentMethod) {
        case 'flouci':
          paymentUrl = await this.generateFlouciPayment(transaction)
          break
        case 'd17':
          paymentUrl = await this.generateD17Payment(transaction)
          break
        case 'card':
          paymentUrl = await this.generateCardPayment(transaction)
          break
        case 'cash':
          // Pour les paiements en espèces, marquer comme payé
          await prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: { status: 'completed' }
          })
          break
      }

      return success(res, 'Demande de paiement créée avec succès', {
        transactionId: transaction.transactionId,
        paymentUrl,
        amount,
        commission,
        netAmount
      })

    } catch (error: any) {
      console.error('Erreur lors de la création du paiement:', error)
      return error(res, 'Erreur lors de la création du paiement')
    }
  }

  // Vérifier le statut d'un paiement
  static async checkPaymentStatus(req: Request, res: Response) {
    try {
      const { transactionId } = req.params

      const transaction = await prisma.paymentTransaction.findFirst({
        where: { transactionId },
        include: {
          tournament: true,
          team: true
        }
      })

      if (!transaction) {
        return notFound(res, 'Transaction non trouvée')
      }

      return success(res, 'Statut du paiement récupéré avec succès', {
        transactionId: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        tournament: transaction.tournament,
        team: transaction.team,
        createdAt: transaction.createdAt
      })

    } catch (error: any) {
      console.error('Erreur lors de la vérification du paiement:', error)
      return error(res, 'Erreur lors de la vérification du paiement')
    }
  }

  // Webhook pour les notifications de paiement
  static async paymentWebhook(req: Request, res: Response) {
    try {
      const { transactionId, status, paymentData } = req.body

      // Vérifier la signature du webhook (sécurité)
      if (!this.verifyWebhookSignature(req)) {
        return res.status(401).json({ error: 'Signature invalide' })
      }

      const transaction = await prisma.paymentTransaction.findFirst({
        where: { transactionId }
      })

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction non trouvée' })
      }

      // Mettre à jour le statut
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: status === 'success' ? 'completed' : 'failed',
          paymentData: JSON.stringify(paymentData),
          completedAt: status === 'success' ? new Date() : null
        }
      })

      // Si le paiement est réussi, inscrire l'équipe au tournoi
      if (status === 'success') {
        await this.registerTeamToTournament(transaction)
      }

      return res.json({ success: true })

    } catch (error) {
      console.error('Erreur dans le webhook de paiement:', error)
      return res.status(500).json({ error: 'Erreur interne' })
    }
  }

  // Obtenir les statistiques de paiement pour un organisateur
  static async getPaymentStats(req: Request, res: Response) {
    try {
      const { organizerId } = req.params
      const { startDate, endDate } = req.query

      const whereClause: any = {
        organizerId: parseInt(organizerId)
      }

      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      }

      const transactions = await prisma.paymentTransaction.findMany({
        where: whereClause,
        include: {
          tournament: true,
          team: true
        }
      })

      const stats = {
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum: number, t: any) => sum + t.amount, 0),
        totalCommission: transactions.reduce((sum: number, t: any) => sum + t.commission, 0),
        completedTransactions: transactions.filter((t: any) => t.status === 'completed').length,
        pendingTransactions: transactions.filter((t: any) => t.status === 'pending').length,
        failedTransactions: transactions.filter((t: any) => t.status === 'failed').length,
        paymentMethods: this.groupByPaymentMethod(transactions),
        monthlyStats: this.getMonthlyStats(transactions)
      }

      return success(res, 'Statistiques récupérées avec succès', stats)

    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return error(res, 'Erreur lors de la récupération des statistiques')
    }
  }

  // Méthodes privées

  private static generateTransactionId(): string {
    return `7OUMA_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  private static async generateFlouciPayment(transaction: any): Promise<string> {
    // Intégration avec l'API Flouci
    // En production, utiliser l'API réelle de Flouci
    const flouciData = {
      amount: transaction.amount,
      currency: 'TND',
      description: `Inscription ${transaction.teamId} - ${transaction.tournamentId}`,
      callback_url: `${process.env.API_URL}/api/payments/webhook`,
      return_url: `${process.env.FRONTEND_URL}/payment/success/${transaction.transactionId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel/${transaction.transactionId}`,
      transaction_id: transaction.transactionId
    }

    // Simuler l'URL de paiement Flouci
    return `https://flouci.com/pay/${transaction.transactionId}`
  }

  private static async generateD17Payment(transaction: any): Promise<string> {
    // Intégration avec l'API D17
    const d17Data = {
      amount: transaction.amount,
      currency: 'TND',
      description: `Inscription équipe - ${transaction.tournamentId}`,
      transaction_id: transaction.transactionId,
      callback_url: `${process.env.API_URL}/api/payments/webhook`
    }

    // Simuler l'URL de paiement D17
    return `https://d17.tn/pay/${transaction.transactionId}`
  }

  private static async generateCardPayment(transaction: any): Promise<string> {
    // Intégration avec une passerelle de paiement par carte
    const cardData = {
      amount: transaction.amount,
      currency: 'TND',
      description: `Inscription équipe - ${transaction.tournamentId}`,
      transaction_id: transaction.transactionId,
      callback_url: `${process.env.API_URL}/api/payments/webhook`
    }

    // Simuler l'URL de paiement par carte
    return `${process.env.API_URL}/api/payments/card/${transaction.transactionId}`
  }

  private static verifyWebhookSignature(req: Request): boolean {
    // Vérifier la signature du webhook pour la sécurité
    // En production, implémenter la vérification réelle
    return true
  }

  private static async registerTeamToTournament(transaction: any) {
    try {
      // Vérifier si l'équipe n'est pas déjà inscrite
      const existingRegistration = await prisma.tournamentTeam.findFirst({
        where: {
          tournamentId: transaction.tournamentId,
          teamId: transaction.teamId
        }
      })

      if (!existingRegistration) {
        await prisma.tournamentTeam.create({
          data: {
            tournamentId: transaction.tournamentId,
            teamId: transaction.teamId
          }
        })
      }

      // Envoyer une notification à l'organisateur
      await this.sendPaymentNotification(transaction)

    } catch (error) {
      console.error('Erreur lors de l\'inscription de l\'équipe:', error)
    }
  }

  private static async sendPaymentNotification(transaction: any) {
    // Envoyer une notification par email/SMS à l'organisateur
    console.log(`Notification: Paiement reçu pour l'équipe ${transaction.teamId} dans le tournoi ${transaction.tournamentId}`)
  }

  private static groupByPaymentMethod(transactions: any[]) {
    return transactions.reduce((acc, transaction) => {
      const method = transaction.paymentMethod
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {})
  }

  private static getMonthlyStats(transactions: any[]) {
    const monthlyData = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.createdAt).toISOString().substr(0, 7)
      if (!acc[month]) {
        acc[month] = {
          total: 0,
          count: 0,
          commission: 0
        }
      }
      acc[month].total += transaction.amount
      acc[month].count += 1
      acc[month].commission += transaction.commission
      return acc
    }, {})

    return Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
      month,
      total: data.total,
      count: data.count,
      commission: data.commission
    }))
  }
} 