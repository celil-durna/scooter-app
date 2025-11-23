import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { BookingService } from 'src/app/services/booking.service';
import { Booking } from 'src/app/models/booking';
import { BookingItemComponent } from 'src/app/components/booking-item/booking-item.component'; // Importiere die neue Komponente
import { LoadingScreenComponent } from 'src/app/components/loading-screen/loading-screen.component';

@Component({
  standalone: true,
  selector: 'app-my-bookings',
  imports: [BackButtonComponent, UserInputComponent, CommonModule, BookingItemComponent, LoadingScreenComponent], // Füge die neue Komponente hier hinzu
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css'],
})
export class MyBookingsComponent implements OnInit {
  currentBookings: Booking[] = [];
  pastBookings: Booking[] = [];
  isLoading = true;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    console.log('MyBookingsComponent initialized!');
    setTimeout(() => {
      this.isLoading = false; // Loadingscreen anzeigen, solange die Google-Icons laden
    }, 1500);
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getBookings().subscribe(
      (data: Booking[]) => {
        const now = new Date();
        this.currentBookings = data
          .filter(booking => new Date(booking.returnTime) > now)
          .sort((a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime());

        this.pastBookings = data
          .filter(booking => new Date(booking.returnTime) <= now)
          .sort((a, b) => new Date(b.returnTime).getTime() - new Date(a.returnTime).getTime());
      },
      (error) => {
        console.error('Error loading bookings', error);
      }
    );
  }
}
