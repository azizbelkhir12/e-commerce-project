import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ConfirmPasswordService {
  
  static matchingPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmControl = control.get('confirmPassword');
      const confirmPassword = confirmControl?.value;

      if (!password || !confirmPassword) {
        return null; // Ne pas déclencher d'erreur si un champ est vide
      }

      const passwordsMismatch = password !== confirmPassword;
      
      if (passwordsMismatch) {
        confirmControl?.setErrors({ ...confirmControl.errors, notMatching: true });
      } else {
        confirmControl?.setErrors(null);
      }

      return passwordsMismatch ? { notMatching: true } : null;
    };
  }
}
