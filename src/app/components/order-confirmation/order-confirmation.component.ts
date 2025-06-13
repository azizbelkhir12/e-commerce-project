import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css'
})
export class OrderConfirmationComponent {

  orderId: string | null = null;
  token: string | null = null;
  confirmationMessage: string = '';

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.orderId = params['orderId'];
      this.token = params['token'];
      if (this.orderId && this.token) {
        this.confirmOrder(this.orderId, this.token);
      }
    });
  }

  confirmOrder(orderId: string, token: string): void {
    const confirmationData = {
      orderId,
      token,
    };
    const headers = { 'Content-Type': 'application/json' };

    const url = `http://localhost:3000/api/order/confirm-order/${orderId}/${token}`;

this.http
  .post(url, {}, { headers })
  .subscribe(
    (response) => {
      this.confirmationMessage = 'Your order has been confirmed!';
    },
    (error) => {
      this.confirmationMessage = 'There was an error confirming your order.';
    }
  );
  }

  goHome(): void {
    window.location.href = '/';
  }
}




