import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmPasswordService } from '../../services/confirmPassword/confirm-password.service';
import { ActivatedRoute, Router } from '@angular/router';
import { log } from 'console';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  title1: string = 'Home';
  title2: string = 'Reset Password';
  token !: string;
constructor(private resetService: AuthService,private router: Router,private activatedRoute:ActivatedRoute) { }

resetForm : FormGroup = new FormGroup({
  
    password: new FormControl('', [
      Validators.required,
    ]),
    confirmPassword: new FormControl('', [
      Validators.required
    ]),
},
{ validators: ConfirmPasswordService.matchingPassword() }
)

ngOnInit(){
this.activatedRoute.paramMap.subscribe(params =>{
  this.token = params.get('token') || '';
  console.log(this.token);

})
}

submit(){
  console.log('Form submitted:', this.resetForm.value);
  let restObj = {
    token:this.token,
    password:this.resetForm.value.password
  }
  this.resetService.resetPasswordService(restObj).subscribe({
    next: (res) => {
      Swal.fire({
                position: "center",
                icon: "success",
                title: res.message,
                showConfirmButton: false,
                timer: 2000
              });
      this.resetForm.reset();
      this.router.navigate(['login']);
    },
    error: (err) => {
      console.log('error',err);
      Swal.fire({
                position: "center",
                icon: "error",
                title: 'An error occurred.',
                showConfirmButton: false,
                timer: 2000
              });
    }
  });
}
}
