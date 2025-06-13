import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private adminApiUrl = 'http://localhost:3000/api/admin';
  private apiUrl = 'http://localhost:3000/api/user';
  private productsUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getProducts() {
    return this.http.get<any>(`${this.adminApiUrl}/dashboard/products`);
  }

  getCategories() {
    return this.http.get<any>(
      `${this.adminApiUrl}/dashboard/products/categories`
    );
  }

  deleteProduct(id: string) {
    return this.http.delete(`${this.adminApiUrl}/delete/${id}`);
  }

  updateProduct(id: string, updatedProduct: any) {
    return this.http.put(`${this.adminApiUrl}/update/${id}`, updatedProduct);
  }

  addProduct(product: any): Observable<any> {
    return this.http.post<any>(
      `${this.adminApiUrl}/dashboard/products/add`,
      product
    );
  }
  addCategory(name: any) {
    return this.http.post<any>(
      `${this.adminApiUrl}/dashboard/products/category/add`,
      name
    );
  }

  getUserProducts(page: number, limit: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/products`, { params });
  }

  getProductsByCategory(category: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/category/${category}`);
  }
  getNewArrivals(): Observable<any> {
    return this.http.get<any>(`${this.productsUrl}/new-arrivals`);
  }
  getBestSellers(): Observable<any> {
    return this.http.get<any>(`${this.productsUrl}/best-sellers`);
  }
}
