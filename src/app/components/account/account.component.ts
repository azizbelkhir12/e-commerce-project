import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  activeTab: string = 'profile';
  editAddress: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  user: any | null = null;
  title1: string = 'Home';
  title2: string = 'Account';
  showOrderDetails: boolean = false;
  orderDetails: any | null = null;
  orders: any[] = [];
  constructor(
    private userService: UserService,
    private router: Router,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.userService.user$.subscribe((user) => {
      this.user = user;
      this.isLoading = false;
    });
    this.loadUserData();
    this.loadOrders();
  }

  checkLoginStatus(): void {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  loadUserData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.getProfile().subscribe(
      (data) => {
        this.user = data;
      },
      (error) => {
        this.errorMessage = 'Failed to load user data.';
        console.error(error);
      }
    );
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  currentPassword: string = '';
  newPassword: string = '';
  repeatPassword: string = '';

  changePassword() {
    this.userService
      .changePassword(
        this.currentPassword,
        this.newPassword,
        this.repeatPassword
      )
      .subscribe({
        next: () => {
           Swal.fire({
                    position: "center",
                    icon: "success",
                    title:"Password changed successfully",
                    showConfirmButton: false,
                    timer: 2000
                  });
         
          this.router.navigate(['/']);
        },
        error: (err) => 
          Swal.fire({
                  position: "center",
                  icon: "error",
                  title: "Error",
                  showConfirmButton: false,
                  timer: 2000
                })
      });
  }

  editAddressForm(): void {
    this.userService.patchProfile(this.user).subscribe(
      (response) => {
        this.user = response;
        this.editAddress = false;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to update address.';
        console.error(error);
      }
    );
  }

  onCancel(): void {
    this.editAddress = false;
  }

  logout(): void {
    // Remove the token from both localStorage and sessionStorage
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Clear user data if needed (assuming `user` is a member variable)
    this.user = null;

    // Optional: Redirect to login page after clearing the session
    this.router.navigate(['/login']);

    // Reload the page to ensure the application is fully logged out (you can skip this if you rely on routing)
    window.location.reload();
  }

  loadOrders(): void {
    this.ordersService.getMyOrders().subscribe(
      (data) => {
        this.orders = data.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },
      (error) => {
        console.error('Error loading orders', error);
      }
    );
  }
  loadOrderDetails(orderId: string): void {
    this.ordersService.getOrderDetails(orderId).subscribe(
      (data) => {
        this.orderDetails = data;
        this.showOrderDetails = true;
      },
      (error) => {
        console.error('Error loading order details', error);
      }
    );
  }
  closeOrderDetails(): void {
    this.showOrderDetails = false;
    this.orderDetails = null;
  }

  /* Cancel Order */
  cancelOrder(orderId: string, status: string): void {
    this.ordersService.cancelOrder(orderId, status).subscribe(
      (response) => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Order cancelled successfully!",
          showConfirmButton: false,
          timer: 2000
        });
        this.loadOrders(); // Reload orders after cancellation
      },
      (error) => {
        console.error('Error cancelling order', error);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "'Failed to cancel order. Please try again.'",
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }
}
