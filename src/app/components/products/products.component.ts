import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { SearchService } from '../../services/search.service';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  title1 = 'Home';
  title2 = 'Products';
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];

  hasMore = true;
  page = 1;
  limit = 6;
  isLoading = false;

  scrollDistance = 1;
  scrollUpDistance = 2;
  scrollThrottle = 300;

  selectedSorting = 'nothing';

  selectedCategories: string[] = [];
  selectedBrands: string[] = [];

  globalMinPrice: number = 0;
  globalMaxPrice: number = 0;

  minPrice: number = 0;
  maxPrice: number = 500;

  searchTerm = '';

  constructor(
    private productService: ProductService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.loadProducts(this.page, this.limit);
    this.loadCategories();

    this.searchService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
    });
  }

  loadProducts(page: number, limit: number): void {
    if (this.isLoading) return;
    this.isLoading = true;
  
    this.productService.getUserProducts(page, limit).subscribe(
      (response: any) => {
        const newProducts = response.products.map((prod: any) => {
          const discountedPrice =
            prod.discount > 0
              ? +(prod.price * (1 - prod.discount / 100)).toFixed(2)
              : prod.price;
  
          return { ...prod, discountedPrice }; 
        });
  
        this.products = [...this.products, ...newProducts];
        this.hasMore = response.hasMore;
  
        this.calculatePriceRange();
        this.applyFilters(); 
        this.isLoading = false;
      },
      error => {
        console.error('Error loading products', error);
        this.isLoading = false;
      }
    );
  }

  calculatePriceRange(): void {
    if (this.products.length > 0) {
      const discountedPrices = this.products.map(p => p.discountedPrice);
      this.globalMinPrice = Math.min(...discountedPrices);
      this.globalMaxPrice = Math.max(...discountedPrices);
  
      if (this.minPrice === 0 && this.maxPrice === 500) {
        this.minPrice = this.globalMinPrice;
        this.maxPrice = this.globalMaxPrice;
      }
    }
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(res => {
      this.categories = res;
    });
  }

  onScroll(): void {
    if (this.hasMore) {
      this.page++;
      this.loadProducts(this.page, this.limit);
    }
  }

  onSortChange(event: any) {
    this.selectedSorting = event.target.value;
    this.applySorting();
  }

  applySorting(): void {
    switch (this.selectedSorting) {
      case 'price_asc':
        this.filteredProducts.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case 'price_desc':
        this.filteredProducts.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case 'name_asc':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
  }

  applyFilters(): void {
    console.log("Filters applied, minPrice:", this.minPrice, "maxPrice:", this.maxPrice); 
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory =
        this.selectedCategories.length > 0
          ? this.selectedCategories.includes(product.category)
          : true;
  
      const matchesBrand =
        this.selectedBrands.length > 0
          ? this.selectedBrands.includes(product.brand)
          : true;
  
      const matchesPrice =
        product.discountedPrice >= this.minPrice && product.discountedPrice <= this.maxPrice;
      console.log("product.discountedPrice", product.discountedPrice);
      
      const matchesSearch =
        this.searchTerm.trim().length > 0
          ? product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
          : true;
  
      return matchesCategory && matchesBrand && matchesPrice && matchesSearch;
    });
  
    this.applySorting(); 
  }

  onCategoryChange(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  onBrandChange(brand: string): void {
    const index = this.selectedBrands.indexOf(brand);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brand);
    }
    this.applyFilters();
  }

  onPriceChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.maxPrice = Number(input.value);
    this.applyFilters();
  }
}



