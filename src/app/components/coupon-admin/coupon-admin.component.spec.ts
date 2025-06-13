import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponAdminComponent } from './coupon-admin.component';

describe('CouponAdminComponent', () => {
  let component: CouponAdminComponent;
  let fixture: ComponentFixture<CouponAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CouponAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
