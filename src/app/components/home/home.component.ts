import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { SearchService } from '../../services/search.service';
import { SwiperOptions } from 'swiper/types';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'], // corrected from styleUrl to styleUrls
})
export class HomeComponent implements OnInit, OnDestroy {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  hasMore: boolean = true;
  page: number = 1;
  limit: number = 8;
  isLoading: boolean = false;
  newArrivals: any[] = [];
  bestSellers: any[] = [];

  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    spaceBetween: 16,
    centeredSlides: false,
    loop: false,
    grabCursor: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 1.2,
      },
      480: {
        slidesPerView: 1.5,
      },
      768: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  };

  // Scroll config
  scrollDistance = 1;
  scrollUpDistance = 2;
  scrollThrottle = 300;

  // Countdown
  countdown = {
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  };
  private countdownInterval: any;
  private offerEndDate: Date = new Date('2025-04-13T23:59:59'); // change this to your offer's end date

  constructor(
    private productService: ProductService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    console.log('Initialisation du composant, chargement des produits...');
    this.loadProducts(this.page, this.limit);
    this.loadNewArrivals();
    this.loadBestSellers();
    this.startCountdown();

    this.searchService.searchTerm$.subscribe((term) => {
      this.searchTerm = term;
      this.applySearch();
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
  }

  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = this.offerEndDate.getTime() - now;

      if (distance <= 0) {
        clearInterval(this.countdownInterval);
        this.countdown = {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
        };
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.countdown = {
        days: this.padZero(days),
        hours: this.padZero(hours),
        minutes: this.padZero(minutes),
        seconds: this.padZero(seconds),
      };
    }, 1000);
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  loadNewArrivals(): void {
    this.productService.getNewArrivals().subscribe(
      (response: any) => {
        this.newArrivals = response;
      },
      (error) => {
        console.error('Erreur lors du chargement des nouveautés', error);
      }
    );
  }

  loadBestSellers(): void {
    this.productService.getBestSellers().subscribe(
      (response: any[]) => {
        this.bestSellers = [];
        response.forEach((item) => {
          this.bestSellers.push(item.product);
        });
        console.log('Best Sellers:', this.bestSellers);
      },
      (error) => {
        console.error('Erreur lors du chargement des meilleures ventes', error);
      }
    );
  }
  placeholderItems = Array(4).fill(0); // For skeleton loading
  trackProductById(index: number, product: any): number {
    return product.id; // Or unique identifier
  }
  loadProducts(page: number, limit: number): void {
    if (this.isLoading) return;
    this.isLoading = true;

    this.productService.getUserProducts(page, limit).subscribe(
      (response: any) => {
        this.products = [...this.products, ...response.products];
        this.filteredProducts = [...this.products];
        this.hasMore = response.hasMore;
        this.applySearch();
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors du chargement des produits', error);
        this.isLoading = false;
      }
    );
  }

  onScroll(): void {
    if (this.hasMore) {
      this.page++;
      this.loadProducts(this.page, this.limit);
    }
  }

  applySearch(): void {
    this.filteredProducts = this.products.filter((product) =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
