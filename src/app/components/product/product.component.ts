import { Component, Input } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
  @Input()prod:any;

  constructor(private cartService: CartService, private authService: AuthService) { }

  addToCart(product: any) {
    const token = localStorage.getItem('token');
    if(this.authService.isAuthenticated() && token) {
      this.cartService.addToCartInDB(product, token).subscribe(res => {
      })
    } else {
      this.cartService.addToCartInCookie(product);

    }
  }

}
