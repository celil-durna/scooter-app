import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { PaymentMethodsService } from 'src/app/services/payment-methods.service';
import { PaymentMethod } from '../../services/payment-methods.service';
import { ResponseMessage } from 'src/app/models/response-message';
import { ToastComponent } from '../../components/toast/toast.component';
import { AddPaymentButtonComponent } from 'src/app/components/add-payment-button/add-payment-button.component';


@Component({
  standalone: true,
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.css'],
  imports: [
    BackButtonComponent,
    RouterLink,
    RouterModule,
    ConfirmDialogComponent,
    CommonModule,
    ButtonComponent,
    ToastComponent,
    AddPaymentButtonComponent
  ]
})



export class PaymentMethodsComponent implements OnInit, AfterViewInit {
  userMethods: PaymentMethod[] = [];
  showConfirmDialog = false;
  dialogHeader = '';
  dialogMessage = '';
  methodName = '';
  methodId = 0;
  isSuccess = false;
  toastMessage = '';

  constructor(private router: Router, private loginService: LoginService, private paymentMethodsService: PaymentMethodsService) { }

  ngOnInit(): void {
    this.loginService.checkAuth().subscribe({
      next: (isLoggedIn) => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']);
        }
        else {
          this.getPaymentMethods();
          this.isSuccess = this.paymentMethodsService.getToastType();
          this.toastMessage = this.paymentMethodsService.getToastMessage();
        }
      },
    });
  }

  ngAfterViewInit(): void {
    //
  }

  getPaymentMethods(): void {
    this.paymentMethodsService.getPaymentMethods().subscribe({
      next: (response: PaymentMethod[]) => {
        this.userMethods = response;
      },
      error: (error) => {
        console.error('Error fetching payment methods:', error);
      }
    });
  }

  getImage(payment: string): string {
    const paymentMethods = [
      { name: 'bachelorcard', imageUrl: 'assets/payment/bachelorcard.png' },
      { name: 'hcipal', imageUrl: 'assets/payment/hciPal.png' },
      { name: 'swpsafe', imageUrl: 'assets/payment/swpsafe.png' },
    ];
    const method = paymentMethods.find(m => m.name === payment);
    return method ? method.imageUrl : 'nothing';
  }


  deletePaymentMethod(methodName: string, methodId: number): void {
    this.showConfirmDialog = true;
    this.methodName = methodName;
    this.methodId = methodId;
    this.dialogHeader = 'Auswahl löschen';
    this.dialogMessage = 'Bist du sicher, dass du die ausgewählte Zahlungsmethode aus dem System löschen willst?';
  }

  handleConfirmation(): void {
    this.paymentMethodsService.deletePayment(this.methodName, this.methodId).subscribe({
      next: (response: ResponseMessage) => {
        console.log('Zahlungsmethode erfolgreich gelöscht:', response);
        this.getPaymentMethods();
      },
      error: (error) => {
        console.error('Fehler beim Löschen der Zahlungsmethode:', error);
      }
    });
    console.log('Lösche ' + this.methodName + this.methodId);
    this.showConfirmDialog = false;
  }

  handleCancellation(): void {
    this.showConfirmDialog = false;
  }

  navigateToPaymentAddition(): void {
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/settings/addition']);
      console.log('Navigiere zu additions');
    } else {
      this.router.navigate(['/login']);
    }
  }
}
