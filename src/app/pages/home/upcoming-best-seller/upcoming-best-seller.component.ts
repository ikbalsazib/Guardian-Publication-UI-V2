import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID, viewChild, ElementRef, effect, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardOneComponent } from '../../../shared/components/product-card-one/product-card-one.component';
import { CardOneLoaderComponent } from '../../../shared/skeleton-loader/card-one-loader/card-one-loader.component';
import { TranslateModule } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { Product } from '../../../interfaces/common/product';
import { CarouselCntrlService } from '../../../services/common/carousel-cntrl.service';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { ProductService } from '../../../services/common/product.service';


@Component({
  selector: 'app-upcoming-best-seller',
  templateUrl: './upcoming-best-seller.component.html',
  styleUrls: ['./upcoming-best-seller.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardOneComponent,
    CardOneLoaderComponent,
    TranslateModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UpcomingBestSellerComponent implements OnInit, OnDestroy {
  // Signals
  allComingProduct = signal<Product[]>([]);
  allBestSellingProduct = signal<Product[]>([]);
  isLoadingComingSoon = signal<boolean>(true);
  isLoadingBestSelling = signal<boolean>(true);

  // Swiper References
  bestSellingSwiper = viewChild<ElementRef>('bestSellingSwiper');
  comingSoonSwiper = viewChild<ElementRef>('comingSoonSwiper');

  // Services
  private productService = inject(ProductService);
  public carousel = inject(CarouselCntrlService);
  private platformId = inject(PLATFORM_ID);
  public isBrowser = isPlatformBrowser(this.platformId);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor() {
    // Best Selling Swiper
    effect(() => {
      const data = this.allBestSellingProduct();
      const el = this.bestSellingSwiper();
      if (this.isBrowser && data.length > 0 && el) {
        this.initSwiper(el.nativeElement);
      }
    });

    // Coming Soon Swiper
    effect(() => {
      const data = this.allComingProduct();
      const el = this.comingSoonSwiper();
      if (this.isBrowser && data.length > 0 && el) {
        this.initSwiper(el.nativeElement);
      }
    });
  }

  private initSwiper(el: any) {
    const swiperParams = {
      slidesPerView: 1,
      spaceBetween: 15,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: true,
      breakpoints: {
        '0': { slidesPerView: 2 },
        '500': { slidesPerView: 2.6, spaceBetween: 25 },
        '550': { slidesPerView: 2.8, spaceBetween: 25 },
        '600': { slidesPerView: 3, spaceBetween: 25 },
        '768': { slidesPerView: 3.5, spaceBetween: 25 },
        '800': { slidesPerView: 4, spaceBetween: 25 },
        '1000': { slidesPerView: 4.5, spaceBetween: 25 },
        '1100': { slidesPerView: 5, spaceBetween: 25 },
        '1200': { slidesPerView: 6, spaceBetween: 25 }
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
      this.getAllBestSellingProducts();
      this.getAllComingSoonProducts();
    }
  }

  /**
   * HTTP REQUEST HANDLE
   * getAllProducts()
   */
  private getAllBestSellingProducts() {
    const mSelect = {
      _id: 1,
      name: 1,
      nameEn: 1,
      images: 1,
      costPrice: 1,
      salePrice: 1,
      quantity: 1,
      totalSold: 1,
      ratingCount: 1,
      ratingTotal: 1,
      priority: 1,
      author: 1,
      discountAmount: 1,
      discountType: 1,
      tags: 1,
      slug: 1,
      freeDelivery: 1,
    }
    let filter: FilterData = {
      select: mSelect,
      sort: { totalSold: -1 },
      filter: { status: 'publish' },
      pagination: { pageSize: 30, currentPage: 0 }
    }

    this.isLoadingBestSelling.set(true);
    const sub = this.productService.getAllProducts(filter, null).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.allBestSellingProduct.set(res.data);
        }
        this.isLoadingBestSelling.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoadingBestSelling.set(false);
      }
    });
    this.subscriptions.push(sub);
  }


  private getAllComingSoonProducts() {
    const mSelect = {
      _id: 1,
      name: 1,
      nameEn: 1,
      images: 1,
      costPrice: 1,
      salePrice: 1,
      ratingCount: 1,
      ratingTotal: 1,
      author: 1,
      priority: 1,
      quantity: 1,
      discountAmount: 1,
      discountType: 1,
      tags: 1,
      slug: 1,
      freeDelivery: 1,
    }
    let filter: FilterData = {
      select: mSelect,
      sort: { priority: -1 },
      filter: { 'tags.slug': 'coming-soon' },
    }

    this.isLoadingComingSoon.set(true);
    const sub = this.productService.getAllProducts(filter, null).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.allComingProduct.set(res.data);
        }
        this.isLoadingComingSoon.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoadingComingSoon.set(false);
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
