import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import Swal from 'sweetalert2'



@Component({
  selector: 'app-products-admin',
  templateUrl: './products-admin.component.html',
  styleUrl: './products-admin.component.css'
})
export class ProductsAdminComponent implements OnInit{
  products:any=[];
  categories:any;
  editingProduct : any = null;
  isModalOpen = false;
    constructor(private productService: ProductService ){}
  
    ngOnInit(): void {
      this.loadProducts();
      this.getCategories(); 
      }

      loadProducts() {
        this.productService.getProducts().subscribe((res) => {
          this.products = res;
        });
      }

      deleteProduct(id: string) {
        Swal.fire({
          title: 'Are you sure?',
          text: 'Do you really want to delete this product?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            this.productService.deleteProduct(id).subscribe(
              () => {
                this.products = this.products.filter((product: any) => product._id !== id);
                Swal.fire('Deleted!', 'Product deleted successfully', 'success');
              },
              (err) => {
                console.error(err);
                Swal.fire('Error', 'Failed to delete product', 'error');
              }
            );
          }
        });
      }
      editProduct(product: any) {
        this.editingProduct = {...product};
        this.isModalOpen = true;
      }

      getCategories(){
        this.productService.getCategories().subscribe((res)=>{
          this.categories = res
          console.log(this.categories)
        })
      }
      
      cancelEdit(): void {
        this.isModalOpen = false;
        this.editingProduct = null;
      }

      updateProduct() {
        //const updatedProduct = prompt('Enter the new name for the product:');
        if (this.editingProduct) {
          console.log('Updating product with ID:', this.editingProduct._id);
          Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#088179",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, edit it!"
          }).then((result) => {
            if (result.isConfirmed) {
              this.productService.updateProduct( this.editingProduct._id, this.editingProduct).subscribe(
                () => {
                 /*  alert('Product updated successfully'); */
                  this.loadProducts();
                },
                (err) => {
                  console.error('Full error:', err);
                  if (err.status === 404) {
                    alert('Product not found. It may have been deleted.');
                  } else {
                    alert('Failed to update product');
                  }
                }
              );
              Swal.fire({
                title: "Edited!",
                text: "Your product has been edited.",
                icon: "success"
                
              });
            }
          });
          
        }
      }


}
