import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const expectedRole = route.data['role'];

    // If not authenticated at all
    if (!this.authService.isAuthenticated()) {
      this.redirectToLogin(expectedRole);
      return false;
    }

    const userRole = this.authService.getUserRole();

    // If authenticated but wrong role
    if (userRole !== expectedRole) {
      this.redirectToHome(userRole);
      return false;
    }

    return true;
  }

  private redirectToLogin(expectedRole: string): void {
    const loginRoute = expectedRole === 'admin' ? '/admin/login' : '/login';
    this.router.navigate([loginRoute], {
      queryParams: { returnUrl: this.router.url },
    });
  }

  private redirectToHome(actualRole: string): void {
    const homeRoute = actualRole === 'admin' ? '/admin' : '/';
    this.router.navigate([homeRoute]);
  }
}
