/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { LoginService } from 'src/app/services/login.service';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { PaymentMethodsService } from 'src/app/services/payment-methods.service';
import { LoadingScreenComponent } from 'src/app/components/loading-screen/loading-screen.component';


@Component({
  standalone: true,
  imports: [BackButtonComponent, RouterLink, ButtonComponent, CommonModule, UserInputComponent, LoadingScreenComponent],
  templateUrl: './payment-add.component.html',
  styleUrls: ['./payment-add.component.css'],
})
export class PaymentAdditionComponent implements OnInit {
  method = '';
  errorMessage = '';
  isComplete = false;
  wrongFieldValue = false;
  inputBachelorcard = false;
  inputHcipal = false;
  inputSwpsafe = false;
  overlayBachelorcard = false;
  overlayHcipal = false;
  overlaySwpsafe = false;
  loading = false;

  storeButton = false;
  cancelButton = false;
  cancelBackButton = true;
  //Bachelorcard
  public name = '';
  public cardNumber = '';
  public securityCode = '';
  public expirationDate = '';
  //HCIPal
  public email = '';
  public password = '';
  //SWPsafe
  public code = '';

  @ViewChild('inputEmail') inputEmail!: UserInputComponent;
  @ViewChild('inputName') inputName!: UserInputComponent;
  @ViewChild('inputCardNumber') inputCardNumber!: UserInputComponent;
  @ViewChild('inputSecurityCode') inputSecurityCode!: UserInputComponent;
  @ViewChild('inputExpirationDate') inputExpirationDate!: UserInputComponent;

  constructor(private router: Router, private loginService: LoginService, private location: Location, private paymentMethodsService: PaymentMethodsService) { }

  ngOnInit(): void {
    this.loginService.checkAuth().subscribe({
      next: (isLoggedIn) => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  cancelInput(): void {
    window.location.reload();
  }



  layoutBachelorCard(): void {
    if (this.inputBachelorcard === true || this.inputHcipal === true || this.inputSwpsafe === true) return;
    this.inputBachelorcard = true;
    this.cancelBackButton = false;
    this.storeButton = true;
    this.cancelButton = true;
    this.method = 'bachelorcard';
    this.overlayBachelorcard = true;

  }

  layoutHciPal(): void {
    if (this.inputBachelorcard === true || this.inputHcipal === true || this.inputSwpsafe === true) return;
    this.inputHcipal = true;
    this.cancelBackButton = false;
    this.storeButton = true;
    this.cancelButton = true;
    this.method = 'hcipal';
    this.overlayHcipal = true;;

  }

  layoutSwpsafe(): void {
    if (this.inputBachelorcard === true || this.inputHcipal === true || this.inputSwpsafe === true) return;
    this.inputSwpsafe = true;
    this.cancelBackButton = false;
    this.storeButton = true;
    this.cancelButton = true;
    this.method = 'swpsafe';
    this.overlaySwpsafe = true;

  }

  addBachelorcard(): void {
    this.isComplete = !(
      this.isEmpty(this.name) ||
      this.isEmpty(this.cardNumber) ||
      this.isEmpty(this.securityCode) ||
      this.isEmpty(this.expirationDate)
    );
    if (!this.isComplete) {
      this.errorMessage = 'Bitte füllen sie alle Felder aus';
      return;
    }

    if (!this.inputName.isValidInput || !this.inputCardNumber.isValidInput || !this.inputSecurityCode.isValidInput || !this.inputExpirationDate.isValidInput) {
      return;
    }

    const [month, year] = this.expirationDate.split('/');
    const inputMonth = parseInt(month);
    const inputYear = parseInt(year);

    const currentMonth = new Date().getMonth() + 1; // Aktueller Monat (1-12)
    const currentYear = new Date().getFullYear() % 100; // Aktuelles Jahr (zweistellig)
    console.log(inputMonth, inputYear, currentMonth, currentYear);

    if (inputYear < currentYear || (inputYear === currentYear && inputMonth <= currentMonth)) {
      this.wrongFieldValue = true;
      this.errorMessage = 'Die Karte ist abgelaufen';
      return;
    };

    this.wrongFieldValue = false;
    this.loading = true;
    this.paymentMethodsService.addPayment('bachelorcard', {
      name: this.name,
      cardNumber: this.cardNumber,
      securityCode: this.securityCode,
      expirationDate: this.expirationDate
    }).subscribe(
      () => {
        this.loading = false;
        this.location.back();
      },
      () => {
        this.loading = false;
        this.location.back();
      }
    );

  }
  addHcipal(): void {
    this.isComplete = !(
      this.isEmpty(this.email) ||
      this.isEmpty(this.password)
    );
    if (!this.isComplete) {
      this.errorMessage = 'Bitte füllen Sie alle Felder aus';
      return;
    }
    if (!this.inputEmail.isValidInput) {
      return;
    }

    this.loading = true;
    this.paymentMethodsService.addPayment('hcipal', {
      email: this.email,
      password: this.password
    }).subscribe(
      () => {
        this.loading = false;
        this.location.back();
      },
      () => {
        this.loading = false;
        this.location.back();
      }
    );
  }

  addSwpsafe(): void {
    this.isComplete = !this.isEmpty(this.code);

    if (!this.isComplete) {
      this.loading = false;
      this.errorMessage = 'Bitte füllen Sie alle Felder aus';
      return;
    }
    this.loading = true;
    this.paymentMethodsService.addPayment('swpsafe', {
      swpCode: this.code
    }).subscribe(
      () => {
        this.loading = false;
        this.location.back();
      },
      () => {
        this.loading = false;
        this.location.back();
      }
    );
  }

  addPaymentMethod(): void {
    if (!this.loginService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    //Ladebildschirm
    switch (this.method) {
      case 'bachelorcard':
        this.addBachelorcard();
        break;
      case 'swpsafe':
        this.addSwpsafe();
        break;
      case 'hcipal':
        this.addHcipal();
        break;
      default:
        break;
    }
  }

  isEmpty(str: string): boolean {
    return str === '' || str === null;
  }

  back(): void {
    this.location.back();
  }

}
