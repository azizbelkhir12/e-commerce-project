import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  user: any;
  passwordVisible: boolean = false;
  errorMessage: string = '';
  title1: string = 'Home';
  title2: string = 'Login';

  constructor(
    private loginService: AuthService,
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.checkIfLoggedIn();
  }
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  login() {
    const user = { email: this.email, password: this.password };
    this.authService.login(user).subscribe(
      (response) => {
        localStorage.setItem('token', response.token);
        const role = this.authService.getUserRole();
        if (role === 'client') {
          this.cartService.syncGuestCartToDB().subscribe(() => {
            this.router.navigate(['/']);
            window.location.reload();
          });
        } else {
          this.errorMessage = 'Unauthorized: Not a client account.';
          localStorage.removeItem('token');
        }
      },
      () => {
        this.errorMessage = 'Login failed, please check your credentials.';
      }
    );
  }

  loginWithGoogle() {
    const width = 500;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const googleAuthWindow = window.open(
      'http://localhost:3000/api/auth/google',
      'GoogleAuthPopup',
      `width=${width},height=${height},top=${top},left=${left},resizable=no,scrollbars=no`
    );

    window.addEventListener('message', (event) => {
      if (event.origin !== 'http://localhost:3000') return;
      const { token, role } = event.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        googleAuthWindow?.close();
        this.cartService.syncGuestCartToDB().subscribe(() => {
          this.router.navigate(['/']);
          window.location.reload();
        });
      }
    });
  }

  checkIfLoggedIn() {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/']);
    }
  }
}
