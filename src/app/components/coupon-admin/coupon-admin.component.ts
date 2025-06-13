import { Component, OnInit } from '@angular/core';
import { CouponService } from '../../services/coupon.service';

@Component({
  selector: 'app-coupon-admin',
  templateUrl: './coupon-admin.component.html',
  styleUrl: './coupon-admin.component.css'
})
export class CouponAdminComponent implements OnInit {
  coupons: any[] = [];
  newCouponCode: string = '';
  selectedDiscount: number = 5;
  newCouponThematic: string = '';
  couponValidity: number = 7;

  constructor(private couponService: CouponService) {}

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.couponService.getCoupons().subscribe((data) => {
      this.coupons = data;
    });
  }

  addCoupon() {
    const coupon = {
      couponCode: this.newCouponCode,
      discount: this.selectedDiscount,
      thematique: this.newCouponThematic,
      dureeValidite: this.couponValidity,
    };

    this.couponService.addCoupon(coupon).subscribe(() => {
      this.loadCoupons(); 
      this.resetFields(); 
    });
  }

  deleteCoupon(id: string) {
    this.couponService.deleteCoupon(id).subscribe(() => {
      this.loadCoupons(); 
    });
  }

  resetFields() {
    this.newCouponCode = '';
    this.selectedDiscount = 5;
    this.newCouponThematic = '';
    this.couponValidity = 7;
  }
  
}