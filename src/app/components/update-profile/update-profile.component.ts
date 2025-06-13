import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css'],
})
export class UpdateProfileComponent implements OnInit {
  @Input() user: any;
  profileForm: FormGroup;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.profileForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\d{8}$/)]],
      dateOfBirth: [''],
      profileImage: [null],
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.profileForm.patchValue({
        username: this.user.username,
        email: this.user.email,
        phone: this.user.phone,
        dateOfBirth: this.formatDateForInput(this.user.dateOfBirth),
      });
    }
  }

  formatDateForInput(dateString: string | null): string | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.userService.patchProfile(this.profileForm.value).subscribe(
        (response) => {
          console.log('Profile updated successfully', response);
          this.successMessage = 'Profile updated successfully! ✅';
          setTimeout(() => (this.successMessage = null), 5000);
        },
        (error) => {
          console.error('Error updating profile:', error);
        }
      );
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  closeMessage(): void {
    this.successMessage = null;
  }
}
