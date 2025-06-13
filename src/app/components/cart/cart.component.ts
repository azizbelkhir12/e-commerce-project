import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ReviewService } from '../../services/review.service';
import { CouponService } from '../../services/coupon.service';
import { response } from 'express';
import { Console } from 'console';
import Swal from 'sweetalert2'
import { HeaderComponent } from '../header/header.component';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  constructor(private cartService: CartService, private couponService: CouponService) { }
  cartItems: any = [];

  cartSubtotal = 0;
  shipping = 0;
  total = 0;
  cartId: string = '';
  enteredCouponCode: string = '';
  appliedDiscount: number = 0;
  couponMessage = '';
  couponSuccess = false;
  appliedDiscountMessage: string = '';
  test: any = null;  
  cartItemCount: number = 0;

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  calculateTotals() {
    this.cartSubtotal = this.cartItems.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
    this.shipping = this.cartSubtotal > 100 ? 0 : 10;
    this.total = this.cartSubtotal + this.shipping;
  }

  calculateTotalsFromCart(cartData: any): void {
    this.cartItems = cartData.items;
    this.cartSubtotal = cartData.items.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
    this.shipping = cartData.shipping || 0;
    this.total = cartData.total;
    if (cartData.couponId && cartData.couponId.discount) {
      this.appliedDiscount = cartData.couponId.discount;
    }
  }

  checkLoginStatus(): void {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');

    if (token) {
      this.cartService.getCartFromDB(token).subscribe(
        (cartData) => {
          this.cartItems = cartData.items;
          this.cartId = cartData._id;
          this.test= cartData;
          this.calculateTotals();
          
        },
        (error) => {
          console.error('Error fetching cart data from DB:', error);
        }
      );
    } else {
      const localCart = localStorage.getItem('guest_cart');
      if (localCart) {
        const items = JSON.parse(localCart);
        const ids = items.map((item: any) => item.productId);
        this.cartService.getProductsByIds(ids).subscribe((products: any[]) => {
          this.cartItems = products.map((product: any) => {
            const item = items.find((i: any) => i.productId === product._id);
            return {
              ...product,
              quantity: item ? item.quantity : 1,
            };
          });
          this.calculateTotals();
        }, (error) => {
          console.error(
            error.message
          );
        })                     
      } else {
        this.cartItems = [];
      }
      this.calculateTotals();
    }
  }

  updateCart() {
    console.log(this.cartItems);
    const token = localStorage.getItem('token');
    if (token) {
      this.cartService.updateCartInDB(token, this.cartItems).subscribe(
        (response) => {
          console.log('Cart updated successfully:', response);
        },
        (error) => {
          console.error('Error updating cart in DB:', error);
        }
      );
      this.calculateTotals();
    } else {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
      this.calculateTotals();
    }
  }
  increaseQuantity(index: number) {
    if (this.cartItems[index].quantity < 10) {
      this.cartItems[index].quantity++;
      this.updateCart();
    }
  }

  decreaseQuantity(index: number) {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity--;
      this.updateCart();
    }
  }
  onQuantityChange(index: number, newValue: number) {
    // Ensure value is a number and within bounds
    const validatedValue = Math.max(1, Math.min(99, Number(newValue) || 1));
    this.cartItems[index].quantity = validatedValue;
    this.updateCart();
  }

  validateQuantity(index: number) {
    // Final validation when input loses focus
    if (!this.cartItems[index].quantity || this.cartItems[index].quantity < 1) {
      this.cartItems[index].quantity = 1;
      this.updateCart();
    }
  }

  updateCartItemCount(): void {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');

    if (token) {
      this.cartService.getCartFromDB(token).subscribe(
        (cartData) => {
          this.cartItemCount = cartData.items.length;
        },
        (error) => {
          console.error('Error fetching cart from database:', error);
        }
      );
    } else {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        const cartItems = JSON.parse(localCart);
        this.cartItemCount = cartItems.length;
      } else {
        this.cartItemCount = 0;
      }
    }
  }

  
  removeItem(productId: string) {
    const token = localStorage.getItem('token');
    if (token) {
      this.cartService.removeProductFromCart(this.cartId, productId).subscribe(
        (response) => {
          this.cartItems = this.cartItems.filter((item: any) => item.productId !== productId);
          this.calculateTotals();
          this.cartService.updateCartCount(this.cartItems.length); // 👈 update shared count
          console.log('Product successfully removed from DB cart:', response);
        },
        (error) => {
          console.error('Error removing product from DB cart:', error);
        }
      );
    } else {
      const localCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
  
      const updatedCart = localCart.filter((item: any) => item._id !== productId);
      localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
      this.cartItems = this.cartItems.filter((item: any) => item.productId !== productId);
      this.calculateTotals();
      this.cartService.updateCartCount(this.cartItems.length); // 👈 update shared count
      console.log('Product successfully removed from guest cart.');
    }
  }
  

  

  applyCoupon() {
    if (!this.enteredCouponCode?.trim()) {
      this.displayMessage('Please enter a valid coupon code.');
      return;
    }
  
    this.couponService.getCouponByCode(this.enteredCouponCode).subscribe({
      next: (coupon) => {
        if (!coupon) {
          this.displayMessage('Invalid coupon code.');
          return;
        }
  
        console.log('Coupon received:', coupon);
  
        this.cartService.applyCouponToCart(this.cartId, coupon._id).subscribe({
          next: (updatedCart) => {
            console.log('Response after applying coupon:', updatedCart);
            this.calculateTotalsFromCart(updatedCart);
            
            this.appliedDiscount = coupon.discount;
            this.appliedDiscountMessage = this.appliedDiscount > 0 ? `${this.appliedDiscount}` : '0';
            this.displayMessage('');
          },
          error: (error) => {
            console.error('Error applying coupon', error);
            this.displayMessage('Error applying coupon');
          }
        });
      },
      error: (error) => {
        console.error('Error retrieving coupon', error);
        this.displayMessage('Invalid coupon code.');
      }
    });
  }

  private displayMessage(message: string) {
    this.couponMessage = message;
  }


  proceedToCheckout() {
    console.log('Proceeding to checkout'); 
    const shippingCost = this.cartSubtotal > 3000 ? 0 : 10;
    this.shipping = shippingCost;
  
    this.cartService.checkoutCart(this.cartId, shippingCost).subscribe(
      (updatedCart) => {
        this.calculateTotalsFromCart(updatedCart);
        console.log('Checkout successful');
      },
      (error) => {
        console.error('Error during checkout', error);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Error during checkout",
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }
}

