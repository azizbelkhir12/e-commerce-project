import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent {

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getReviews();
  }

  reviews: any =[]

  getReviews() {
    this.userService.getReviews().subscribe((res) => {
      console.log(res);
      this.reviews = res;
    }, (err) => {
      console.error(err);
    })
  }

  deleteReview(id:any) {
    this.userService.deleteReview(id).subscribe(() => {
      this.reviews = this.reviews.filter((review : {_id: any}) => review._id !== id)
    })
  }

}
