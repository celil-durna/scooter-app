import { PaymentStrategy } from './paymentStrategy';
import { BachelorCardPaymentMethod, BachelorcardPayment } from './bachelorcardPayment';
import { SwpsafePayment, SwpsafePaymentMethod } from './swpsafePayment';
import { HciPalPaymentMethod, HcipalPayment } from './hcipalPayment';

type PaymentMethods = BachelorCardPaymentMethod | SwpsafePaymentMethod | HciPalPaymentMethod;

//Hier werden alle Zahlungsmethoden aufgelistet
export class PaymentFactory {
    //Name von der Zahlungsmethode für Unterscheidung
    //PaymentMethods für Datentyp für Methode getPaymentMethod*s*
    static getPaymentMethod(method: string): PaymentStrategy<PaymentMethods> {
        switch (method.toLowerCase().trim()) {
            case 'bachelorcard':
                return new BachelorcardPayment(); 
            case 'swpsafe':
                return new SwpsafePayment();      
            case 'hcipal':
                return new HcipalPayment();
            default:
                throw new Error('Invalid payment method');
        }
    }


}