import { Component, OnInit, OnDestroy, input, signal, inject, PLATFORM_ID, viewChild, ElementRef, effect, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardOneComponent } from '../../../shared/components/product-card-one/product-card-one.component';
import { CardOneLoaderComponent } from '../../../shared/skeleton-loader/card-one-loader/card-one-loader.component';
import { TranslateModule } from "@ngx-translate/core";
import { Product } from 'src/app/interfaces/common/product';
import { Subscription } from 'rxjs';
import { ProductService } from 'src/app/services/common/product.service';
import { Tag } from 'src/app/interfaces/common/tag.interface';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
import { FILTER_TAGS } from 'src/app/core/utils/app-data';

@Component({
  selector: 'app-kids-book',
  templateUrl: './kids-book.component.html',
  styleUrls: ['./kids-book.component.scss'],
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
export class KidsBookComponent implements OnInit, OnDestroy {
  // Signals
  data = input<any>();
  products = signal<Product[]>([]);
  isLoadingKidsBook = signal<boolean>(false);

  // Swiper Reference
  swiperEl = viewChild<ElementRef>('swiperEl');

  // Services
  private productService = inject(ProductService);
  private platformId = inject(PLATFORM_ID);
  public isBrowser = isPlatformBrowser(this.platformId);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor() {
    effect(() => {
      const products = this.products();
      const el = this.swiperEl();
      if (this.isBrowser && products.length > 0 && el) {
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
        '0': { slidesPerView: 1.8 },
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
      this.getAllKidsBookProducts();
    }
  }


  /**
   * KIDS BOOK HTTP REQUEST HANDLE
   * getAllKidsBookProducts()
   */
  private getAllKidsBookProducts() {
    const mSelect = {
      _id: 1,
      name: 1,
      nameEn: 1,
      images: 1,
      costPrice: 1,
      salePrice: 1,
      priority: 1,
      author: 1,
      quantity: 1,
      ratingCount: 1,
      ratingTotal: 1,
      discountAmount: 1,
      discountType: 1,
      tags: 1,
      slug: 1,
      freeDelivery: 1,
    }
    let filter: FilterData = {
      select: mSelect,
      sort: { priority: -1 },
      filter: { 'tags.slug': 'kids' },
    }

    this.isLoadingKidsBook.set(true);
    const sub = this.productService.getAllProducts(filter, null).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products.set(res.data.filter((p: Product) => (p?.tags?.find((t: Tag) => t?.slug === FILTER_TAGS[0]?.viewValue))));
        }
        this.isLoadingKidsBook.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoadingKidsBook.set(false);
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
