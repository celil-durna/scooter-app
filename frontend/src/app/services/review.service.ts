import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { ResponseMessage } from '../models/response-message';
import { Review } from '../models/review';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  constructor(private http: HttpClient) {}

  public createReview(
    scooterId: number,
    valuation: number,
    text: string
  ): Observable<ResponseMessage> {
    return this.http
      .post<ResponseMessage>('/api/createReview', {
        scooterId,
        valuation,
        text,
      })
      .pipe(shareReplay());
  }

  public hasReviewed(scooterId: number): Observable<{ hasReviewed: boolean }> {
    return this.http.get<{ hasReviewed: boolean }>(
      `/api/hasReviewed?scooterId=${scooterId}` 
    );
  }

  public getReviewsByScooterId(scooterId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`/api/reviews/scooter/${scooterId}`);
  }

  public likeReview(reviewId: number): Observable<ResponseMessage> {
    return this.http
      .post<ResponseMessage>('/api/likeReview', { reviewId })
      .pipe(shareReplay());
  }

  public unlikeReview(reviewId: number): Observable<ResponseMessage> {
    return this.http
      .post<ResponseMessage>('/api/unlikeReview', { reviewId })
      .pipe(shareReplay());
  }

  public isReviewLiked(
    reviewId: number,
    userId: number
  ): Observable<{ liked: boolean }> {
    return this.http.get<{ liked: boolean }>(
      `/api/isReviewLiked?reviewId=${reviewId}&userId=${userId}`
    );
  }

  public updateReview(
    reviewId: number,
    text: string,
    valuation: number
  ): Observable<ResponseMessage> {
    return this.http
      .post<ResponseMessage>('/api/updateReview', { reviewId, text, valuation })
      .pipe(shareReplay());
  }

  public deleteReview(reviewId: number): Observable<ResponseMessage> {
    return this.http
      .delete<ResponseMessage>('/api/deleteReview', {
        body: { reviewId },
      })
      .pipe(shareReplay());
  }
}
