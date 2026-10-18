import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { Review } from '../../../../interfaces/common/review.interface';
import { Product } from '../../../../interfaces/common/product';
import { ReviewService } from '../../../../services/common/review.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { UiService } from '../../../../services/core/ui.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ReviewComponent implements OnInit, OnDestroy {
  // Store Data (Signals)
  allReviews = signal<Review[]>([]);

  // Dependencies
  private readonly reviewService = inject(ReviewService);
  private readonly reloadService = inject(ReloadService);
  private readonly uiService = inject(UiService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subReload = this.reloadService.refreshData$.subscribe(() => {
      this.getReviewByUserId();
    });
    this.subscriptions.push(subReload);
    this.getReviewByUserId();
  }

  private getReviewByUserId() {
    const subGet = this.reviewService.getReviewByUserId().subscribe({
      next: (res) => {
        if (res.success) {
          this.allReviews.set(res.data);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.subscriptions.push(subGet);
  }

  public deleteReviewByReviewId(id: string | undefined) {
    if (!id) return;
    const subDelete = this.reviewService.deleteReviewByReviewId(id).subscribe({
      next: (res) => {
        if (res) {
          this.reloadService.needRefreshData$();
          this.uiService.success(res.message);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.subscriptions.push(subDelete);
  }

  // Type helper for template safety
  asProduct(product: string | Product | undefined): Product | null {
    if (product && typeof product === 'object') {
      return product as Product;
    }
    return null;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
