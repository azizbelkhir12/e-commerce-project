import { Component, OnInit } from '@angular/core';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { from } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  isAdmin: boolean = false;
  title = 'e-commerceFullStack';

  constructor(public router: Router) {}

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: JwtPayload & { role?: string } = jwtDecode(token);

        if (decodedToken.role === 'admin') {
          this.isAdmin = true;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }
}
