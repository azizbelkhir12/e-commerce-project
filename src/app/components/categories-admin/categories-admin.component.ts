import { Component } from '@angular/core';
import { CouponService } from '../../services/coupon.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-categories-admin',
  templateUrl: './categories-admin.component.html',
  styleUrl: './categories-admin.component.css'
})
export class CategoriesAdminComponent {
  categories: any[] = [];
  newCategoryName: string = '';
  editingCategory: any = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.getAllCategories();
  }

  getAllCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  addCategory() {
    if (!this.newCategoryName.trim()) return;

    const newCat = { Catname: this.newCategoryName.trim() };
    this.categoryService.addCategory(newCat).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.getAllCategories();
      },
      error: (err) => {
        console.error('Error adding category:', err);
      }
    });
  }

  editCategory(category: any) {
    this.editingCategory = { ...category }; // clone to avoid 2-way binding bugs
  }

  updateCategory() {
    if (!this.editingCategory || !this.editingCategory._id) return;

    this.categoryService.updateCategory(this.editingCategory._id, this.editingCategory).subscribe({
      next: () => {
        this.editingCategory = null;
        this.getAllCategories();
      },
      error: (err) => {
        console.error('Error updating category:', err);
      }
    });
  }

  deleteCategory(id: string) {
    this.categoryService.deleteCategory(id).subscribe({
      next: () => this.getAllCategories(),
      error: (err) => console.error('Error deleting category:', err)
    });
  }
  

  cancelEdit() {
    this.editingCategory = null;
  }
}
