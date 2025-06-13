import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
})
export class PaymentSuccessComponent implements OnInit {
  message = 'Processing your payment...';
  error = '';

  constructor(
    private orderService: OrdersService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const orderDataString = localStorage.getItem('pendingOrder');

    if (orderDataString) {
      const orderData = JSON.parse(orderDataString);
      orderData.isPaid = true;
      orderData.status = 'processing';

      this.orderService.saveOrder(orderData).subscribe({
        next: () => {
          localStorage.removeItem('pendingOrder');
          this.clearCart();
          this.message = 'Your payment was successful! Redirecting...';
          setTimeout(() => this.router.navigate(['/order-confirmation']), 3000);
        },
        error: () => {
          this.error = 'Failed to finalize order. Please contact support.';
        },
      });
    } else {
      this.error = 'No pending order found. Please try again.';
    }
  }

  private clearCart(): void {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      this.cartService.clearCartInDB(token).subscribe();
    } else {
      localStorage.removeItem('cart');
    }
  }

}
