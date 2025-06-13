import { Component } from '@angular/core';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.css'
})
export class AddCategoryComponent {
Categ:any
Catname:any

constructor(private categoryService:ProductService){}

  onSubmit(){
    this.Categ = {name : this.Catname}
    console.log(this.Categ)
    this.categoryService.addCategory(this.Categ).subscribe((res)=>{
      console.log(res)
    })
  }

}
