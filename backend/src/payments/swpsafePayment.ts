import { Request } from 'express';
import { PaymentSwpsafe } from '../models/payment';
import https from 'https';
import { Transaction } from 'sequelize';
import { PaymentStrategy } from './paymentStrategy';

export interface SwpsafePaymentMethod {
    id: number;
    code: string;
}

export class SwpsafePayment implements PaymentStrategy<SwpsafePaymentMethod> {

    public async deletePaymentMethod(methodId: string,userId: number, transaction: Transaction): Promise<Transaction> {
        try {
            const result = await PaymentSwpsafe.destroy({
                where: { id: methodId, userId: userId},
                transaction: transaction, 
            });
            if (result === 0) {
                throw new Error('Keine Zahlungsmethode mit der angegebenen ID gefunden');
            }
            return transaction;
        } catch (error) {
            console.error('Fehler beim Löschen der Swpsafe-Zahlungsmethode:', error);
            throw new Error('Fehler beim Löschen der Zahlungsmethode');
        }
    }

    public async getPaymentMethods(userId: number): Promise<SwpsafePaymentMethod[]> {
        try {
            const payments = await PaymentSwpsafe.findAll({
                where: { userId: userId },
            });

            return payments.map(payment => ({
                methodName: 'swpsafe',
                id: payment.id,
                code: payment.swpCode.slice(-2),  // Nur die letzten 2 Zeichen des Codes
            }));
        } catch (error) {
            console.error('Fehler beim Abrufen der Swpsafe-Zahlungsmethoden:', error);
            throw new Error('Fehler beim Abrufen der Zahlungsmethoden');
        }
    }

    //Mit Ländercode überprüfung
    public async addPayment(request: Request, transaction: Transaction, userId: number): Promise<Transaction> {
        const swpCode = request.body.swpCode;
        if (!swpCode) {
            throw new Error('swpCode undefined');
        }
        const encodedSwpCode = encodeURIComponent(swpCode);
        const options = {
            hostname: 'pass.hci.uni-konstanz.de',
            port: 443, // https
            path: `/swpsafe/country/code/${encodedSwpCode}`,
            method: 'GET'
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
            req.end();
        });

        const lines = responseData.trim().split('\n');
        const values = lines[1].split(',');
        const responseCode = values[0];
        if (responseCode.includes('400')) {
            throw new Error('Zahlungsmethode existiert nicht');
        }

        try {
            const existingPayment = await PaymentSwpsafe.findOne({ where: { userId, swpCode } });
            if (existingPayment) {
                throw new Error('Zahlungsmethode existiert bereits');
            }

            const country = values[3];
            if (!country.includes('Deutschland')) {
                throw new Error('Zahlungsmethode ist nicht aus Deutschland');
            }

            await PaymentSwpsafe.create({
                swpCode: swpCode,
                userId: userId,
            }, { transaction: transaction });
            return transaction;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    public async validatePayment(userId: number, methodId: number, amount: number): Promise<{ token: string | null, error: string | null }> {
        console.log('Validierung wird durchgeführt...');
        try {
            const method = await PaymentSwpsafe.findOne({ where: { id: methodId, userId: userId } });
            if (!method) {
                return { token: null, error: 'Zahlungsmethode konnte nicht gefunden werden' };
            }

            const encodedSwpCode = encodeURIComponent(method.swpCode);

            return new Promise((resolve) => {
                const options = {
                    hostname: 'pass.hci.uni-konstanz.de',
                    port: 443,
                    path: `/swpsafe/check/code/${encodedSwpCode}/amount/${amount}`,
                    method: 'GET'
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (d) => {
                        data += d;
                    });
                    res.on('end', async () => {
                        const lines = data.trim().split('\n');
                        const values = lines[1].split(',');
                        const responseCode = values[0];
                        if (responseCode.includes('400')) {

                            resolve({ token: null, error: 'Ihre Zahlung konnte nicht abgeschlossen werden. Bitte überprüfen Sie Ihr Guthaben oder verwenden Sie eine andere Zahlungsmethode.' });
                        } else {
                            console.log('Validierung erfolgreich');
                            let token = values[2];
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
            const token = inputToken.replace(/^"|"$/g, ''); // Entfernt Anführungszeichen am Anfang und Ende des Tokens
            const options = {
                hostname: 'pass.hci.uni-konstanz.de',
                port: 443, // https
                path: `/swpsafe/use/${token}`,
                method: 'GET'
            };

            return new Promise<{ success: boolean, error: string | null }>((resolve) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (d) => {
                        data += d;
                    });
                    res.on('end', async () => {
                        const lines = data.trim().split('\n');
                        if (lines.length > 0) {
                            const values = lines[1].split(',');
                            const responseCode = values[0];
                            console.log('Response Code:', responseCode);

                            if (responseCode === '400') {
                                console.log('Transaktionsfehler:', values[1]);
                                resolve({ success: false, error: values[1] });
                            } else if (responseCode === '200') {
                                console.log('Transaktion erfolgreich');
                                resolve({ success: true, error: null });
                            } else {
                                console.log('Unerwarteter ResponseCode');
                                resolve({ success: false, error: 'Unerwarteter ResponseCode' });
                            }
                        } else {
                            console.log('Unerwartetes Response-Format');
                            resolve({ success: false, error: 'Unerwartetes Response-Format' });
                        }
                    });
                });

                req.on('error', (error) => {
                    console.error('Requestfehler:', error);
                    resolve({ success: false, error: error.message });
                });

                req.end();
            });
        } catch (error) {
            console.error('Catch-block-Fehler:', error);
            return { success: false, error: error.message };
        }
    }

}