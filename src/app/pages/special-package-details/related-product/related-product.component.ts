import { Component, input, CUSTOM_ELEMENTS_SCHEMA, viewChild, ElementRef, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCardTwoComponent } from '../../../shared/components/product-card-two/product-card-two.component';
import { Product } from '../../../interfaces/common/product';

@Component({
  selector: 'app-related-product-package',
  templateUrl: './related-product.component.html',
  styleUrls: ['./related-product.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ProductCardTwoComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RelatedProductPackageComponent {
  // Swiper Reference
  swiperEl = viewChild<ElementRef>('swiperEl');

  // Inputs
  products = input<Product[]>([]);
  language = input<string>('');

  // Services
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    effect(() => {
      const data = this.products();
      const el = this.swiperEl();
      if (this.isBrowser && data && data.length > 0 && el) {
        this.initSwiper(el.nativeElement);
      }
    });
  }

  private initSwiper(el: any) {
    const swiperParams = {
      speed: 500,
      loop: this.products().length > 1,
      spaceBetween: 15,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: true,
      breakpoints: {
        "0": { "slidesPerView": 2, "spaceBetween": 10 },
        "450": { "slidesPerView": 3 },
        "600": { "slidesPerView": 4 },
        "768": { "slidesPerView": 5 },
        "1000": { "slidesPerView": 6 },
        "1200": { "slidesPerView": 8 }
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
}

