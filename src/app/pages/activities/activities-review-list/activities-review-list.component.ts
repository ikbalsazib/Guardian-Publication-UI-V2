import { Component, OnDestroy, OnInit, inject, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ActivitiesCommentService } from '../../../services/common/activities-comment.service';
import { Review } from '../../../interfaces/common/review.interface';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { RatingAndReviewComponent } from '../../product-details/rating-and-review/rating-and-review.component';

@Component({
  selector: 'app-activities-review-list',
  templateUrl: './activities-review-list.component.html',
  styleUrls: ['./activities-review-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class ActivitiesReviewListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: any;

  // Signals
  reviews = signal<Review[]>([]);
  isLoading = signal<boolean>(false);

  // Dependencies
  private readonly activitiesCommentService = inject(ActivitiesCommentService);
  private readonly dialog = inject(MatDialog);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.fetchReviews();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.fetchReviews();
    }
  }

  private fetchReviews() {
    const filter: FilterData = {
      filter: { status: true },
      select: { name: 1, user: 1, review: 1, images: 1, rating: 1, reviewDate: 1, reply: 1 },
      sort: { createdAt: -1 },
      pagination: { pageSize: 12, currentPage: 0 }
    };

    if (this.data?._id) {
      filter.filter!['activities._id'] = this.data._id;
    }

    this.isLoading.set(true);
    const sub = this.activitiesCommentService.getAllReviewsByQuery(filter, undefined).subscribe({
      next: (res: any) => {
        this.reviews.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
    this.subscriptions.push(sub);
  }

  onOpenReviewDialog() {
    const dialogRef = this.dialog.open(RatingAndReviewComponent, {
      width: '100%',
      maxWidth: '800px',
      data: { activityId: this.data?._id }
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      if (res) {
        this.fetchReviews();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
