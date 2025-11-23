import { Review } from 'src/app/models/review';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from 'src/app/services/review.service';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
})
export class DropdownComponent implements OnInit {
  // @Output() isDropdownOpenChanged = new EventEmitter<boolean>(); // togglen die dropdown leiste damit
  sortOptions = ['Relevanz', 'Älteste', 'Neueste'];
  currentSort = '';
  otherSort: string[] = [];
  selectedId = -1;
  reviews: Review[] = [];
  @Output() sortCriteriaChanged = new EventEmitter<string>(); // müssen der Productpage mitteilen, dass sich der Filter geändert hat.

  constructor(
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    protected productService: ProductService
  ) {}

  ngOnInit(): void {
    this.currentSort = 'Relevanz'; // standardmäßige sortierung der reviews beim initialisieren der product page
    this.otherSort = this.sortOptions.filter(
      (sort) => sort !== this.currentSort
    ); // Um die sortOptions nach auswahl zu ändern

    this.selectedId = Number(this.route.snapshot.params['id']);
    this.reviewService
      .getReviewsByScooterId(this.selectedId)
      .subscribe((review) => {
        this.reviews = review;
        this.sortBy(this.currentSort);
        console.log(this.reviews); // das sind die reviews die sortiert sind
      });
  }

  sortBy(criteria: string): void {
    this.currentSort = criteria;
    this.sortCriteriaChanged.emit(criteria); // Emit the event

    this.otherSort = this.sortOptions.filter(
      (sort) => sort !== this.currentSort
    ); // Um die sortOptions nach auswahl zu ändern

    this.productService.showDropdown = false;
    console.log(`Sortieren nach: ${criteria}`);
  }
}
