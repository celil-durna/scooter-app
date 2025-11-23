import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Review } from 'src/app/models/review';
import { ProductComponent } from 'src/app/pages/products/products.component';
import { ProductService } from 'src/app/services/product.service';
import { ReviewService } from 'src/app/services/review.service';

@Component({
  selector: 'app-star-filter',
  standalone: true,
  imports: [CommonModule, ProductComponent],
  templateUrl: './star-filter.component.html',
  styleUrl: './star-filter.component.css',
})
export class StarFilterComponent implements OnInit {
  filterOptions = [1, 2, 3, 4, 5];
  selectedId = -1;
  reviews: Review[] = [];
  allReviews: Review[] = [];
  @Output() starFilterChanged = new EventEmitter<Review[]>(); // müssen der Productpage mitteilen, dass sich der Filter geändert hat.
  filterIsOn = false; // für den dropdown/dropup

  constructor(
    protected productService: ProductService,
    private reviewService: ReviewService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.selectedId = Number(this.route.snapshot.params['id']);
    this.reviewService
      .getReviewsByScooterId(this.selectedId)
      .subscribe((review) => {
        this.reviews = review;
        this.allReviews = review; // damit wir später dann selektiv rausfiltern können
      });
  }

  filterBy(starsAmount: number): void {
    console.log(this.allReviews);
    this.filterIsOn = true;
    this.reviews = this.allReviews.filter(
      (val) => val.valuation === starsAmount // jetzt sind nur die mit bestimmter anzahl an sternen in reviews drin
    );

    this.productService.showStarFilter = false;
    console.log(`Filtern nach: ${starsAmount}`);
    console.log(this.reviews);

    this.starFilterChanged.emit(this.reviews);
  }

  resetFilter(): void {
    this.reviews = this.allReviews; // resetten die reviews auf der originalen liste
    this.filterIsOn = false;
    this.starFilterChanged.emit(this.reviews); // Emiten die neue liste
  }
}
