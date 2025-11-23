import { CommonModule } from '@angular/common';
import { Component, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { PaymentMethodsService } from 'src/app/services/payment-methods.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ToastComponent implements AfterViewInit {

  constructor(private paymentMethodsService: PaymentMethodsService, private cdr: ChangeDetectorRef) {}

  @Input() message = '';
  @Input() duration = 5000;
  @Input() isSuccess = true;
  visible = false;
  messageColor = 'black';

  ngAfterViewInit(): void {
    if (this.message) {
      setTimeout(() => {
        this.show();
      });
    }
  }

  show(): void {
    this.visible = true;
    this.cdr.detectChanges(); // Change detection manuell auslösen
    setTimeout(() => {
      this.visible = false;
      this.cdr.detectChanges(); // Change detection manuell auslösen
    }, this.duration);
    this.paymentMethodsService.resetToast();
  }
}
