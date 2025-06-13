import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api/cart';
  
  private cartItemCountSubject = new BehaviorSubject<number>(0); // 👈 shared count
  cartItemCount$ = this.cartItemCountSubject.asObservable(); // 👈 observable for others to subscribe

  constructor(private http: HttpClient) {
    this.initCartCount(); // initialize once
  }

  initCartCount() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      this.getCartFromDB(token).subscribe({
        next: (cartData) => this.cartItemCountSubject.next(cartData.items.length),
        error: () => this.cartItemCountSubject.next(0),
      });
    } else {
      const localCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      this.cartItemCountSubject.next(localCart.length);
    }
  }

  updateCartCount(count: number) {
    this.cartItemCountSubject.next(count);
  }

  getCartFromDB(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.apiUrl, { headers });
  }

  addToCartInDB(product: any, token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/add`, { productId: product._id, quantity: 1 }, {headers});
  }

  addToCartInCookie(product: any) {
    let cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
  
    const index = cart.findIndex((item: any) => item.productId === product._id);
    
    if (index > -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({ productId: product._id, quantity: 1 });
    }
  
    localStorage.setItem('guest_cart', JSON.stringify(cart));
  }

  getProductsByIds(ids: string[]) {
    return this.http.post<any>(`${this.apiUrl}/products/bulk`, { ids });
  }

  syncGuestCartToDB(): Observable<any> {
    const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (guestCart.length === 0) return of(null);
    
    return this.http.post(`${this.apiUrl}/sync`, { items: guestCart }, {headers}).pipe(
      tap(() => localStorage.removeItem('guest_cart'))
    );
  }
  
  
  removeProductFromCart(cartId: string, productId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${cartId}/product/${productId}`);
  }

  applyCouponToCart(cartId: string, couponId: string) {
    return this.http.put(`${this.apiUrl}/${cartId}/apply-coupon`, { couponId });
  }
  checkoutCart(cartId: string, shippingCost: number, couponId?: string) {
    const body: any = { shippingCost };
  if (couponId) {
    body.couponId = couponId;
  }
    return this.http.put<any>(`${this.apiUrl}/${cartId}/checkout`, { shippingCost });
  }
  
  
  updateCartInDB(token: string, newCartItems: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(this.apiUrl, { newCartItems }, { headers });
  }
  clearCartInDB(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(this.apiUrl + '/all', { headers });
  }
}
