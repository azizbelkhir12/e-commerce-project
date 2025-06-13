import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';

interface JwtPayload {
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl ='http://localhost:3000/api/auth'

  constructor(private http : HttpClient) { }

  login(user:any){
    return this.http.post<any>(`${this.apiUrl}/login`, user)
  }

  register(username: string, email: string, password: string, confirmPassword: string): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/register`, { username, email, password, confirmPassword });
    }

    sendEmailService(email: string) {
      return this.http.post<{ message: string }>(`${this.apiUrl}/send-email`, { email });
    }
    
    resetPasswordService(resetObj: { password: string; token: string }) {
      return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, resetObj);
    }

    isAuthenticated(): boolean {
      const token = localStorage.getItem('token');
      return !!token;
    }

    getUserRole(): string {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded: JwtPayload = jwtDecode(token);
          return decoded.role;
        } catch (error) {
          console.error('Invalid token', error);
          return '';
        }
      }
      return '';
    }
    
}
