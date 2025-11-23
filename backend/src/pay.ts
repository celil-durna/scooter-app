import { Request, Response } from 'express';
import { User, UserSession } from './models/user';
import Database from './database';
import { PaymentFactory } from './payments/paymentFactory';

export class PayController {
    //Transaktionen bleiben im Controller
    //Jede Methode bezüglich bzw. Strategy create/destroy gibt t (transaction) zurück, die im Controller ausgeführt wird
    public async deletePaymentMethod(request: Request, response: Response): Promise<void> {
        const sessionId = request.cookies.sessionId;
        const method = request.body.method;
        const methodId = request.body.methodId;
        if (!sessionId) {
            response.status(409).send('User is not logged in');
            return;
        }
        if (!method || !methodId) {
            response.status(400).send('Input undefined');
            return;
        }
        try {
            const session = await UserSession.findOne({ where: { sessionId: sessionId } });
            if (!session) {
                response.status(404).send('Session not found');
                return;
            }
            let t = await Database.getSequelize().transaction();
            const paymentMethod = PaymentFactory.getPaymentMethod(method);
            t = await paymentMethod.deletePaymentMethod(methodId, session.userId, t);
            try {
                await t.commit();
                response.status(200).json('Zahlungsmethode erfolgreich gelöscht');
            } catch (error) {
                await t.rollback();
                response.status(500).json({ code: 500, message: 'Server-Problem' });
            }
        } catch (error) {
            response.status(500).json({ code: 500, message: 'Server-Problem' });
        }
    }

    public async getPaymentMethods(request: Request, response: Response): Promise<void> {
        const sessionId = request.cookies.sessionId;
        if (!sessionId) {
            response.status(409).send('User is not logged in');
            return;
        }
        try {
            const session = await UserSession.findOne({ where: { sessionId: sessionId } });
            if (!session) {
                response.status(404).send('Session not found');
                return;
            }
            const user = await User.findOne({ where: { userId: session.userId } });
            if (!user) {
                response.status(404).send('User not found');
                return;
            }
            const currentUserId = user.userId;

            const bachelorcardPayments = await PaymentFactory.getPaymentMethod('bachelorcard').getPaymentMethods(currentUserId);
            const hcipalPayments = await PaymentFactory.getPaymentMethod('hcipal').getPaymentMethods(currentUserId);
            const swpsafePayments = await PaymentFactory.getPaymentMethod('swpsafe').getPaymentMethods(currentUserId);

            const paymentMethods = [...bachelorcardPayments, ...hcipalPayments, ...swpsafePayments];
            response.json(paymentMethods);
        } catch (error) {
            response.status(500).json({ code: 500, message: 'Server-Problem' });
        }
    }

    public async addPayment(request: Request, response: Response): Promise<void> {
        const sessionId = request.cookies.sessionId;
        const session = await UserSession.findOne({ where: { sessionId } });
        if (!session) {
            response.status(401).json({ code: 401, message: 'Unauthorized' });
            return;
        }

        const userId = session.userId;
        let t = await Database.getSequelize().transaction();
        try {
            //Zahlungsmethode aussuchen
            const paymentMethod = PaymentFactory.getPaymentMethod(request.body.method);
            if (!paymentMethod) {
                response.status(400).json({ code: 400, message: 'Invalid payment method' });
                return;
            }
            t = await paymentMethod.addPayment(request, t, userId);
            try {
                t.commit();
                response.status(200).json({ code: 200, message: 'Zahlungsmethode wurde erfolgreich hinzugefügt' });
            } catch (error) {
                await t.rollback();
                response.status(500).json({ code: 500, message: 'Server-Problem' });
            }
        } catch (error) {
            response.status(500).json({ code: 500, message: error.message });
        }

    }

    public async validatePayment(request: Request): Promise<{ token: string | null, error: string | null }> {
        try {
            console.log('validatePayment aufgerufen');
            const sessionId = request.cookies.sessionId;
            const session = await UserSession.findOne({ where: { sessionId: sessionId } });
            if (!session) {
                return { token: null, error: 'Session konnte nicht gefunden werden' };
            }
            const userId = session.userId;
            const amount = request.body.amount;
            const methodName = request.body.method;
            const methodId = request.body.methodId;
            console.log(amount, methodName, methodId);
            console.log(request.body);
            if (!amount || !methodName || !methodId) {
                return { token: null, error: 'undefined' };
            }
            const paymentMethod = PaymentFactory.getPaymentMethod(methodName);
            return await paymentMethod.validatePayment(userId, methodId, amount);
        } catch (error) {
            return { token: null, error: 'Server-Problem' };
        }
    }

    public async transactionPayment(request: Request): Promise<{ success: boolean, error: string | null }> {
        try {
            const token = request.body.token;
            const methodName = request.body.method;
            if (!token || !methodName) {
                return { success: false, error: 'undefined' };
            }
            const paymentMethod = PaymentFactory.getPaymentMethod(methodName);
            return await paymentMethod.transactionPayment(token);

        } catch (error) {
            return { success: false, error: 'Server-Problem' };
        }
    }
}



