import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Booking } from 'src/app/models/booking';
import { OptionsService } from 'src/app/services/options.service';
import { Option } from 'src/app/models/option';

@Component({
  selector: 'app-booking-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-item.component.html',
  styleUrls: ['./booking-item.component.css'],
})
export class BookingItemComponent implements OnInit {
  @Input() booking!: Booking;
  @Input() type: 'current' | 'past' = 'current';

  option?: Option;

  constructor(private router: Router, private optionsService: OptionsService) {}

  ngOnInit(): void {
    this.optionsService.getOptions().subscribe({
      next: (val) => {
        this.option = val;
        console.log('option erfolgreich');
      },
      error: () => {
        this.option = undefined;
        console.log('option fehlgeschlagen');
      },
    });
  }

  navigateToScooter(): void {
    this.router.navigate(['/scooters', this.booking.scooterId], {
      queryParams: { fromBookingItem: 'true' },
    });
  }

  getPriceWithCurrency(totalPrice: number): string {
    if (this.option) {
      const money =
        Math.round(
          this.optionsService.changeToEuro(this.option, totalPrice) * 100
        ) / 100;
      const symbol = this.optionsService.getSymbolMoney(this.option);
      if (symbol === '€') {
        return money + symbol;
      } else {
        return symbol + money;
      }
    }
    return totalPrice + ' €'; // falls Option (bzw. Währungswechsel) nicht funktioniert
  }
}
