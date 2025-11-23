import { Request } from 'express';
import { PaymentBachelorCard } from '../models/payment';
import { Transaction } from 'sequelize';
import https from 'https';
import xml2js from 'xml2js';
import { PaymentStrategy } from './paymentStrategy';


export interface BachelorCardPaymentMethod {
    id: number;
    name: string;
    cardNumber: string;
}

export class BachelorcardPayment implements PaymentStrategy<BachelorCardPaymentMethod> {

    public async deletePaymentMethod(methodId: string, userId: number, transaction: Transaction): Promise<Transaction> {
        try {
            // Löschen der Zahlungsmethode mit der angegebenen methodId
            const result = await PaymentBachelorCard.destroy({
                where: { id: methodId, userId: userId },
                transaction: transaction,  // Transaktion übergeben
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

    public async getPaymentMethods(userId: number): Promise<BachelorCardPaymentMethod[]> {
        try {
            const payments = await PaymentBachelorCard.findAll({
                where: { userId },
            });

            return payments.map(payment => ({
                methodName: 'bachelorcard',
                id: payment.id,
                name: payment.name,
                cardNumber: payment.cardNumber.slice(-4),
            }));
        } catch (error) {
            console.error('Error retrieving BachelorCard payment methods:', error);
            throw new Error('Error retrieving BachelorCard payment methods');
        }
    }

    //Zahlungsmethode Bachelorcard hinzufügen
    public async addPayment(request: Request, transaction: Transaction, userId: number): Promise<Transaction> {
        const name = request.body.name.trim();
        const cardNumber = request.body.cardNumber;
        const securityCode = request.body.securityCode;
        const expirationDate = request.body.expirationDate;

        if (!name || !cardNumber || !securityCode || !expirationDate) {
            throw new Error('Input undefined');
        }

        const data = `
            <?xml version="1.0" encoding="utf-8"?>
            <transactionRequest type="country">
            <version>1.0.0</version>
            <merchantInfo>
            <name>Gruppe03</name>
            </merchantInfo>
            <cardNumber>${cardNumber}</cardNumber>
            </transactionRequest>
            `;
        const options = {
            hostname: 'pass.hci.uni-konstanz.de',
            port: 443, // https
            path: '/bachelorcard',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Content-Length': data.length,
            },
        };
        const responseData = await new Promise<string>((resolve, reject) => {
            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (d) => {
                    responseData += d.toString();
                });
                res.on('end', async () => {
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
            const parsedData = await xml2js.parseStringPromise(responseData);
            const status = parsedData.transactionResponse.response[0].status[0];

            if (!status.includes('200')) {
                throw new Error('Karte existiert nicht');
            }

            const existingPayment = await PaymentBachelorCard.findOne({ where: { userId: userId, cardNumber: cardNumber } });
            if (existingPayment) {
                throw new Error('Zahlungsmethode existiert bereits');
            }
            const country = parsedData.transactionResponse.response[0]['transaction-data'][0].country[0];
            if (country !== 'de') {
                throw new Error('Zahlungsmethode ist nicht aus Deutschland');
            }
            try {
                await PaymentBachelorCard.create({
                    userId: userId,
                    name: name,
                    cardNumber: cardNumber,
                    securityCode: securityCode,
                    expirationDate: expirationDate,
                }, { transaction: transaction });
                return transaction;
            } catch (error) {
                throw new Error('Server-Problem');
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    //Ist die Zahlungsmethode autorisiert folgenden Betrag zu buchen, dann return Token für Buchung
    public async validatePayment(userId: number, methodId: number, amount: number): Promise<{ token: string | null, error: string | null }> {
        console.log('Validierung wird durchgeführt...');
        try {
            const method = await PaymentBachelorCard.findOne({ where: { id: methodId, userId: userId } });
            if (!method) {
                return { token: null, error: 'Payment method konnte nicht gefunden werden' };
            }

            const data = `
            <?xml version="1.0" encoding="utf-8"?>
            <transactionRequest type="validate">
            <version>1.0.0</version>
            <merchantInfo>
            <name>Gruppe03</name>
            </merchantInfo>
            <payment type="bachelorcard">
            <paymentDetails>
            <cardNumber>${method.cardNumber}</cardNumber>
            <name>${method.name}</name>
            <securityCode>${method.securityCode}</securityCode>
            <expirationDate>${method.expirationDate}</expirationDate>
            </paymentDetails>
            <dueDetails>
            <amount>${amount}</amount>
            <currency>EUR</currency>
            <country>de</country>
            </dueDetails>
            </payment>
            </transactionRequest>
            `;

            const options = {
                hostname: 'pass.hci.uni-konstanz.de',
                port: 443,
                path: '/bachelorcard',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml',
                    'Content-Length': data.length,
                },
            };

            return new Promise<{ token: string | null, error: string | null }>((resolve) => {
                const req = https.request(options, (res) => {
                    let requestedData = '';
                    res.on('data', (d) => {
                        requestedData += d.toString();
                        console.log('angefragte Daten:', requestedData);
                    });

                    res.on('end', async () => {
                        try {
                            const parsedData = await xml2js.parseStringPromise(requestedData);
                            const statusArray = parsedData.transactionResponse.response[0].status;
                            const status = statusArray[0];


                            if (status.includes('400')) {
                                const expirationDate = method.expirationDate;
                                const [month, year] = expirationDate.split('/').map(Number);
                                const lastDayOfExpirationMonth = new Date(year + 2000, month, 0); // letzter Tag im Monat
                                const today = new Date();

                                if (today > lastDayOfExpirationMonth) {
                                    console.log('Karte ist abgelaufen');
                                    resolve({ token: null, error: 'Ihre Karte ist abgelaufen. Bitte verwenden Sie eine andere Zahlungsmethode.' });
                                } else {
                                    console.log('Nicht genug Geld auf der Karte');
                                    resolve({ token: null, error: 'Die Zahlung konnte nicht abgeschlossen werden. Stellen Sie sicher, dass Ihre Karte ausreichend gedeckt ist.' });
                                }
                            } else if (!status.includes('200')) {
                                const errorMessage = parsedData.transactionResponse.response[0].error[0];
                                console.log('Validierungsfehler:', errorMessage);
                                resolve({ token: null, error: errorMessage });
                            } else {
                                const transactionCode = parsedData.transactionResponse.response[0]['transaction-data'][0].transactionCode[0];
                                console.log('Transaktions-Code:', transactionCode);
                                resolve({ token: transactionCode, error: null });
                            }
                        } catch (error) {
                            console.error('Parsing-Fehler:', error);
                            resolve({ token: null, error: error.message });
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

    //Transaktion mithilfe Token ausführen
    public async transactionPayment(inputToken: string): Promise<{ success: boolean, error: string | null }> {
        console.log('Transaktion wird durchgeführt...');
        try {
            const transactionCode = inputToken;
            console.log(transactionCode);

            const data = `
            <?xml version="1.0" encoding="utf-8"?>
            <transactionRequest type="pay">
            <version>1.0.0</version>
            <merchantInfo>
            <name>Gruppe03</name>
            </merchantInfo>
            <transactionCode>${transactionCode}</transactionCode>
            </transactionRequest>
            `;

            const options = {
                hostname: 'pass.hci.uni-konstanz.de',
                port: 443, // https port
                path: '/bachelorcard',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml',
                    'Content-Length': data.length,
                },
            };

            return new Promise<{ success: boolean, error: string | null }>((resolve) => {
                const req = https.request(options, (res) => {
                    let requestedData = '';
                    res.on('data', (d) => {
                        requestedData += d.toString();
                        console.log('angefragte Daten:', requestedData);
                    });

                    res.on('end', async () => {
                        try {
                            const parsedData = await xml2js.parseStringPromise(requestedData);
                            const statusArray = parsedData.transactionResponse.response[0].status;
                            const status = statusArray[0];

                            if (!status.includes('200')) {
                                const errorMessage = parsedData.transactionResponse.response[0].error[0];
                                console.log('Transaktionsfehler:', errorMessage);
                                resolve({ success: false, error: errorMessage });
                            } else {
                                console.log('Transaktion Bachelorcard war erfolgreich');
                                resolve({ success: true, error: null });
                            }
                        } catch (error) {
                            console.error('Parsing-Fehler:', error);
                            resolve({ success: false, error: error.message });
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