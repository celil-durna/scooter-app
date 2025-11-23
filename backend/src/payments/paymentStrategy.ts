import { Transaction } from 'sequelize';
import { Request } from 'express';

//Hier werden Methoden definiert, die jede Zahlungsmethode hat
//Oder mit ? Zahlungsmethoden die Optional sind.
//Kann durch vererbung weiter spezifiert werden und so weiter
export interface PaymentStrategy<T> {
    deletePaymentMethod(methodId: string,userId: number, transaction: Transaction): Promise<Transaction>;
    getPaymentMethods(userId: number): Promise<T[]>;
    addPayment(request: Request, transaction: Transaction, userId:number): Promise<Transaction>;
    validatePayment(userId: number, methodId: number, amount: number): Promise<{ token: string | null, error: string | null }>;
    transactionPayment(token: string): Promise<{ success: boolean, error: string | null }>;
}