import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Review } from 'src/app/models/review';
import { LoginService } from 'src/app/services/login.service';
import { ReviewService } from 'src/app/services/review.service';
import { ToastComponent } from '../toast/toast.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-review-item',
  templateUrl: './review-item.component.html',
  styleUrls: ['./review-item.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent, ConfirmDialogComponent],
})
export class ReviewItemComponent implements OnInit {
  @Input() review!: Review;
  @Output() reviewDeleted = new EventEmitter<number>();
  currentUserId: number | undefined;
  liked = false;
  editing = false;
  reviewText = '';
  rating = 0;
  originalText = '';
  originalRating = 0;
  toastMessage = '';
  isSuccess = true;
  toastDuration = 2000;
  showConfirmDialog = false;

  @ViewChild('autosizeTextarea') autosizeTextarea!: ElementRef;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  constructor(
    private loginService: LoginService,
    private reviewService: ReviewService
  ) { }

  ngOnInit(): void {
    this.loginService.getUser().subscribe((user) => {
      this.currentUserId = user.userId;
      this.checkIfLiked();
    });

    this.reviewText = this.review.text;
    this.rating = this.review.valuation;
    this.originalText = this.review.text;
    this.originalRating = this.review.valuation;
  }

  // aus "Max Mustermann" wird "Max M."
  getFormattedLastName(lastName: string): string {
    return lastName.charAt(0) + '.';
  }

  checkIfLiked(): void {
    this.reviewService
      .isReviewLiked(this.review.reviewId, this.currentUserId!)
      .subscribe(
        (response) => {
          this.liked = response.liked;
        },
        (error) => {
          console.error('Error checking if review is liked:', error);
        }
      );
  }

  // Bewertung bei Klick auf den Daumen liken bzw. unliken
  likeReview(): void {
    if (this.review.userId !== this.currentUserId && !this.liked) {
      this.reviewService.likeReview(this.review.reviewId).subscribe(
        (response) => {
          if (response.success) {
            this.review.helpfulCounter++;
            this.liked = true;
          }
        },
        (error) => {
          console.error('Error liking review:', error);
        }
      );
    } else if (this.liked) {
      this.reviewService.unlikeReview(this.review.reviewId).subscribe(
        (response) => {
          if (response.success) {
            this.review.helpfulCounter--;
            this.liked = false;
          }
        },
        (error) => {
          console.error('Error unliking review:', error);
        }
      );
    }
  }

  // Bewertung im Bearbeitungsmodus 
  toggleEdit(): void {
    if (this.editing) {
      const trimmedReviewText = this.reviewText.trim();
      if (trimmedReviewText.length === 0) {
        this.showToast('Bitte verfassen Sie eine Bewertung', false);
        return;
      }
      if (trimmedReviewText !== this.originalText.trim() || this.rating !== this.originalRating) {
        this.saveReview(trimmedReviewText);
      }
      this.editing = false;
    } else {
      this.originalText = this.reviewText;
      this.originalRating = this.rating;
      this.editing = true;
      setTimeout(() => this.adjustTextareaHeight(), 0);
    }
  }


  setRating(star: number): void {
    if (this.editing) {
      this.rating = star;
    }
  }

  saveReview(trimmedReviewText: string): void {
    this.review.text = trimmedReviewText;
    this.review.valuation = this.rating;

    this.reviewService
      .updateReview(this.review.reviewId, trimmedReviewText, this.rating)
      .subscribe(
        (response) => {
          if (response.success) {
            this.review.edited = true;
            this.showToast('Bewertung wurde gespeichert!', true);
          }
        },
        (error) => {
          console.error('Error updating review:', error);
        }
      );
  }

  cancelEdit(): void {
    this.editing = false;
    this.reviewText = this.review.text;
    this.rating = this.review.valuation;
  }

  deleteReview(): void {
    this.showConfirmDialog = true;
  }

  confirmDeleteReview(): void {
    this.showConfirmDialog = false;
    this.reviewService.deleteReview(this.review.reviewId).subscribe(
      (response) => {
        if (response.success) {
          this.reviewDeleted.emit(this.review.reviewId);
        }
      },
      (error) => {
        console.error('Error deleting review:', error);
      }
    );
  }

  cancelDeleteReview(): void {
    this.showConfirmDialog = false;
  }

  adjustTextareaHeight(): void {
    const textarea = this.autosizeTextarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  showToast(message: string, isSuccess: boolean): void {
    this.toastMessage = message;
    this.isSuccess = isSuccess;
    this.toastComponent.show();
  }
}
