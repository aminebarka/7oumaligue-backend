import { Request, Response } from 'express';
export interface PaymentRequest {
    tournamentId: string;
    teamId: string;
    amount: number;
    paymentMethod: 'flouci' | 'd17' | 'card' | 'cash';
    playerCount: number;
    organizerId: number;
}
export interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    paymentUrl?: string;
    message: string;
    error?: string;
}
export declare class PaymentController {
    static createPayment(req: Request, res: Response): Promise<any>;
    static checkPaymentStatus(req: Request, res: Response): Promise<any>;
    static paymentWebhook(req: Request, res: Response): Promise<any>;
    static getPaymentStats(req: Request, res: Response): Promise<any>;
    private static generateTransactionId;
    private static generateFlouciPayment;
    private static generateD17Payment;
    private static generateCardPayment;
    private static verifyWebhookSignature;
    private static registerTeamToTournament;
    private static sendPaymentNotification;
    private static groupByPaymentMethod;
    private static getMonthlyStats;
}
//# sourceMappingURL=payment.controller.d.ts.map