import { Component, OnInit } from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';
import { User } from 'src/app/models/user';
import { BookingService } from 'src/app/services/booking.service';
import { Booking } from 'src/app/models/booking';
import { DropdownComponent } from 'src/app/components/dropdown/dropdown.component';
import { Option } from 'src/app/models/option';
import { OptionsService } from 'src/app/services/options.service';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    UserInputComponent,
    BackButtonComponent,
    ButtonComponent,
    DropdownComponent
],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit {
  public errorMessage = '';
  public user?: User;
  public displayUser?: User;

  public totalBookings?: number;
  public totalTime?: number;
  public totalMoney?: number;
  public totalDistance?: number;
  public avgTime?: number;
  public avgMoney?: number;
  currentBookings: Booking[] = [];
  pastBookings: Booking[] = [];
  allBookings: Booking[] = [];
  selectedFilter = 'total';
  option?: Option;
  scooters:Product[] = []; //alle scooter aus den bookings
  now = new Date();

  constructor(
    private router: Router,
    private loginService: LoginService,
    private bookingService: BookingService,
    private optionsService: OptionsService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.getOptionEintrag();
    this.loginService.getUser().subscribe({
      next: (val) => {
        this.user = { ...val };
        this.displayUser = { ...val };
      },
      error: () => {
        this.user = undefined;
        this.displayUser = undefined;
      },
    });
    this.loadBookings(); 
  }

  //hier werden alle bookings eines users erstmal geladen und gescpeichert
  loadBookings(): void {
    this.bookingService.getBookings().subscribe(
      (data: Booking[]) => {
        const now = new Date();
        this.currentBookings = data.filter(booking => new Date(booking.returnTime) > now);
        this.pastBookings = data.filter(booking => new Date(booking.returnTime) <= now);
        console.log('success loading booking list');
        this.concatBookings();
        this.getAllScooter();
      },
      (error) => {
        console.error('Error loading bookings', error);
      }
    );
  }
 
  //immer wenn der filter des dropdown geändert wird ändern wir zum ausgewählten wert.
  onFilterChange(event: any): void {
    this.selectedFilter = event.target.value;
  }

  //verknüpfe vergangene und aktuelle bookings
  concatBookings():void{
    this.allBookings = this.currentBookings.concat(this.pastBookings);
  }
  
  //filter alle bookings nach ausgewähltem datum
  filterBookings(filter: string):Booking[]{
    let filteredBookings:Booking[] = [];

    switch (filter) {
      case 'day':
        filteredBookings = this.allBookings.filter(booking => {
          const returnDate = new Date(booking.bookingTime);
          return this.isWithinDays(returnDate, this.now, 1);
        });
        break;
      case 'week':
        filteredBookings = this.allBookings.filter(booking => {
          const returnDate = new Date(booking.bookingTime);
          return this.isWithinDays(returnDate, this.now, 7);
        });
        break;
      case 'month':
        filteredBookings = this.allBookings.filter(booking => {
          const returnDate = new Date(booking.bookingTime);
          return this.isWithinDays(returnDate, this.now, 30);
        });
        break;
      case 'total':
        filteredBookings = this.allBookings;
        break;
      default:
        throw new Error('Invalid filter specified');
    }
    return filteredBookings;
  }

  calculateTotalPrice(filter:string): number{
    const filteredBookings:Booking[] = this.filterBookings(filter);

    let finalPrice = 0;
    for (const booking of filteredBookings) {
      finalPrice = finalPrice + booking.totalPrice;
    }
    return finalPrice;
  }

  calculateTotalHours(filter: string): number {
    const filteredBookings:Booking[] = this.filterBookings(filter);

    let totalHours = 0;
    for (const booking of filteredBookings) {
      totalHours += booking.hours;
    }
    return totalHours;
  }

  calculateTotalBookings(filter: string): number {
    const filteredBookings:Booking[] = this.filterBookings(filter);

    return filteredBookings.length;
  }

  calculateTotalDistance(filter: string): number {
    const filteredBookings:Booking[] = this.filterBookings(filter);

    return this.getrelevantScooter(filteredBookings);;
  }

  //gibt nur scooter zurrück die im time frame des filters gebucht wurden
  getrelevantScooter(bookings:Booking[]):number{
    let filteredScooters:Product[] = [];
    for (const scooter of this.scooters) {
      for (const booking of bookings) {
        if (scooter.id === booking.scooterId) {
          filteredScooters = filteredScooters.concat(scooter);
        }
      }
    }
    let totalDistance = 0;
    for (const booking of bookings) {
      for (const scooter of filteredScooters) {
        if (scooter.id === booking.scooterId) {
          totalDistance = totalDistance + (scooter.max_speed * booking.hours * 0.5);
        }
      }
    }
    return totalDistance;
  }  

  getAllScooter():void{
    for (const booking of this.allBookings) {
      this.productService.getProductById(booking.scooterId).subscribe((product) => {
        this.scooters = this.scooters.concat(product);
      });
    }
  }

  calculateAverageHours(numBookings: number, totalHours: number):number{
    return totalHours / numBookings;
  }

  calculateAveragePrice(numBookings: number, totalPrice: number):number{
    return totalPrice / numBookings;
  }

  calculateAverageDistance(numBookings: number, totalDistance: number):number{
    return totalDistance/ numBookings;
  }

  
  //methode umzu bestimmen ob eine buchung noch inerhalb eines gewissen zeitfensters liegt
  private isWithinDays(date1: Date, date2: Date, days: number): boolean {
    const differenceInTime =  date2.getTime() - date1.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return differenceInDays <= days;
  }

  //lade den optionen eintrag um die anzeige werte umzurechnen
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

  roundValue(val:number): number{
    return Math.round(val * 100) / 100;
  }

  getPricewithUnit(price: number): string {
    if (this.option) {
      const money =
        Math.round(
          this.optionsService.changeToEuro(this.option, price) * 100
        ) / 100;
      const symbol = this.optionsService.getSymbolMoney(this.option);
      return symbol + money;
    }
    return 'error';
  }

  getDistancewithUnit(distance: number):string {
    if (this.option) {
      const distanceFinal =
        Math.round(
          this.optionsService.changeToMiles(this.option, distance) * 100
        ) / 100;
      const symbol = this.optionsService.getSymbolDistance(this.option);
      return  distanceFinal + symbol ;
    }
    return 'error';
  }

}