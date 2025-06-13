import { Component, OnInit, HostListener } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { CartService } from '../../services/cart.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  searchTerm: string = '';
  cartItemCount: number = 0;
  menuOpen: boolean = false;
  searchOpen: boolean = false;
  showSearchBar = false;

  constructor(
    private searchService: SearchService,
    private cartService: CartService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Vérifie si l'URL contient "shop"
        this.showSearchBar = this.router.url.includes('/products');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    // Close dropdowns when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-menu') && !target.closest('.nav__toggle')) {
      this.menuOpen = false;
    }
    if (
      !target.closest('.dropdown-search') &&
      !target.closest('.header__action-btn')
    ) {
      this.searchOpen = false;
    }
  }

  onSearchChange(): void {
    this.searchService.updateSearchTerm(this.searchTerm);
  }

  ngOnInit(): void {
    this.checkLoginStatus();
    
    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });
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

  checkLoginStatus(): void {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      this.searchOpen = false;
    }
  }

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
    if (this.searchOpen) {
      this.menuOpen = false;
    }
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  closeSearch(): void {
    this.searchOpen = false;
  }
}
