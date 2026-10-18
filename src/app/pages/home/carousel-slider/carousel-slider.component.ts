import { Component, OnInit, OnDestroy, input, signal, inject, PLATFORM_ID, viewChild, ElementRef, effect, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, CommonModule, SlicePipe } from '@angular/common';
import { SmallBannerLoaderComponent } from '../../../shared/skeleton-loader/small-banner-loader/small-banner-loader.component';
import { CarouselBannerOneComponent } from '../../../shared/components/carousel-banner-one/carousel-banner-one.component';
import { Subscription } from 'rxjs';
import { Banner } from '../../../interfaces/common/banner.interface';
import { Carousel } from '../../../interfaces/common/carousel.interface';
import { CarouselService } from '../../../services/common/carousel.service';
import { BannerService } from '../../../services/common/banner.service';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { pickHeroImage } from '../../../core/utils/image-url.util';

@Component({
  selector: 'app-carousel-slider',
  templateUrl: './carousel-slider.component.html',
  styleUrls: ['./carousel-slider.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SmallBannerLoaderComponent,
    CarouselBannerOneComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CarouselSliderComponent implements OnInit, OnDestroy {
  carouselsData = input<Carousel[]>([]);
  bigBannersData = input<Banner[]>([]);
  smallBannersData = input<Banner[]>([]);
  isLoading = input<boolean>(true);

  protected readonly pickHeroImage = pickHeroImage;

  bigBanners = signal<Banner[]>([]);
  smallBanners = signal<Banner[]>([]);
  carousels = signal<Carousel[]>([]);
  enableSwiper = signal<boolean>(false);
  isMobileView = signal<boolean>(false);

  isBannerLoading = computed(() => this.isLoading() && this.smallBanners().length === 0);
  isCaloselLoading = computed(() => this.isLoading() && this.carousels().length === 0);
  showSwiper = computed(() =>
    this.isBrowser &&
    this.enableSwiper() &&
    this.carousels().length > 1
  );
  heroDesktopUrl = computed(() => pickHeroImage(this.carousels()[0], false));
  heroMobileUrl = computed(() => pickHeroImage(this.carousels()[0], true));

  swiperEl = viewChild<ElementRef>('swiperEl');

  private carouselService = inject(CarouselService);
  private bannerService = inject(BannerService);
  private platformId = inject(PLATFORM_ID);

  public isBrowser = isPlatformBrowser(this.platformId);
  private swiperUpgradeScheduled = false;
  private subscriptions: Subscription[] = [];

  constructor() {
    effect(() => {
      const data = this.carouselsData();
      if (data.length > 0) {
        this.carousels.set(data);
      }
    });

    effect(() => {
      const big = this.bigBannersData();
      const small = this.smallBannersData();
      if (big.length > 0 || small.length > 0) {
        this.bigBanners.set(big);
        this.smallBanners.set(small);
      }
    });

    effect(() => {
      if (!this.isBrowser || this.swiperUpgradeScheduled || this.carousels().length <= 1) {
        return;
      }
      this.swiperUpgradeScheduled = true;
      if (this.isMobileView()) {
        this.enableSwiper.set(true);
      } else {
        this.scheduleSwiperUpgrade();
      }
    });

    effect(() => {
      const data = this.carousels();
      const el = this.swiperEl();
      if (this.showSwiper() && data.length > 1 && el) {
        void this.initSwiper(el.nativeElement);
      }
    });
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.isMobileView.set(window.matchMedia('(max-width: 730px)').matches);
    window.addEventListener('resize', this.onResize);

    if (this.bigBannersData().length === 0 && this.smallBannersData().length === 0 && !this.isLoading()) {
      this.getAllBanners();
    }

    if (this.carouselsData().length === 0 && !this.isLoading()) {
      this.getAllCarousel();
    }
  }

  private onResize = () => {
    this.isMobileView.set(window.matchMedia('(max-width: 730px)').matches);
  };

  private scheduleSwiperUpgrade() {
    const enable = () => {
      if (this.carousels().length > 1) {
        this.enableSwiper.set(true);
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(enable, { timeout: 2500 });
    } else {
      setTimeout(enable, 1200);
    }
  }

  private async initSwiper(el: any) {
    if (el.swiper || el.getAttribute('data-initialized') === 'true') {
      return;
    }

    const { register } = await import('swiper/element/bundle');
    register();

    const swiperParams = {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 1000,
      grabCursor: true,
      allowTouchMove: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      loop: this.carousels().length > 1,
      navigation: true,
      pagination: {
        clickable: true,
      },
      injectStyles: [
        `
         .swiper {
          position: relative;
          padding-bottom: 0 !important;
          height: 100% !important;
          overflow: hidden;
         }
         .swiper-wrapper {
          align-items: stretch;
         }
         .swiper-slide {
          height: 100% !important;
          width: 100% !important;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
         }
         .swiper-pagination {
          position: absolute;
          bottom: 8px !important;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 12;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          pointer-events: none;
         }
         .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          margin: 0 !important;
          background: #fff;
          opacity: 1;
          border: 1px solid rgba(201, 33, 39, 0.35);
          border-radius: 50%;
          pointer-events: auto;
          flex-shrink: 0;
         }
         .swiper-pagination-bullet-active {
          background: #C92127;
          border-color: #C92127;
         }
         .swiper-button-next,
         .swiper-button-prev {
           color: #C92127;
           background: #fff;
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           width: 35px !important;
           height: 35px !important;
           box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
           opacity: 1;
           visibility: visible;
           z-index: 12;
         }
         .swiper-button-next svg,
         .swiper-button-prev svg {
           width: 10px !important;
           height: 10px !important;
         }
         .swiper-button-next:after,
         .swiper-button-prev:after {
           content: none !important;
         }
         .swiper-button-next:hover,
         .swiper-button-prev:hover {
           background: #C92127;
           color: #fff;
         }
        `
      ],
    };

    Object.assign(el, swiperParams);
    el.initialize();
    el.setAttribute('data-initialized', 'true');
  }

  private getAllCarousel() {
    const filter: FilterData = {
      filter: null,
      pagination: null,
      select: {
        _id: 1, name: 1, title: 1, priority: 1, url: 1,
        image: 1, mobileImage: 1, createdAt: 1,
      },
      sort: { priority: -1 },
    };

    const sub = this.carouselService.getAllCarousel(filter, null).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.carousels.set(res.data);
        }
      },
      error: (err) => console.error('Carousel load error:', err),
    });
    this.subscriptions.push(sub);
  }

  private getAllBanners() {
    const filterData: FilterData = {
      filter: null,
      select: { _id: 1, name: 1, slug: 1, image: 1, bannerType: 1, url: 1 },
      sort: null,
      pagination: null
    };

    const sub = this.bannerService.getAllBanners(filterData, null).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.bigBanners.set(res.data.filter((d: any) => d.bannerType === 'homePageTopBigBanner'));
          this.smallBanners.set(res.data.filter((d: any) => d.bannerType === 'homePageTopSmallBanner'));
        }
      },
      error: (err) => console.error('Banner load error:', err)
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.onResize);
    }
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
