import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  constructor(private http: HttpClient) {}
  readonly apiUrl = 'http://localhost:3000/api';

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveOrder(order: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/order/order`, order);
  }

  getMyOrders(): Observable<any> {
    const token = this.getToken();
    return this.http.get<any>(`${this.apiUrl}/order/my-orders`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
  getOrderDetails(orderId: string): Observable<any> {
    const token = this.getToken();
    return this.http.get<any>(`${this.apiUrl}/order/${orderId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  cancelOrder(orderId: String, status: String): Observable<any> {
    const token = this.getToken();
    const body = { orderId, status };
    return this.http.patch(`${this.apiUrl}/order/cancel/`, body, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

}
