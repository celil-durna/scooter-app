import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { ScooterService } from 'src/app/services/scooter.service';
import { ProductService } from 'src/app/services/product.service';
import { Scooter } from 'src/app/models/scooter';
import { Product } from 'src/app/models/product';
import { SearchInputComponent } from 'src/app/components/search-input/search-input.component';
import { GreenButtonComponent } from 'src/app/components/green-button/green-button.component';
import { ReviewService } from 'src/app/services/review.service';
import { Review } from 'src/app/models/review';

import { Option } from 'src/app/models/option';
import { OptionsService } from 'src/app/services/options.service';
/**
 * Typescript erlaub es uns, auch einen ganzen Namespace zu importieren statt einzelne Komponenten.
 * Die "Komponenten" (Klassen, Methoden, ...) des Namespace können dann via "Leaflet.Komponente"
 * aufgerufen werden, z.B. "Leaflet.LeafletMouseEvent" (siehe unten)
 */
import * as Leaflet from 'leaflet';

/**
 * Konstante Variablen können außerhalb der Klasse definiert werden und sind dann
 * innerhalb der ganzen Klasse verfügbar.
 */

const defaultIcon = Leaflet.icon({
  // Grüner icon
  iconSize: [40, 40],
  iconUrl: '/assets/marker.png',
  className: 'defaultIcon',
});
const yellowIcon = Leaflet.icon({
  iconSize: [40, 40],
  iconUrl: '/assets/marker_yellow.png',
  className: 'yellowIcon',
});
const redIcon = Leaflet.icon({
  iconSize: [40, 40],
  iconUrl: '/assets/marker_red.png',
  className: 'redIcon',
});

@Component({
  standalone: true,
  imports: [
    LeafletModule,
    CommonModule,
    SearchInputComponent,
    GreenButtonComponent,
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  /**
   * Bitte Dokumentation durchlesen:
  https://github.com/bluehalo/ngx-leaflet
   */
  options: Leaflet.MapOptions = {
    layers: [
      new Leaflet.TileLayer(
        'http://konstrates.uni-konstanz.de:8080/tile/{z}/{x}/{y}.png'
      ),
    ],
    zoom: 16,
    center: new Leaflet.LatLng(47.663557, 9.175365),
    attributionControl: false,
  };

  view: 'map' | 'list' = 'map';
  /**
   * Um z.B. einen Marker auf der Map einzuzeichnen, übergeben wir Leaflet
   * ein Array von Markern mit Koordinaten. Dieses Attribut wird im HTML Code
   * dann an Leaflet weitergegeben.
   * Dokumentation: https://github.com/bluehalo/ngx-leaflet#add-custom-layers-base-layers-markers-shapes-etc
   */

  layers: Leaflet.Layer[] = []; // Initialisiere ein leeres Array für die Marker
  scooters: Scooter[] = [];
  products: Product[] = [];
  filteredScooters: Scooter[] = [];
  searchText = '';
  averageRatings: { [key: number]: number } = {};
  option?: Option;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private scooterService: ScooterService,
    private productService: ProductService,
    private ngZone: NgZone,
    private reviewService: ReviewService,
    private optionsService: OptionsService
  ) {}

  //für mehrere Tabs: leitet abgemeldete Benutzer auf Login Seite zurück wenn man
  //auf Scooter-Suchbutton klickt.
  //das kann man wahrscheinlich noch mit dem login Guard besser machen!
  ngOnInit(): void {
    this.getOptionEintrag();
    this.loginService.checkAuth().subscribe({
      next: (isLoggedIn) => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']);
        }
      },
    });

    //Scooter-Daten abrufen und Marker erstellen
    this.loadAvailableScooters();

    // Damit man auf die HTML Beschreibungen zugreifen kann von den jeweiligen scooter
    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data;
    });
  }

  loadAvailableScooters(): void {
    this.scooterService
      .getAvailableScooters()
      .subscribe((scooters: Scooter[]) => {
        this.scooters = scooters;
        this.filteredScooters = scooters;
        this.loadAverageRatings(); // für durchschnittliche Sternebewertung
        this.updateMapMarkers();
      });
  }

  loadAverageRatings(): void {
    this.scooters.forEach((scooter) => {
      this.reviewService
        .getReviewsByScooterId(scooter.id) //Methode in service Datei
        .subscribe((reviews) => {
          const averageRating = this.calculateAverageRating(reviews);
          this.averageRatings[scooter.id] = averageRating;
        });
    });
  }

  updateMapMarkers(): void {
    this.layers = [];
    this.scooters.forEach((scooter) => {
      let markerIcon = defaultIcon;

      if (scooter.battery < 25 && scooter.battery >= 1) {
        markerIcon = redIcon;
      } else if (scooter.battery <= 50 && scooter.battery >= 25) {
        markerIcon = yellowIcon;
      } else if (scooter.battery < 1) {
        return;
      }

      const remaining = 100 - scooter.battery;

      const dynamicIcon = Leaflet.divIcon({
        html: `
        <div class="icon-image-container">
         <div class="image-container" style="position: absolute; 
          overflow: hidden; height: ${remaining}%">
          <img src="/assets/marker_grey.png" class="overlay-image" style="width: 40px; height: 40px;" />
         </div>
        </div>`,
        className: 'marker_grey',
        iconSize: [40, 40],
      });

      // Der Marker der über die farbige Marker gelegt wird wegen dynamischer Batterieanzeige
      const inverseMarker = Leaflet.marker(
        [scooter.coordinates_lat, scooter.coordinates_lng],
        {
          icon: dynamicIcon,
        }
      );

      const marker = Leaflet.marker(
        [scooter.coordinates_lat, scooter.coordinates_lng],
        {
          icon: markerIcon,
        }
      );
      inverseMarker.on('click', () => {
        // auf dem invertierten Marker sollte man klicken können um auf die Page zu gelangen
        this.ngZone.run(() => {
          this.router.navigate(['/scooters', scooter.id]);
        });
      });
      this.layers.push(marker);
      this.layers.push(inverseMarker);
    });
  }

  /**
   * Diese Methode wird im "map.component.html" Code bei Leaflet registriert
   * und aufgerufen, sobald der Benutzer auf die Karte klickt
   */
  onMapClick(e: Leaflet.LeafletMouseEvent): void {
    console.log(`${e.latlng.lat}, ${e.latlng.lng}`);
  }

  toggleListView(): void {
    this.view = this.view === 'map' ? 'list' : 'map';
  }

  //---------- ab hier Methoden für Scooterliste -----------//

  getProductDetails(productName: string): Product | undefined {
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].name === productName) {
        return this.products[i];
      }
    }
    return undefined;
  }

  roundBatteryStatus(battery: number): number {
    return Math.round(battery);
  }

  calculateReach(
    battery: number | undefined,
    maxReach: number | undefined
  ): number {
    if (battery === undefined || maxReach === undefined) {
      return 0; // or some default value or error handling
    }
    return Math.round((this.roundBatteryStatus(battery) * maxReach) / 100);
  }

  getProductImage(productName: string): string {
    return this.productService.getProductImage(productName, this.products);
  }

  onInputChange(): void {
    this.filteredScooters = this.scooters
      //.filter((s) => !s.is_booked)
      .filter((s) =>
        s.product.toLowerCase().includes(this.searchText.toLowerCase())
      );
  }

  scooterpage(id: number): void {
    this.router.navigateByUrl(`/scooters/${id}`);
  }

  //für durchschnittliche Sternebewertung:
  calculateAverageRating(reviews: Review[]): number {
    let totalRatings = 0;

    for (let i = 0; i < reviews.length; i++) {
      totalRatings += reviews[i].valuation;
    }

    if (reviews.length === 0) {
      return 0;
    } else {
      return totalRatings / reviews.length;
    }
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

  getPricePerHour(scooter: string): string {
    if (this.option) {
      const val = this.getProductDetails(scooter)?.price_per_hour;
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

  getReach(scooter: string, battery: number): string {
    if (this.option) {
      const val = this.getProductDetails(scooter)?.max_reach;
      if (val) {
        const distance = this.optionsService.changeToMiles(this.option, val);
        const reachSymbol = this.optionsService.getSymbolDistance(this.option);
        return Math.round((battery * distance) / 100) + reachSymbol;
      }
    }
    return 'error';
  }
}
