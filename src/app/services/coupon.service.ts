// coupon.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private apiUrl = 'http://localhost:3000/api/coupons';

  constructor(private http: HttpClient) {}

  
  getCoupons(){
    return this.http.get<any>(`${this.apiUrl}/coupons`);
  }

  
  addCoupon(coupon: any) {
    return this.http.post<any>(`${this.apiUrl}/coupons`, coupon);
  }

  
  deleteCoupon(id: any) {
    return this.http.delete<any>(`${this.apiUrl}/coupons/${id}`);
  }

  getCouponByCode(couponCode: any){
    return this.http.get<any>(`${this.apiUrl}/coupons/${couponCode}`);
  }
  
}
