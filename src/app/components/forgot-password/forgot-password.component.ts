import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  title1: string = 'Home';
  title2: string = 'Forget Password';
  constructor(private forgotService: AuthService) {}

  forgotForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ])
  });

  submit() {
    if (this.forgotForm.invalid) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Please enter a valid email",
        showConfirmButton: false,
        timer: 2000
      });
    }

    console.log('Form submitted:', this.forgotForm.value);

    this.forgotService.sendEmailService(this.forgotForm.value.email).subscribe({
      next: (res) => {
         
        Swal.fire({
          position: "center",
          icon: "success",
          title: res.message,
          showConfirmButton: false,
          timer: 2000
        });
        this.forgotForm.reset();
      },
      error: (err) => {
        console.log('error',err);
        Swal.fire({
          position: "center",
          icon: "success",
          title:"An error occurred",
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }
}