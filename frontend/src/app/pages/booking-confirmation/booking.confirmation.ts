import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationBarComponent } from 'src/app/components/navigation-bar/navigation-bar.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-booking-confirmation',
  imports: [CommonModule, NavigationBarComponent, ButtonComponent],
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.css'],
})
export class BookingConfirmationComponent implements OnInit {
  returnTime: Date | undefined;
  totalPrice: number | undefined;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { bookingData: any };
    if (state && state.bookingData) {
      this.returnTime = new Date(state.bookingData.returnTime);
      this.totalPrice = state.bookingData.totalPrice;
      console.log('Return Time:', this.returnTime);
      console.log('Total Price:', this.totalPrice);
    }
  }

  ngOnInit(): void {
    console.log('LandingPage initialized!');
  }

  navigateToMap(): void {
    this.router.navigate(['/search']);
  }

  navigateToMyBookings(): void {
    this.router.navigate(['/my-bookings']);
  }

}
