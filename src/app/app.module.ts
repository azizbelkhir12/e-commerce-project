import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ReactiveFormsModule ,FormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { AccountComponent } from './components/account/account.component';
import { UpdateProfileComponent } from './components/update-profile/update-profile.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { SideBarAdminComponent } from './components/side-bar-admin/side-bar-admin.component';
import { FooterAdminComponent } from './components/footer-admin/footer-admin.component';
import { HeaderAdminComponent } from './components/header-admin/header-admin.component';
import { UsersAdminComponent } from './components/users-admin/users-admin.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { ProductsAdminComponent } from './components/products-admin/products-admin.component';
import { ProductsComponent } from './components/products/products.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CartComponent } from './components/cart/cart.component';
import { AdminAddProductComponent } from './components/add-product/add-product.component';
import { AddCategoryComponent } from './components/add-category/add-category.component';
import { ProductComponent } from './components/product/product.component';
import { BannerComponent } from './components/banner/banner.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { UniquePipe } from './pipes/unique.pipe';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { ClientLayoutComponent } from './layout/client-layout/client-layout.component';
import { CouponAdminComponent } from './components/coupon-admin/coupon-admin.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentFailComponent } from './pages/payment-fail/payment-fail.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { DetailsOrderComponent } from './components/details-order/details-order.component';
import { AdminOrdersComponent } from './components/admin-orders/admin-orders.component';
import { CategoriesAdminComponent } from './components/categories-admin/categories-admin.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LoginComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    NewsletterComponent,
    AccountComponent,
    UpdateProfileComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    DashboardAdminComponent,
    SideBarAdminComponent,
    FooterAdminComponent,
    HeaderAdminComponent,
    UsersAdminComponent,
    ReviewsComponent,
    ProductsAdminComponent,
    ProductsComponent,
    ProductDetailsComponent,
    CheckoutComponent,
    CartComponent,
    AdminAddProductComponent,
    AddCategoryComponent,
    ProductComponent,
    BannerComponent,
    UniquePipe,
    AdminLoginComponent,
    AdminLayoutComponent,
    ClientLayoutComponent,
    CouponAdminComponent,
    CategoriesAdminComponent,
    PaymentSuccessComponent,
    OrderConfirmationComponent,
    DetailsOrderComponent,
    PaymentSuccessComponent,
    PaymentFailComponent,
    AdminOrdersComponent,
    CouponAdminComponent,
    CategoriesAdminComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    InfiniteScrollModule,
  ],

  providers: [provideClientHydration()],
  bootstrap: [AppComponent],
})
export class AppModule {}
