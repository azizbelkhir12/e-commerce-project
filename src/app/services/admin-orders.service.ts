import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminOrdersService {

  private adminApiUrl ='http://localhost:3000/api/admin'
  private orderApiUrl ='http://localhost:3000/api/order'
  
  
  constructor(private http: HttpClient) { }
  
  getOrders(){
      return this.http.get<any>(`${this.adminApiUrl}/dashboard/orders`)
    }

    updateOrderStatus(orderId: string, status: string): Observable<any> {
      return this.http.put(`${this.orderApiUrl}/modify/${orderId}`, { status });
    }
  
    cancelOrder(orderId: string, cancellationReason: string): Observable<any> {
      return this.http.put(`${this.orderApiUrl}/modify/${orderId}`, { 
        status: 'canceled',
        cancellationReason 
      });
    }
}
