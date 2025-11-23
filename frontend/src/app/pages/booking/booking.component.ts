import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { PaymentMethodsListComponent } from 'src/app/components/payment-methods-list/payment-methods-list.component';
import { LoginService } from 'src/app/services/login.service';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { NavigationBarComponent } from 'src/app/components/navigation-bar/navigation-bar.component';
import { Product } from 'src/app/models/product';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { Scooter } from 'src/app/models/scooter';
import { ScooterService } from 'src/app/services/scooter.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  PaymentMethod,
  PaymentMethodsService,
} from 'src/app/services/payment-methods.service';
import { LoadingScreenComponent } from 'src/app/components/loading-screen/loading-screen.component';
import { BookingService } from 'src/app/services/booking.service';
import { ToastComponent } from 'src/app/components/toast/toast.component';
import { Option } from 'src/app/models/option';
import { OptionsService } from 'src/app/services/options.service';

@Component({
  standalone: true,
  selector: 'app-booking',
  imports: [
    BackButtonComponent,
    UserInputComponent,
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    NavigationBarComponent,
    ButtonComponent,
    PaymentMethodsListComponent,
    LoadingScreenComponent,
    ToastComponent,
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
})
export class BookingComponent implements OnInit {
  product: Product | undefined;
  scooter: Scooter | undefined;
  hours = 1;
  totalPrice = 0;
  userMethods: PaymentMethod[] = [];
  selectedMethod: PaymentMethod | null = null;
  loading = false;
  toastMessage = '';
  isSuccess = true;
  option?: Option;

  constructor(
    private route: ActivatedRoute, // für Route-Parameter, z.B. um ScooterID zu fetchen
    private productService: ProductService,
    private scooterService: ScooterService,
    private paymentMethodsService: PaymentMethodsService,
    private location: Location,
    private loginService: LoginService,
    private router: Router,
    private optionsService: OptionsService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.getOptionEintrag();
    this.route.paramMap.subscribe((params) => {
      const scooterId = Number(params.get('id'));
      if (scooterId) {
        this.scooterService.getScooterById(scooterId).subscribe((scooter) => {
          this.scooter = scooter;
          this.productService
            .getProductByName(scooter.product)
            .subscribe((product) => {
              this.product = product;
              this.updateTotalPrice();
            });
        });
      }
      this.isSuccess = this.paymentMethodsService.getToastType();
      this.toastMessage = this.paymentMethodsService.getToastMessage();
      this.showToast(this.toastMessage, this.isSuccess);
    });

    this.paymentMethodsService.getPaymentMethods().subscribe({
      next: (methods: PaymentMethod[]) => {
        this.userMethods = methods;
        console.log('Loaded payment methods:', this.userMethods);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Zahlungsmethoden:', error);
      },
    });
  }

  // Reichweite
  getReichweite(): number {
    if (this.scooter && this.product) {
      const reach = (this.scooter.battery / 100) * this.product.max_reach;
      return this.getRoundedValue(reach);
    }
    return 0;
  }

  getRoundedValue(value: number): number {
    return Math.round(value);
  }

  // Gesamtpreis
  getTotalPrice(): string {
    return this.totalPrice.toFixed(2);
  }

  updateTotalPrice(): void {
    if (this.product && !isNaN(this.hours)) {
      const pricePerHour = this.parsePrice(this.product.price_per_hour);

      if (!isNaN(pricePerHour)) {
        this.totalPrice = this.hours * pricePerHour;
        console.log(`Total Price Updated: ${this.totalPrice}`);
      } else {
        this.totalPrice = 0;
        console.log('Invalid price format');
      }
    } else {
      this.totalPrice = 0;
      console.log('Total Price set to 0 due to invalid product or hours');
    }
  }

  // Entfernen Dollar-/Eurozeichen
  parsePrice(price: string): number {
    return parseFloat(price.replace(/[^0-9.-]+/g, ''));
  }

  // Stundenangabe
  incrementHours(): void {
    this.hours++;
  }

  decrementHours(): void {
    if (this.hours > 1) {
      this.hours--;
    }
  }

  onSelectedMethodChange(selectedMethod: PaymentMethod): void {
    console.log('Selected method:', selectedMethod);
    this.selectedMethod = selectedMethod;
  }

  // Buchen-Button ist disabled solang keine Zahlungsmethode ausgewählt wurde
  isBookingButtonDisabled(): boolean {
    return !this.selectedMethod;
  }

  // Buchung durchführen
  confirmBooking(): void {
    if (!this.selectedMethod || !this.scooter) return;

    this.loading = true;

    const bookingData = {
      scooterId: this.scooter.id,
      hours: this.hours,
      paymentMethodId: this.selectedMethod.id,
      paymentMethodType: this.selectedMethod.methodName,
    };

    console.log('Booking Data:', bookingData);

    this.bookingService.createBooking(bookingData).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Buchung erfolgreich:', response);
        this.navigateToBookingConfirmation(response);
      },
      error: (error) => {
        this.loading = false;
        console.error('Fehler bei der Buchung:', error);
        const errorMessage = error.error.message || error.message;
        console.log('Toast anzeigen');
        this.showToast(errorMessage, false);
      },
    });
  }

  // Weiterleitung zur Buchung-Bestätigung-Seite
  navigateToBookingConfirmation(bookingData: any): void {
    if (this.loginService.isLoggedIn() && this.scooter) {
      this.router.navigate(
        [`/booking/${this.scooter.id}/booking-confirmation`],
        { state: { bookingData } }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  showToast(message: string, isSuccess: boolean): void {
    this.toastMessage = message;
    this.isSuccess = isSuccess;
    setTimeout(() => {
      this.toastMessage = '';
    }, 5000);
  }

  // Back-Button
  back(): void {
    this.location.back();
  }

  getOptionEintrag(): void {
    this.optionsService.getOptions().subscribe({
      next: (val) => {
        this.option = { ...val };
        console.log('succefully got option');
      },
      error: () => {
        this.option = undefined;
        console.log('could not get option');
      },
    });
  }

  getFinalPrice(): string {
    if (this.option) {
      const val = this.totalPrice;
      if (val) {
        const money =
          Math.round(this.optionsService.changeToEuro(this.option, val) * 100) /
          100;
        const symbol = this.optionsService.getSymbolMoney(this.option);
        if (symbol === '€') {
          return money + symbol;
        } else {
          return symbol + money;
        }
      }
    }
    return 'error';
  }

  getPricePerHour(): string {
    if (this.option && this.product) {
      const val = this.product?.price_per_hour;
      if (val) {
        const valParsed = this.optionsService.parsePrice(val);
        const money =
          Math.round(
            this.optionsService.changeToEuro(this.option, valParsed) * 100
          ) / 100;
        const symbol = this.optionsService.getSymbolMoney(this.option);
        if (symbol === '€') {
          return money + symbol;
        } else {
          return symbol + money;
        }
      }
    }
    return 'error';
  }

  getSpeed(): String {
    if (this.scooter && this.product && this.option) {
      const speed = this.product.max_speed;
      const speedFinal = this.optionsService.changeToMilePerHour(
        this.option,
        speed
      );
      const speedSymbol = this.optionsService.getSymbolSpeed(this.option);
      return Math.round(speedFinal * 100) / 100 + speedSymbol;
    }
    return 'error';
  }

  getReach(): string {
    if (this.scooter && this.product && this.option) {
      const reach = (this.scooter.battery / 100) * this.product.max_reach;
      const distance = this.optionsService.changeToMiles(this.option, reach);
      const reachSymbol = this.optionsService.getSymbolDistance(this.option);
      return Math.round(distance) + reachSymbol;
    }
    return 'error';
  }
}
