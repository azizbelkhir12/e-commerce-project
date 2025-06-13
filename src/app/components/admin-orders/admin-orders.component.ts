import { Component, OnInit } from '@angular/core';
import { AdminOrdersService } from '../../services/admin-orders.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  isLoading = false;
  error: string | null = null;
  cancellationReason: string = '';
  selectedOrder: any = null;
  statusOptions: string[] = ['pending', 'confirmed', 'delivered', 'canceled', 'expired' ];

  filters = {
    name: '',
    date: '',
    product: '',
    amount: null as number | null,
    status: ''
    
  };

  currentPage = 1;
  pageSize = 20;

  constructor(private orderService: AdminOrdersService, private productService: ProductService) { }

  productMap: { [id: string]: string } = {};


  ngOnInit(): void {
    this.loadOrders();
    this.loadProducts();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders. Please try again later.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    const { name, date, product, amount, status } = this.filters;
  
    this.filteredOrders = this.orders.filter(order => {
      const matchesName = order.billingDetails.name.toLowerCase().includes(name.toLowerCase());
      const matchesDate = date ? order.date.startsWith(date) : true;
      const matchesProduct = product
        ? order.products.some((item: any) =>
          item.product?.name?.toLowerCase().includes(product.toLowerCase())
          )
        : true;
      const matchesAmount = amount !== null ? order.totalPrice >= amount : true;
      const matchesStatus = status ? order.status.toLowerCase() === status.toLowerCase() : true;
  
      return matchesName && matchesDate && matchesProduct && matchesAmount && matchesStatus;
    });
  
    this.currentPage = 1;
  }
  
  

  get paginatedOrders(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.pageSize);
  }

  get totalPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getStatusBadgeClass(status: string | undefined | null): string {
    if (!status) return 'badge bg-secondary'; // fallback badge
  
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-warning';
      case 'confirmed': return 'bg-success';
      case 'canceled': return 'bg-danger';
      case 'delivered': return 'bg-info';
      case 'expired': return 'bg-dark';
      default: return 'bg-secondary';
    }
  }

  loadProducts() {
    this.productService.getProducts().subscribe((products: any[]) => {
      this.productMap = products.reduce((map, product) => {
        map[product._id] = product.name;
        return map;
      }, {});
    });
  }

  
  
  getProductName(item: any): string {
    return this.productMap[item.productId] || 'Unknown Product';
  }

  updateOrderStatus(order: any, newStatus: string): void {
    const previousStatus = order.status;
    order.status = newStatus; // Optimistic update
    
    this.orderService.updateOrderStatus(order._id, newStatus).subscribe({
      next: (updatedOrder) => {
        this.orders = this.orders.map(o => 
          o._id === order._id ? updatedOrder : o
        );
      },
      error: (err) => {
        console.error('Failed to update order status:', err);
        order.status = previousStatus;
        this.error = err.error?.message || 'Failed to update order status.';
      }
    });
  }
  
  cancelOrder(order: any, reason: string): void {
    const previousStatus = order.status;
    order.status = 'canceled';
    order.cancellationReason = reason;
    
    this.orderService.cancelOrder(order._id, reason).subscribe({
      next: (updatedOrder) => {
        this.orders = this.orders.map(o => 
          o._id === order._id ? updatedOrder : o
        );
        this.cancellationReason = '';
        this.selectedOrder = null;
      },
      error: (err) => {
        console.error('Failed to cancel order:', err);
        order.status = previousStatus;
        order.cancellationReason = undefined;
        this.error = err.error?.message || 'Failed to cancel order.';
      }
    });
  }

 
}


