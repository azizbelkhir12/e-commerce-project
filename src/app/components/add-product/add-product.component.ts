import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AdminAddProductComponent {
  productForm!: FormGroup;
  categories: any;
  selectedImages: File[] = [];
  selectedImages2: File[] = [];
  previewUrls: string[] = [];
  previewUrls2: string[] = [];

  constructor(
    private productService: ProductService, 
    private fb: FormBuilder, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCategories();

    this.productForm = this.fb.group({
      brand: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      size: ['', Validators.required],
      category: ['', Validators.required],
      discount: [null]
    });
  }

  onFileSelected(event: any, type: 'main' | 'additional') {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (type === 'main') {
          this.selectedImages.push(file);
          this.generatePreview(file, 'main');
        }
      }
    }
    event.target.value = ''; // Reset input
  }

  generatePreview(file: File, type: 'main' | 'additional') {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (type === 'main') {
        this.previewUrls.push(e.target.result);
      } 
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number, type: 'main' | 'additional') {
    if (type === 'main') {
      this.selectedImages.splice(index, 1);
      this.previewUrls.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.productForm.valid && (this.selectedImages.length > 0 )) {
      const formData = new FormData();
      
      // Append form values
      Object.keys(this.productForm.value).forEach(key => {
        formData.append(key, this.productForm.value[key]);
      });

      // Append main images
      this.selectedImages.forEach((file, index) => {
        formData.append('images', file, file.name);
      });

      

      this.productService.addProduct(formData).subscribe({
        next: (res) => {
          console.log('Response:', res);
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          console.error('Error:', err);
        }
      });
    }
  }

  getCategories(): void {
    this.productService.getCategories().subscribe((res) => {
      this.categories = res;
      console.log('Categories:', this.categories);
    });
  }
}