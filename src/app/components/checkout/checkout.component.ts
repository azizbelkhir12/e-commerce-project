import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { OrdersService } from '../../services/orders.service';
import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';
import { PaymentSuccessComponent } from '../../pages/payment-success/payment-success.component';
import { Router } from '@angular/router';
import { Console } from 'node:console';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  selectedPayment: string = 'credit_card';
  isProcessingPayment = false;
  paymentError = '';
  cartItems: any[] = [];
  cartSubtotal = 0;
  userId: string = '';
  shipping = 0;
  total = 0;
  showSuccessMessage = false;
  appliedCoupon: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private paymentService: PaymentService,
    private orderService: OrdersService,
    private cartService: CartService,
    private userService: UserService,
    private router: Router
  ) {
    this.checkoutForm = this.formBuilder.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      postcode: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.loadCartItems();
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.checkoutForm.patchValue({
          name: user.username,
          street: user.address.street,
          city: user.address.city,
          country: user.address.country,
          postcode: user.address.zipCode,
          phone: user.phone,
          email: user.email,
        });
      },
    });
  }
  loadCartItems(): void {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
  
    if (token) {
      this.cartService.getCartFromDB(token).subscribe(
        (cartData) => {
          this.cartItems = cartData.items;
          this.userId = cartData.clientId;
      
          // Use the values from the cart document
          this.cartSubtotal = cartData.items.reduce(
            (acc: number, item: any) => acc + item.price * item.quantity,
            0
          );
          this.shipping = cartData.shipping || 0;
          this.total = cartData.total; // <-- Use the precomputed total
          this.appliedCoupon = typeof cartData.couponId === 'object' ? cartData.couponId : null;
        },
        (error) => {
          console.error('Error fetching cart data from DB:', error);
          this.loadLocalCart();
        }
      );
    } else {
      this.loadLocalCart();
    }
  }
  

  loadLocalCart(): void {
    const localCart = localStorage.getItem('guest_cart');
    const couponStr = localStorage.getItem('appliedCoupon');
    
    try {
      this.appliedCoupon = couponStr ? JSON.parse(couponStr) : null;
      // Validate coupon structure
      if (this.appliedCoupon && (!this.appliedCoupon.discount || !this.appliedCoupon.code)) {
        this.appliedCoupon = null;
        localStorage.removeItem('appliedCoupon');
      }
    } catch (e) {
      this.appliedCoupon = null;
      localStorage.removeItem('appliedCoupon');
    }

    if (localCart) {
      try {
        this.cartItems = JSON.parse(localCart);
        this.calculateTotals(this.appliedCoupon?.discount || 0);
      } catch (e) {
        this.cartItems = [];
      }
    }
  }

  calculateTotals(discount: number = 0): void {
    this.cartSubtotal = this.cartItems.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
  
    this.shipping = this.cartSubtotal > 100 ? 0 : 10;
  
    const discountAmount = (this.cartSubtotal * discount) / 100;
  
    this.total = this.cartSubtotal + this.shipping - discountAmount;
  }
  


  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched(this.checkoutForm);
      return;
    }

    this.isProcessingPayment = true;
    this.paymentError = '';

    const billingDetails = this.checkoutForm.value;
    const orderData = {
      user: this.userId,
      products: this.cartItems.map((item: any) => ({
        product: item._id || item.productId,
        quantity: item.quantity,
      })),
      totalPrice: this.total,
      billingDetails,
      paymentMethod: this.selectedPayment,
      confirmationToken: '',
      notes: billingDetails.notes,
      isPaid: this.selectedPayment === 'credit_card' ? false : true,
      status: this.selectedPayment === 'credit_card' ? 'pending' : 'processing',
      coupon: this.appliedCoupon?.discount ? {
        code: this.appliedCoupon.code,
        discount: this.appliedCoupon.discount
      } : null
    };

    console.log('Submitting order with:', orderData);

    if (this.selectedPayment === 'cash_on_delivery') {
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      this.showSuccessMessage = true;
      this.clearCart();
    } else {
      this.processPayment(orderData);
    }
  }

  private saveOrder(orderData: any): void {
    this.orderService.saveOrder(orderData).subscribe({
      next: (res) => {
        this.clearCart();
      },
      error: (err) => {
        this.isProcessingPayment = false;
        this.paymentError = 'Failed to place order. Please try again.';
        console.error('Order save error:', err);
      },
    });
  }

  private processPayment(orderData: any): void {
    this.paymentService.initiatePayment(this.total).subscribe({
      next: (response) => {
        const paymentLink = response?.result?.link;
        if (paymentLink) {
          // Temporarily store the order in localStorage
          localStorage.setItem('pendingOrder', JSON.stringify(orderData));
          window.location.href = paymentLink;
        } else {
          this.paymentError = 'Invalid payment response';
          this.isProcessingPayment = false;
        }
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.paymentError = 'Payment processing failed. Please try again.';
        this.isProcessingPayment = false;
      },
    });
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
