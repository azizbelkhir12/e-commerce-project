import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CategoryService } from '../../services/category.service';
import { AdminOrdersService } from '../../services/admin-orders.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent {
  users: any[] = [];
  products: any[] = [];
  orders:any[]=[];
  nbUser: number = 0;
  nbProducts:number=0;
  nbOrders:number=0;
  totalIncome:number=0;

  constructor(private userService: UserService,private productService: ProductService,private orderService: AdminOrdersService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.nbUser = res.length;
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des utilisateurs :", err);
      },
    });

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.nbProducts = data.length;

      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.nbOrders = orders.length;
        this.totalIncome = orders.reduce((acc: number, order: any) => acc + (order.totalPrice || 0), 0);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des commandes :', err);
      }
    });
    

  }
}

