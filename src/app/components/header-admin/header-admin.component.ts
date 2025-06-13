import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header-admin',
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.css'
})
export class HeaderAdminComponent implements OnInit{
  user: any | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

    constructor(private router: Router,private userService: UserService) {}
  
    ngOnInit(): void {
      this.loadAdminData();
    }
    
    loadAdminData(): void {
      this.isLoading = true;
      this.errorMessage = null;
    
      this.userService.getAdminProfile().subscribe(
        (data) => {
          this.user = data;
          this.isLoading = false;
        },
        (error) => {
          this.errorMessage = 'Failed to load admin data.';
          this.isLoading = false;
          console.error(error);
        }
      );
    }
    
  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    this.user = null;

    this.router.navigate(['/admin']);

    // Reload the page to ensure the application is fully logged out (you can skip this if you rely on routing)
    window.location.reload();
  }
  

}
