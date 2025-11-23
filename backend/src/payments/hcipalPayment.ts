import { Request } from 'express';
import { PaymentHciPal } from '../models/payment';
import https from 'https';
import { Transaction } from 'sequelize';
import { PaymentStrategy } from './paymentStrategy';

export interface HciPalPaymentMethod {
    id: number;
    email: string;
}

export class HcipalPayment implements PaymentStrategy<HciPalPaymentMethod> {

    public async deletePaymentMethod(methodId: string, userId: number, transaction: Transaction): Promise<Transaction> {
        try {
            const result = await PaymentHciPal.destroy({
                where: { id: methodId, userId: userId },
                transaction: transaction
            });
            if (result === 0) {
                throw new Error('Keine Zahlungsmethode mit der angegebenen ID gefunden');
            }
            return transaction;
        } catch (error) {
            throw new Error('Fehler beim Löschen der Zahlungsmethode');
        }
    }

    public async getPaymentMethods(userId: number): Promise<HciPalPaymentMethod[]> {
        try {
            const payments = await PaymentHciPal.findAll({
                where: { userId },
            });

            return payments.map(payment => ({
                methodName: 'hcipal',
                id: payment.id,
                email: payment.email,
            }));
        } catch (error) {
            console.error('Error retrieving HciPal payment methods:', error);
            throw new Error('Error retrieving HciPal payment methods');
        }
    }


    public async addPayment(request: Request, transaction: Transaction, userId: number): Promise<Transaction> {
        const accountName = request.body.email;
        if (!accountName) {
            throw new Error('accountName undefined');
        }
        const data = JSON.stringify({ accountName: accountName });
        const options = {
            hostname: 'pass.hci.uni-konstanz.de',
            port: 443,
            path: '/hcipal/country',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
            },
        };

        const responseData = await new Promise<string>((resolve, reject) => {
            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (d) => {
                    responseData += d;
                });
                res.on('end', () => {
                    resolve(responseData);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });
            req.write(data);
            req.end();
        });
        
        try {
            const parsedData = JSON.parse(responseData);
            console.log(parsedData);
            if (!parsedData.success) {
                throw new Error('Account existiert nicht');
            }
            const existingPayment = await PaymentHciPal.findOne({ where: { userId: userId, email: accountName } });
            if (existingPayment) {
                throw new Error('Zahlungsmethode existiert bereits');
            }
            if (parsedData.country !== 'germany') {
                throw new Error('Zahlungsmethode ist nicht aus Deutschland');
            }

            await PaymentHciPal.create({
                userId: userId,
                email: accountName,
                password: request.body.password
            }, { transaction: transaction });
            return transaction;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    public async validatePayment(userId: number, methodId: number, amount: number): Promise<{ token: string | null, error: string | null }> {
        console.log('Validierung wird durchgeführt...');
        try {

            const method = await PaymentHciPal.findOne({ where: { id: methodId, userId: userId } });
            if (!method) {
                console.log('Zahlungsmethode konnte nicht gefunden werden');
                return { token: null, error: 'Zahlungsmethode konnte nicht gefunden werden' };
            }

            const email = method.email;
            const password = method.password;

            const data = JSON.stringify({
                accountName: email,
                accountPassword: password,
                amount: amount
            });

            return new Promise((resolve) => {
                const options = {
                    hostname: 'pass.hci.uni-konstanz.de',
                    port: 443,
                    path: '/hcipal/check',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length,
                    },
                };

                const req = https.request(options, (res) => {
                    let responseData = '';
                    res.on('data', (d) => {
                        responseData += d;
                    });

                    res.on('end', async () => {
                        const parsedData = JSON.parse(responseData);
                        console.log(parsedData);
                        if (!parsedData.success) {
                            console.log('Nicht genug Geld auf der Zahlungsmethode');
                            resolve({ token: null, error: 'Ihre Zahlung konnte nicht abgeschlossen werden. Bitte überprüfen Sie Ihr Guthaben oder verwenden Sie eine andere Zahlungsmethode.' });
                        } else {
                            console.log('Validierung erfolgreich');
                            let token = parsedData.token;
                            token = token.replace(/^"|"$/g, '');
                            console.log('Token:', token);
                            resolve({ token, error: null });
                        }
                    });
                });

                req.on('error', (error) => {
                    console.error('Requestfehler:', error);
                    resolve({ token: null, error: error.message });
                });

                req.write(data);
                req.end();
            });
        } catch (error) {
            console.error('Catch-block-Fehler:', error);
            return { token: null, error: error.message };
        }
    }


    public async transactionPayment(inputToken: string): Promise<{ success: boolean, error: string | null }> {
        console.log('Transaktion wird durchgeführt...');
        try {
            const token = inputToken;

            const data = JSON.stringify({
                token: token
            });

            const options = {
                hostname: 'pass.hci.uni-konstanz.de',
                port: 443, // https
                path: '/hcipal/payment',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                },
            };

            return new Promise<{ success: boolean, error: string | null }>((resolve) => {
                const req = https.request(options, (res) => {
                    let responseData = '';
                    res.on('data', (d) => {
                        responseData += d;
                    });

                    res.on('end', async () => {
                        const parsedData = JSON.parse(responseData);
                        console.log(parsedData);
                        if (!parsedData.success) {
                            console.log('Transaktionfehler:', parsedData.error);
                            resolve({ success: false, error: parsedData.error });
                        } else {
                            console.log('Transaktion Hcipal war erfolgreich');
                            resolve({ success: true, error: null });
                        }
                    });
                });

                req.on('error', (error) => {
                    console.error('Requestfehler:', error);
                    resolve({ success: false, error: error.message });
                });

                req.write(data);
                req.end();
            });
        } catch (error) {
            console.error('Catch-block-Fehler:', error);
            return { success: false, error: error.message };
        }
    }

}