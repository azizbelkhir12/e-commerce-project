import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/api/user';
  private adminApiUrl ='http://localhost:3000/api/admin'

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { }

  changePassword(currentPassword: String, newPassword: String, repeatPassword: String): Observable<void> {

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.apiUrl}/change-password`, { currentPassword, newPassword, repeatPassword }, { headers });
}

getUsers(){
  return this.http.get<any>(`${this.adminApiUrl}/dashboard/users`)
}

deleteUser(id:any){
  return this.http.delete<any>(`${this.adminApiUrl}/dashboard/delete-user/${id}`)
}

editUser(user: any): Observable<any> {
  return this.http.put<any>(`${this.adminApiUrl}/dashboard/edit-user/${user._id}`, user);
}

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();


  getProfile(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/profile`, { headers: this.createAuthHeaders() })
      .pipe(tap((user) => this.userSubject.next(user)));
  }

  patchProfile(data: any): Observable<any> {
    return this.http
      .patch(`${this.apiUrl}/profile`, data, { headers: this.createAuthHeaders() })
    
      .pipe(tap((updatedUser) => this.userSubject.next(updatedUser)));
  }

  private getAuthToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  private createAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  updateUser(user:any){
    return this.http.patch<any>(`${this.apiUrl}/dashboard/users/edit/${user.id}`,user)
  }

  getReviews() {
    return this.http.get<any>(`${this.adminApiUrl}/dashboard/reviews`)
  }

  deleteReview(id:any) {
    return this.http.delete<any>(`${this.adminApiUrl}/dashboard/delete-review/${id}`)
  }
  getAdminProfile(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/admin/profile`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(tap((admin) => this.userSubject.next(admin)));
  }
  
}
