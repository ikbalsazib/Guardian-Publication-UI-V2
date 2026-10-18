import { Component, input, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewSubmitComponent } from './review-submit/review-submit.component';
import { Product } from '../../../interfaces/common/product';
import { Review } from '../../../interfaces/common/review.interface';
import { Pagination } from '../../../interfaces/core/pagination';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { ReviewService } from '../../../services/common/review.service';
import { ReloadService } from '../../../services/core/reload.service';
import { UserService } from '../../../services/common/user.service';
import { UiService } from '../../../services/core/ui.service';

@Component({
  selector: 'app-rating-and-review',
  templateUrl: './rating-and-review.component.html',
  styleUrls: ['./rating-and-review.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatDialogModule,
    RouterModule
  ]
})
export class RatingAndReviewComponent implements OnInit, OnDestroy {
  // Inputs
  product = input.required<Product>();

  // Signals
  allReviews = signal<Review[]>([]);
  isLoading = signal<boolean>(false);

  // Computed
  ratingCalculation = computed(() => {
    const p = this.product();
    if (!p || !p.ratingTotal) return 0;
    return (p.ratingCount ?? 0) / p.ratingTotal;
  });

  // Dependencies
  public userService = inject(UserService);
  private reviewService = inject(ReviewService);
  private reloadService = inject(ReloadService);
  private dialog = inject(MatDialog);
  private uiService = inject(UiService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.fetchAllReviews();

    const subReload = this.reloadService.refreshData$.subscribe(() => {
      this.fetchAllReviews();
    });
    this.subscriptions.push(subReload);
  }

  private fetchAllReviews() {
    this.isLoading.set(true);
    const pagination: Pagination = { pageSize: 12, currentPage: 0 };
    const mSelect = {
      name: 1, user: 1, product: 1, review: 1, images: 1,
      ratingCount: 1, rating: 1, status: 1, ratingDetails: 1,
      reviewDate: 1, reply: 1, replyDate: 1
    };

    const filterData: FilterData = {
      pagination,
      filter: { 'product._id': this.product()._id, status: true },
      select: mSelect,
      sort: { createdAt: -1 }
    };

    const subR = this.reviewService.getAllReviewsByQuery(filterData, null).subscribe({
      next: (res) => {
        this.allReviews.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
    this.subscriptions.push(subR);
  }

  openReviewDialog() {
    if (!this.userService.getUserStatus()) {
      this.uiService.warn('Please login first to write a review');
      return;
    }

    const dialogRef = this.dialog.open(ReviewSubmitComponent, {
      data: this.product()._id,
      width: '100%',
      maxWidth: '850px',
      panelClass: ['theme-dialog']
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) this.reloadService.needRefreshData$();
    });
  }

  getRatingPercent(count: number | undefined): number {
    if (!count || !this.product().ratingTotal) return 0;
    return Math.floor((count / (this.product().ratingTotal ?? 1)) * 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
