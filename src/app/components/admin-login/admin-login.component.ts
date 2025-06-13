import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-admin',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
})
export class AdminLoginComponent implements OnInit {
  email = '';
  password = '';
  passwordVisible = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  ngOnInit(): void {
    this.checkIfLoggedIn();
  }

  login() {
    const user = { email: this.email, password: this.password };
    this.authService.login(user).subscribe(
      (response) => {
        localStorage.setItem('token', response.token);
        const role = this.authService.getUserRole();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = 'Unauthorized: Not an admin account.';
          localStorage.removeItem('token');
        }
      },
      () => {
        this.errorMessage = 'Login failed, please check your credentials.';
      }
    );
  }

  checkIfLoggedIn() {
    const token = localStorage.getItem('token');
    if (token) {
      const role = this.authService.getUserRole();
      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else if (role === 'client') {
        this.router.navigate(['/']);
      }
    }
  }
}
