import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-fail',
  templateUrl: './payment-fail.component.html',
  styleUrls: ['./payment-fail.component.css'],
})
export class PaymentFailComponent {
  constructor(private router: Router) {}

  retryCheckout() {
    this.router.navigate(['/checkout']);
  }
}
