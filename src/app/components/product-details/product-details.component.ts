import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { take } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  quantity = 1;
  productId!: string;
  initialImage = 0;
  product: any;
  relatedProducts: any[] = [];
  reviews: any[] = [];
  isInWishlist = false;
  selectedSize: string = 'M';
  selectedColor: string = 'Red';
  activeTab: string = 'info';
  newReview = { productId: '', review: '', rating: 0, name: '' };
  editingReview: any;
  editReview: string = '';
  currentUserId: string | null = null;
  colors = ['Red', 'Blue', 'Green', 'Black', 'White'];
  sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  apiUrl = 'http://localhost:3000/api/products/';

  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    private http: HttpClient,
    private authService: AuthService,
    private cartService: CartService,
  ) {}

  changeImage(index: number) {
    this.initialImage = index;
  }

  ngOnInit() {
    this.currentUserId = this.getUserIdFromToken();

    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      this.productId = params.get('id') || '';
      if (this.productId) {
        this.getProduct();
        this.getReviews();
      }
    });
  }
  getRelatedProducts() {
    this.reviewService.getRelatedProducts(this.productId).subscribe({
      next: (products) => {
        this.relatedProducts = products.map((product: any) => ({
          ...product,
        }));
      },
      error: (err) => {
        console.error('Error fetching related products:', err);
      },
    });
  }
  getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.id;
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }
  checkCurrentUser(review: any): boolean {
    return this.currentUserId === review.userId;
  }
  // Fetch product details
  getProduct() {
    this.reviewService.getProduct(this.productId).subscribe({
      next: (product) => {
        this.product = product;
      },
      error: (err) => {
        console.error('Error fetching product:', err);
      },
    });
  }

  // Fetch reviews for the product
  getReviews() {
    this.reviewService.getReviews(this.productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews.map((review) => ({
          ...review,
        }));
      },
      error: (err) => {
        console.error('Error fetching reviews:', err);
      },
    });
  }

  // Add a new review
  addReview() {
    this.newReview.productId = this.productId;
    this.reviewService.createReview(this.productId, this.newReview).subscribe({
      next: () => {
        this.getReviews();
        this.newReview = {
          productId: this.productId,
          review: '',
          rating: 0,
          name: '',
        };
      },
      error: (err) => {
        console.error('Error adding review:', err);
      },
    });
  }

  // Edit a review
  startEditing(review: any) {
    this.reviews.forEach((r) => {
      if (r.id !== review.id) {
        r.editing = false;
      }
    });
    this.editReview = review.review;
    review.editing = true;
    this.editReview = review.review;
    this.editingReview = { ...review };
  }

  updateReview(reviewId: string, updatedReview: any) {
    this.editingReview.editing = false;
    updatedReview.review = this.editReview;

    this.reviewService.updateReview(reviewId, updatedReview).subscribe({
      next: () => {
        this.getReviews();
        this.editingReview = null;
      },
      error: (err) => {
        console.error('Error updating review:', err);
      },
    });
  }

  cancelEdit(review: any) {
    review.editing = false;
    this.editingReview = null;
  }

  deleteReview(reviewId: string) {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.getReviews();
      },
      error: (err) => {
        console.error('Error deleting review:', err);
      },
    });
  }

  setRating(value: number) {
    if (this.editingReview) {
      this.editingReview.rating = value;
    } else {
      this.newReview.rating = value;
    }
  }

  getFilledStars(rating: number) {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number) {
    return Array(5 - rating).fill(0);
  }

  addToCart(product: any) {
    const token = localStorage.getItem('token');
    if(this.authService.isAuthenticated() && token) {
      this.cartService.addToCartInDB(product, token).subscribe(res => {
      })
    } else {
      this.cartService.addToCartInCookie(product);

    }
  }

  addToWishlist() {
    console.log('Added to wishlist');
  }

  onColorSelect(color: string) {
    this.selectedColor = color;
  }

  onSizeSelect(size: string) {
    this.selectedSize = size;
  }
}
