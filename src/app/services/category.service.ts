import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl = 'http://localhost:3000/api/category';
  
    constructor(private http: HttpClient) {}

    getAllCategories(){
      return this.http.get<any>(`${this.apiUrl}/categories`);
    }
  
    
    addCategory(cat: any) {
      return this.http.post<any>(`${this.apiUrl}/categories`, cat);
    }
  
    
    deleteCategory(id: any) {
      return this.http.delete<any>(`${this.apiUrl}/categories/${id}`);
    }
    updateCategory(id: any,cat:any) {
      return this.http.put<any>(`${this.apiUrl}/categories/${id}`,cat);
    }
}
