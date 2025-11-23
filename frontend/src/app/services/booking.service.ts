import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8000/api/bookings';

  constructor(private http: HttpClient) {}

  createBooking(bookingData: Partial<Booking>): Observable<any> {
    return this.http.post(this.apiUrl, bookingData, { withCredentials: true });
}

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl, { withCredentials: true });
  }
  
}
