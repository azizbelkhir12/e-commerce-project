import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  _id?: string;
  userId?: string;
  productId: string;
  review: string;
  rating: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private baseUrl = 'http://localhost:3000/api/review';
  private productUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Get product by ID
  getProduct(productId: string): Observable<any> {
    return this.http.get(`${this.productUrl}/${productId}`);
  }

  // Get Related products
  getRelatedProducts(productId: string): Observable<any> {
    return this.http.get(`${this.productUrl}/related/${productId}`);
  }

  // Get all reviews for a product
  getReviews(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/${productId}`);
  }

  // Create a new review (Requires authentication)
  createReview(productId: string, review: Review): Observable<any> {
    return this.http.post(`${this.baseUrl}/${productId}`, review || '', {
      headers: this.getAuthHeaders(),
    });
  }

  // Update a review (Requires authentication)
  updateReview(reviewId: string, review: Review): Observable<any> {
    return this.http.put(`${this.baseUrl}/${reviewId}`, review, {
      headers: this.getAuthHeaders(),
    });
  }

  // Delete a review (Requires authentication)
  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${reviewId}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
