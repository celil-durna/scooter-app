import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-add-payment',
  standalone: true,
  imports: [],
  templateUrl: './add-payment-button.component.html',
  styleUrls: ['./add-payment-button.component.css'],
})
export class AddPaymentButtonComponent {
  constructor(private location: Location, private loginService: LoginService, private router: Router) {}

  navigateToPaymentAddition(): void {
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/settings/addition']);
      console.log('Navigiere zu additions');
    } else {
      this.router.navigate(['/login']);
    }
  }

}
