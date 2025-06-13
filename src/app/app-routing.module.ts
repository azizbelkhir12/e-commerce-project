import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AccountComponent } from './components/account/account.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { UsersAdminComponent } from './components/users-admin/users-admin.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { ProductsAdminComponent } from './components/products-admin/products-admin.component';
import { ProductsComponent } from './components/products/products.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CartComponent } from './components/cart/cart.component';
import { AuthGuard } from './guards/auth-guard.guard';
import { AddCategoryComponent } from './components/add-category/add-category.component';
import { AdminAddProductComponent } from './components/add-product/add-product.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { ClientLayoutComponent } from './layout/client-layout/client-layout.component';
import { CouponAdminComponent } from './components/coupon-admin/coupon-admin.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentFailComponent } from './pages/payment-fail/payment-fail.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { AdminOrdersComponent } from './components/admin-orders/admin-orders.component';
import { CategoriesAdminComponent } from './components/categories-admin/categories-admin.component';

const routes: Routes = [
  // Client routes wrapped in ClientLayout
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      { path: '', title: 'Home', component: HomeComponent },
      { path: 'login', title: 'Login', component: LoginComponent },
      { path: 'register', title: 'Register', component: SignupComponent },
      {
        path: 'account',
        title: 'My Account',
        component: AccountComponent,
        canActivate: [AuthGuard],
        data: { role: 'client' },
      },
      { path: 'products', title: 'Products', component: ProductsComponent },
      {
        path: 'product-details/:id',
        title: 'Product Details',
        component: ProductDetailsComponent,
      },
      {
        path: 'checkout',
        title: 'Checkout',
        component: CheckoutComponent,
        canActivate: [AuthGuard],
        data: { role: 'client' },
      },
      {
        path: 'cart',
        title: 'Cart',
        component: CartComponent,
      },
      {
        path: 'forgot-password',
        title: 'Forgot Password',
        component: ForgotPasswordComponent,
      },
      {
        path: 'reset/:token',
        title: 'Reset Password',
        component: ResetPasswordComponent,
      },
      {
        path: 'checkout',
        title: 'Checkout',
        component: CheckoutComponent,
      },
      {
        path: 'confirm-order/:orderId/:token',
        title: 'Confirm Order',
        component: OrderConfirmationComponent,
      },
      { path: 'payment-success', component: PaymentSuccessComponent },
      { path: 'payment-fail', component: PaymentFailComponent },
    ],
  },

  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: 'payment-fail', component: PaymentFailComponent },

  {
    path: 'admin/login',
    title: 'Admin Login',
    component: AdminLoginComponent,
  },

  // Admin routes wrapped in AdminLayout
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        title: 'Dashboard Admin',
        component: DashboardAdminComponent,
      },
      {
        path: 'users',
        title: 'Manage Users - Admin',
        component: UsersAdminComponent,
      },
      {
        path: 'reviews',
        title: 'Manage Reviews - Admin',
        component: ReviewsComponent,
      },
      {
        path: 'products',
        title: 'Manage Products - Admin',
        component: ProductsAdminComponent,
      },
      {
        path: 'products/add',
        title: 'Add Product - Admin',
        component: AdminAddProductComponent,
      },
      {
        path: 'products/category',
        title: 'Add Category - Admin',
        component: AddCategoryComponent,
      },
      {
        path: 'categories',
        title: 'Manage Categories - Admin',
        component: CategoriesAdminComponent,
      },
      {
        path: 'coupons',
        title: 'coupons - Admin',
        component: CouponAdminComponent,
      },
      {
        path: 'AdminOrders',
        title: 'Orders - Admin',
        component: AdminOrdersComponent,
      },
      
      

      {
        path: 'categories',
        title: 'categories - Admin',
        component: CategoriesAdminComponent,
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
