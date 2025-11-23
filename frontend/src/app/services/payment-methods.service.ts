import { Injectable } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { ResponseMessage } from '../models/response-message';
import { HttpClient } from '@angular/common/http';

export interface PaymentMethod {
  id: number;
  methodName: string;
  name?: string;
  cardNumber?: string;
  email?: string;
  code?: string;
}

export interface SwpsafeData {
  swpCode: string;
}

export interface HcipalData {
  email: string;
  password: string;
}

export interface BachelorcardData {
  name: string;
  cardNumber: string;
  securityCode: string;
  expirationDate: string;
}

type PaymentData = SwpsafeData | HcipalData | BachelorcardData;

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {

  private toastMessage = '';
  private toastType = false;

  constructor(private http: HttpClient) { }

  public getToastMessage(): string {
    return this.toastMessage;
  }

  public getToastType(): boolean {
    return this.toastType;
  }


  public resetToast(): void {
    this.toastMessage = '';
    this.toastType = false;
  }

  public getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>('/api/getPaymentMethods');
  }

  //method-variable should be swpsafe-code/hcipal-email/bachelorcard-number
  public deletePayment(method: string, methodId: number): Observable<ResponseMessage> {
    console.log(method,methodId, 'service');
    return this.http.delete<ResponseMessage>('/api/deletePayment', {
      body: { method, methodId }
    });
  }

  public addPayment(method: string, data: PaymentData): Observable<ResponseMessage> {
    return this.http.post<ResponseMessage>('/api/addPayment', { method, ...data }).pipe(
      tap((response: ResponseMessage) => {
        this.toastMessage = response.message;
        this.toastType = true;
        console.log(response.message);
      }),
      catchError(error => {
        this.toastMessage = error.error.message;
        this.toastType = false;
        console.log(error.message);
        throw error;
      })
    );
  }
}


