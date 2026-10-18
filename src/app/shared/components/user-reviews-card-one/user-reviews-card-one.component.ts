import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { Review } from '../../../interfaces/common/review.interface';
import { Product } from '../../../interfaces/common/product';
import { User } from '../../../interfaces/common/user.interface';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-reviews-card-one',
  templateUrl: './user-reviews-card-one.component.html',
  styleUrls: ['./user-reviews-card-one.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class UserReviewsCardOneComponent {
  @Input() data?: Review;

  get productSlug(): string | null {
    if (this.data?.product && typeof this.data.product !== 'string') {
      return (this.data.product as Product).slug || null;
    }
    return null;
  }

  get userName(): string {
    if (this.data?.user && typeof this.data.user !== 'string') {
      return (this.data.user as User).name || 'User';
    }
    return 'User';
  }

  get userProfileImg(): string {
    if (this.data?.user && typeof this.data.user !== 'string') {
      return (this.data.user as User).profileImg || '/images/placeholder/user.png';
    }
    return '/images/placeholder/user.png';
  }

  get ratingValue(): number {
    return this.data?.rating ?? 0;
  }

  get reviewText(): string {
    return this.data?.review ?? '';
  }
}
