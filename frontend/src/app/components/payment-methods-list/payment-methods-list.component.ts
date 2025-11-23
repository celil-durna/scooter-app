import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { PaymentMethodsService, PaymentMethod } from 'src/app/services/payment-methods.service';
import { AddPaymentButtonComponent } from '../add-payment-button/add-payment-button.component';

@Component({
  selector: 'app-payment-methods-list',
  standalone: true,
  templateUrl: './payment-methods-list.component.html',
  styleUrls: ['./payment-methods-list.component.css'],
  imports: [CommonModule, AddPaymentButtonComponent]
})
export class PaymentMethodsListComponent implements OnInit {
  @Input() userMethods: PaymentMethod[] = [];
  @Output() selectedMethodChange = new EventEmitter<PaymentMethod>();
  selectedMethod: PaymentMethod | null = null;

  constructor(private router: Router, private paymentMethodsService: PaymentMethodsService) { }

  ngOnInit(): void {
    console.log('Payment methods received:', this.userMethods); 
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


  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedMethod = method;
    console.log('Selected payment method:', method);
    this.selectedMethodChange.emit(this.selectedMethod);
  }

  navigateToPaymentAddition(): void {
    this.router.navigate(['/settings/addition']);
  }

}
