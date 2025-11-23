import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Scooter } from 'src/app/models/scooter';
import { Product } from 'src/app/models/product';
import { Review } from 'src/app/models/review';
import { ScooterService } from 'src/app/services/scooter.service';
import { ProductService } from 'src/app/services/product.service';
import { ReviewService } from 'src/app/services/review.service';
import { LoginService } from 'src/app/services/login.service';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ButtonComponent } from '../../components/button/button.component';
import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { GreenButtonComponent } from 'src/app/components/green-button/green-button.component';
import { CommentInputComponent } from 'src/app/components/comment-input/comment-input.component';
import { OkayDialogComponent } from 'src/app/components/okay-dialog/okay-dialog.component';
import { ReviewItemComponent } from 'src/app/components/review-item/review-item.component';
import { ToastComponent } from 'src/app/components/toast/toast.component';
import { Option } from 'src/app/models/option';
import { OptionsService } from 'src/app/services/options.service';
import * as L from 'leaflet';
import { DropdownComponent } from 'src/app/components/dropdown/dropdown.component';
import { StarFilterComponent } from 'src/app/components/star-filter/star-filter.component';

const defaultIcon = L.icon({
  iconSize: [40, 40],
  iconUrl: '/assets/marker.png',
});

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [
    LeafletModule,
    CommonModule,
    FormsModule,
    ButtonComponent,
    BackButtonComponent,
    GreenButtonComponent,
    CommentInputComponent,
    OkayDialogComponent,
    ReviewItemComponent,
    ToastComponent,
    DropdownComponent,
    StarFilterComponent,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductComponent implements OnInit {
  public products: Product[] = [];
  public scooters: Scooter[] = [];
  public product: Product | undefined;
  public scooter?: Scooter;
  public maxRange = 0;
  public selectedId = -1;
  public maxVelocity = 0;
  public reichweiteListe: number[] = [];
  public center = new L.LatLng(47.665066, 9.177526);
  public averageRating = 0;

  public lengthUnit = 'km';
  public option?: Option;

  layers: L.Layer[] = []; // Initialisiere ein leeres Array für die Marker
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  options: L.MapOptions = {
    layers: [
      new L.TileLayer(
        'http://konstrates.uni-konstanz.de:8080/tile/{z}/{x}/{y}.png'
      ),
    ],
    zoom: 16,
    center: this.center,
    attributionControl: false,
  };

  isActive = true;
  rating = 5;
  reviewText = '';
  canReview = false;
  showDialog = false;
  dialogHeader = '';
  dialogMessage = '';
  cameFromBookingItem = false;
  reviewExists = false;
  reviews: Review[] = [];
  allReviews: Review[] = [];
  numberOfReview = 0;
  userId: number | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private scooterService: ScooterService,
    protected productService: ProductService,
    private optionsService: OptionsService,
    private reviewService: ReviewService,
    private loginService: LoginService
  ) {}

  fetchScooterData(scooterId: number): void {
    this.scooterService.getScooterInfo().subscribe((scooters: Scooter[]) => {
      this.scooter = scooters.find((s) => s.id === scooterId);
      if (this.scooter !== undefined) {
        this.options.center = L.latLng(
          this.scooter.coordinates_lat,
          this.scooter.coordinates_lng
        );
        this.layers = [
          L.marker(
            [this.scooter.coordinates_lat, this.scooter.coordinates_lng],
            {
              icon: defaultIcon,
            }
          ),
        ];
      }
    });
  }

  ngOnInit(): void {
    this.getOptionEintrag();
    // Um die jeweilige Daten des ausgewählten Scooters zu kriegen
    this.selectedId = Number(this.route.snapshot.params['id']); // angeklickter scooterId
    this.scooterService.getScooterById(this.selectedId).subscribe((scooter) => {
      this.scooter = scooter;
      this.center = new L.LatLng(
        this.scooter?.coordinates_lat,
        this.scooter?.coordinates_lng
      );
      this.productService.getProductById(scooter.id).subscribe((product) => {
        this.product = product;
        this.getProductImgUrl();
      });

      this.loginService.getUser().subscribe((user) => {
        this.userId = user.userId;
        this.loadReviews(this.selectedId);
      });
    });

    this.route.paramMap.subscribe((params) => {
      const scooterId = Number(params.get('id'));
      this.fetchScooterData(scooterId);
    });

    this.scooterService.getScooterInfo().subscribe((data) => {
      this.scooters = data;
      this.productService.getProductInfo().subscribe((data) => {
        this.products = data;
        const maxReachResult = this.calculateMaxReach(
          this.scooters,
          this.products
        );
        this.maxRange = maxReachResult;
      });
    });

    //prüft, ob man von Buchungsübersicht kommt
    //Falls ja, wollen wir den "Buchen" Button nicht anzeigen
    this.cameFromBookingItem =
      this.route.snapshot.queryParams['fromBookingItem'] === 'true';

    //prüft, ob der User bei dem jeweiligen Scooter bereits eine Bewertung gegeben hat
    //Falls ja, kann der User keine Bewertung mehr senden
    this.reviewService.hasReviewed(this.selectedId).subscribe((res) => {
      this.isActive = !res.hasReviewed;
    });

    this.reviewService
      .getReviewsByScooterId(this.selectedId)
      .subscribe((review) => {
        this.reviews = review;
        this.numberOfReview = this.reviews.length;
        this.calculateAverageRating();
      });
  }

  calculateMaxReach(sList: Scooter[], pList: Product[]): number {
    for (const prod of pList) {
      for (const scoo of sList) {
        if (scoo.product === prod.name) {
          const reach = (scoo.battery / 100) * prod.max_reach;
          this.reichweiteListe.push(reach); // In dieser Liste sind alle Scooter-Reichweiten drin
        }
      }
    }
    this.maxRange = Math.max(...this.reichweiteListe);
    return this.maxRange;
  }

  getProductImgUrl(): string | undefined {
    if (this.scooter?.product === undefined) {
      return;
    }
    return `img/products/${this.scooter?.product}.jpg`;
  }

  getRoundedValue(num: number | undefined): number {
    if (num === undefined) {
      return 0;
    }
    return Math.round(num);
  }

  percentageOfMaxRange(range: number | undefined): number {
    if (range === undefined) {
      return 0;
    }
    return Math.round(range * (100 / this.maxRange));
  }

  percentageOfMaxVelocity(velocity: number | undefined): number {
    if (velocity === undefined) {
      return 0;
    }
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].max_speed > this.maxVelocity) {
        this.maxVelocity = this.products[i].max_speed;
      }
    }
    return velocity * (100 / this.maxVelocity);
  }

  calculateReach(
    battery: number | undefined,
    maxReach: number | undefined
  ): number {
    if (battery === undefined || maxReach === undefined) {
      return 0;
    }
    return Math.round((battery * maxReach) / 100);
  }

  getReachWithUnit(scooter: Scooter | undefined): string {
    if (this.option) {
      if (scooter === undefined) {
        return '';
      }

      const val = this.getProductDetails(scooter.product)?.max_reach;
      if (val) {
        const distance = this.optionsService.changeToMiles(this.option, val);
        const reachSymbol = this.optionsService.getSymbolDistance(this.option);
        return (
          Math.round(
            (this.getRoundedValue(scooter?.battery) * distance) / 100
          ) +
          ' ' +
          reachSymbol
        );
      }
    }
    return 'error';
  }

  getSpeedWithUnit(product: Product | undefined): string {
    if (this.option) {
      if (product === undefined) {
        return '';
      }

      const val = product?.max_speed;
      if (val) {
        const speed =
          Math.round(
            this.optionsService.changeToMilePerHour(this.option, val) * 100
          ) / 100;
        const symbol = this.optionsService.getSymbolSpeed(this.option);
        return speed + ' ' + symbol;
      }
    }
    return 'error';
  }

  /**
   * Diese Methode wird gebraucht, da die gleichen Scooters auf /api/products und
   * /api/scooters jeweils nicht die gleiche haben immer und auf Namen überprüft
   * werden müssen, da die Namen den Scooter in dem Fall identifizieren
   * @param productName
   * @returns das gesuchte Product
   */
  getProductDetails(productName: string | undefined): Product | undefined {
    if (productName === undefined) {
      return;
    }
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].name === productName) {
        return this.products[i];
      }
    }
    return undefined;
  }

  goBack(): void {
    window.history.back();
  }

  bookScooter(): void {
    if (this.scooter) {
      this.router.navigate(['/booking', this.scooter.id]);
    }
  }

  onMapClick(e: L.LeafletMouseEvent): void {
    console.log(`${e.latlng.lat}, ${e.latlng.lng}`);
  }

  getOptionEintrag(): void {
    this.optionsService.getOptions().subscribe({
      next: (val) => {
        this.option = val;
        console.log('succefully got option');
      },
      error: () => {
        this.option = undefined;
        console.log('could not get option');
      },
    });
  }

  getPricePerHour(scooter: string | undefined): string {
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

  sendReview(): void {
    if (this.scooter && this.reviewText) {
      this.reviewService
        .createReview(this.scooter.id, this.rating, this.reviewText)
        .subscribe({
          next: () => {
            console.log('Review successfully submitted');
            this.showDialog = true;
            this.isActive = false;
            this.dialogHeader = 'Gesendet!';
            this.dialogMessage = 'Vielen Dank für Ihre Bewertung.';
            this.loadReviews(this.selectedId);
          },
          error: (err) => {
            console.error('Error submitting review:', err);
            this.showDialog = true;
            this.dialogHeader = 'Fehler!';
            //alt: this.dialogMessage = err.error;
            //man braucht unten nicht alles, wird später noch überarbeitet
            switch (err.status) {
              case 400:
                this.dialogMessage = 'Erforderliche Felder fehlen.';
                break;
              case 403:
                this.dialogMessage = 'Sie müssen den Scooter erst buchen.';
                break;
              case 404:
                if (err.error === 'Session not found') {
                  this.dialogMessage = 'Sie sind nicht angemeldet.';
                } else if (err.error === 'User not found') {
                  this.dialogMessage = 'Benutzer nicht gefunden.';
                }
                break;
              case 409:
                if (err.error === 'User is not logged in') {
                  this.dialogMessage = 'Sie sind nicht eingeloggt.';
                } else if (err.error === 'User already has a Review') {
                  this.dialogMessage =
                    'Sie haben bereits eine Bewertung abgegeben.';
                }
                break;
              case 500:
                this.dialogMessage =
                  'Ein Fehler ist beim Erstellen der Bewertung aufgetreten.';
                break;
              default:
                this.dialogMessage = 'Ein unbekannter Fehler ist aufgetreten.';
                break;
            }
          },
        });
    } else {
      this.showDialog = true;
      this.dialogHeader = 'Ungültig!';
      this.dialogMessage = 'Bitte fügen Sie einen Kommentar hinzu.';
    }
  }

  // Pop-up schließen
  handleCancellation(): void {
    this.showDialog = false;
  }

  onSortCriteriaChanged(criteria: string): void {
    // Hier erfolgt das Sortieren von Reviews
    if (criteria === 'Relevanz') {
      this.reviews.sort((a, b) => b.helpfulCounter - a.helpfulCounter);
    } else if (criteria === 'Älteste') {
      this.reviews.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (criteria === 'Neueste') {
      this.reviews.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
  }

  onFilterChanged(filteredReviews: Review[]): void {
    console.log(filteredReviews);

    this.reviews = filteredReviews;
  }

  loadReviews(scooterId: number): void {
    this.reviewService.getReviewsByScooterId(scooterId).subscribe(
      (data: Review[]) => {
        if (data) {
          this.reviewExists = true; // Zeigen Dropdown nur, falls Reviews existieren
          this.reviews = data;
        }
        // Wenn der User kürzlich ein review geschickt hat, sollte seine Review für eine kurze Zeit ganz oben stehen
        if (this.userId) {
          this.reviews = data.sort((a, b) => {
            if (a.userId === this.userId) return -1;
            if (b.userId === this.userId) return 1;
            return 0;
          });
        }
        this.calculateAverageRating();
      },
      (error) => {
        console.error('Error loading reviews', error);
      }
    );
  }

  // Neue Methode zur Berechnung der durchschnittlichen Bewertung
  calculateAverageRating(): void {
    if (this.reviews.length > 0) {
      let totalRating = 0;
      this.reviews.forEach((review) => {
        totalRating += review.valuation;
      });
      this.averageRating = Math.floor(totalRating / this.reviews.length);
    } else {
      this.averageRating = 0;
    }
  }
  handleReviewDeleted(deletedReviewId: number | null): void {
    if (deletedReviewId !== null) {
      this.reviews = this.reviews.filter(
        (review) => review.reviewId !== deletedReviewId
      );
      this.resetReviewForm();
      this.showToast('Bewertung wurde gelöscht', true);
    } else {
      this.showToast('Fehler beim Löschen der Bewertung', false);
    }
  }

  resetReviewForm(): void {
    this.reviewText = '';
    this.rating = 5;
    this.isActive = true;
  }

  showToast(message: string, isSuccess: boolean): void {
    this.toastComponent.message = message;
    this.toastComponent.isSuccess = isSuccess;
    this.toastComponent.show();
  }
}
