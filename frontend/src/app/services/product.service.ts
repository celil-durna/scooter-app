import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { Review } from '../models/review';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8000/api/products';

  public showDropdown = false;
  public showStarFilter = false;
  public filteredReview: Review[] = [];

  constructor(private http: HttpClient) {}

  public getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products');
  }

  // Wir holen das Bild mit dem jeweiligen Namen aus dem Backend
  getProductImage(productName: string, products: Product[]): string {
    let product = null;
    for (let i = 0; i < products.length; i++) {
      if (products[i].name === productName) {
        product = products[i];
      }
    }
    return product ? `/api/img/${product.image}` : ''; //mit product.image greifen wir auf jpg Dateien zu
  }

  public getProductInfo(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductByName(name: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/name/${name}`);
  }
}
