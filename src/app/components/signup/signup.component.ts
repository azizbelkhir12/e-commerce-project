import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'
import { Router } from '@angular/router';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  ngOnInit(): void {
    this.checkIfLoggedIn();
  }

  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  passwordStrength: number = 0;

  updatePasswordStrength(password: string) {
    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Character type checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    this.passwordStrength = strength;
  }

  getStrengthColor() {
    if (this.passwordStrength <= 2) {
      return '#dc3545'; // danger (red)
    } else if (this.passwordStrength <= 4) {
      return '#ffc107'; // warning (yellow)
    } else {
      return '#198754'; // success (green)
    }
  }
  title1: string = 'Home';
  title2: string = 'Signup';

  constructor(private authService: AuthService,
      private router: Router) {}

  register() {
    // Use the register method from AuthService

    if (this.password !== this.confirmPassword) {
      Swal.fire({
                position: "center",
                icon: "error",
                title: "Passwords do not match!",
                showConfirmButton: false,
                timer: 2000
              });
      return;
    }

    this.authService
      .register(this.username, this.email, this.password, this.confirmPassword)
      .subscribe(
        (res) => {
          
          Swal.fire({
                  position: "center",
                  icon: "success",
                  title: "Your registration was successful!",
                  showConfirmButton: false,
                  timer: 3000
                });
                this.router.navigate(['/login']);
        },
        (err) => {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Registration failed! Something went wrong..",
            showConfirmButton: false,
            timer: 3000
          });
        }
      );
  }
  SignupWithGoogle() {
    const width = 500;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      'http://localhost:3000/api/auth/google',
      'GoogleAuthPopup',
      `width=${width},height=${height},top=${top},left=${left},resizable=no,scrollbars=no`
    );
  }

  checkIfLoggedIn() {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/';
    }
  }
}
