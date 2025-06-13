import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http : HttpClient) { }

  initiatePayment(amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/payement/payement`, { amount });
  }

  verifyPayment(paymentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/payement/verify/${paymentId}`);
  }
}
