import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID, viewChild, ElementRef, effect, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserReviewsCardOneComponent } from '../../../shared/components/user-reviews-card-one/user-reviews-card-one.component';
import { TranslateModule } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { Review } from '../../../interfaces/common/review.interface';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { ReviewService } from '../../../services/common/review.service';


@Component({
  selector: 'app-user-reviews',
  templateUrl: './user-reviews.component.html',
  styleUrls: ['./user-reviews.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserReviewsCardOneComponent,
    TranslateModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserReviewsComponent implements OnInit, OnDestroy {
  // Signals
  allReviews = signal<Review[]>([]);
  isLoadingReview = signal<boolean>(false);

  // Swiper Reference
  swiperEl = viewChild<ElementRef>('swiperEl');

  // Services
  private reviewService = inject(ReviewService);
  private platformId = inject(PLATFORM_ID);
  public isBrowser = isPlatformBrowser(this.platformId);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor() {
    effect(() => {
      const data = this.allReviews();
      const el = this.swiperEl();
      if (this.isBrowser && data.length > 0 && el) {
        this.initSwiper(el.nativeElement);
      }
    });
  }

  private initSwiper(el: any) {
    const swiperParams = {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      zoom: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      loop: true,
      navigation: true,
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },
      injectStyles: [
        `
        .swiper-button-next svg,
        .swiper-button-prev svg {
          width: 12px !important;
          height: 12px !important;
        }
        `
      ]
    };
    Object.assign(el, swiperParams);
    el.initialize();
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.getAllReviews();
    }
  }

  /***
   * HTTP REQUEST HANDLE
   * getAllReviews()
   */

  private getAllReviews() {
    const filterData: FilterData = {
      select: { _id: 1, user: 1, image: 1, rating: 1, isReview: 1, review: 1, product: 1 },
      sort: { createdAt: -1 },
      filter: { isReview: true },
      pagination: { pageSize: 6, currentPage: 0 }
    }

    this.isLoadingReview.set(true);
    const sub = this.reviewService.getAllReviewsByQuery(filterData).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.allReviews.set(res.data);
        }
        this.isLoadingReview.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoadingReview.set(false);
      }
    });
    this.subscriptions.push(sub);
  }



  /**
  * NG ON DESTROY
  */
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
