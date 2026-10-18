import { Injectable, inject, PLATFORM_ID, TransferState, makeStateKey, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { forkJoin, map, Observable, of, shareReplay, tap } from 'rxjs';
import { Banner } from '../../interfaces/common/banner.interface';
import { Carousel } from '../../interfaces/common/carousel.interface';
import { Category } from '../../interfaces/common/category.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { BannerService } from './banner.service';
import { CarouselService } from './carousel.service';
import { CategoryService } from './category.service';
import { optimizeHeroImageUrl } from '../../core/utils/image-url.util';

export interface HomePageData {
  categories: Category[];
  carousels: Carousel[];
  bigBanners: Banner[];
  smallBanners: Banner[];
  bottomBanners: Banner[];
}

const HOME_BANNER_FILTER: FilterData = {
  filter: null,
  select: { name: 1, slug: 1, image: 1, imageUrl: 1, bannerType: 1, url: 1 },
  sort: null,
  pagination: null
};

const HOME_CAROUSEL_FILTER: FilterData = {
  filter: null,
  pagination: null,
  select: {
    _id: 1,
    name: 1,
    title: 1,
    priority: 1,
    url: 1,
    image: 1,
    mobileImage: 1,
    createdAt: 1
  },
  sort: { priority: -1 }
};

const HOME_CATEGORY_FILTER: FilterData = {
  filter: null,
  select: { _id: 1, name: 1, nameEn: 1, slug: 1, image: 1, mobileImage: 1, serial: 1 },
  pagination: null,
  sort: { serial: 1 }
};

function splitBanners(banners: Banner[]): Pick<HomePageData, 'bigBanners' | 'smallBanners' | 'bottomBanners'> {
  return {
    bigBanners: banners.filter((banner) => banner.bannerType === 'homePageTopBigBanner'),
    smallBanners: banners.filter((banner) => banner.bannerType === 'homePageTopSmallBanner'),
    bottomBanners: banners.filter((banner) => banner.bannerType === 'homeBottomBanner')
  };
}

const HOME_DATA_KEY = makeStateKey<HomePageData>('homePageData');

@Injectable({
  providedIn: 'root'
})
export class HomeDataService {
  private readonly bannerService = inject(BannerService);
  private readonly carouselService = inject(CarouselService);
  private readonly categoryService = inject(CategoryService);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  private homeData$?: Observable<HomePageData>;

  loadHomePageData(): Observable<HomePageData> {
    if (isPlatformBrowser(this.platformId)) {
      const transferred = this.transferState.get(HOME_DATA_KEY, null);
      if (transferred) {
        this.transferState.remove(HOME_DATA_KEY);
        return of(transferred);
      }
    }

    if (!this.homeData$) {
      this.homeData$ = forkJoin({
        banners: this.bannerService.getAllBanners(HOME_BANNER_FILTER),
        carousels: this.carouselService.getAllCarousel(HOME_CAROUSEL_FILTER),
        categories: this.categoryService.getAllCategory(HOME_CATEGORY_FILTER)
      }).pipe(
        map(({ banners, carousels, categories }) => ({
          categories: categories.success ? categories.data : [],
          carousels: carousels.success ? carousels.data : [],
          ...splitBanners(banners.success ? banners.data : [])
        })),
        tap((data) => {
          if (!isPlatformBrowser(this.platformId)) {
            this.transferState.set(HOME_DATA_KEY, data);
            this.preloadHeroImageOnServer(
              optimizeHeroImageUrl(data.carousels[0]?.image, false),
              optimizeHeroImageUrl(data.carousels[0]?.mobileImage || data.carousels[0]?.image, true)
            );
          }
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }

    return this.homeData$;
  }

  getMenuCategories(): Observable<Category[]> {
    return this.loadHomePageData().pipe(map((data) => data.categories));
  }

  private preloadHeroImageOnServer(desktopUrl?: string, mobileUrl?: string) {
    const urls = [
      { href: desktopUrl, selector: 'desktop' },
      { href: mobileUrl, selector: 'mobile', media: '(max-width: 730px)' }
    ].filter((item) => !!item.href);

    urls.forEach(({ href, selector, media }) => {
      if (this.document.querySelector(`link[data-preload-hero="${selector}"]`)) {
        return;
      }

      const link = this.document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href!;
      link.setAttribute('data-preload-hero', selector);
      if (selector === 'desktop') {
        link.setAttribute('fetchpriority', 'high');
      }
      if (media) {
        link.media = media;
      }
      this.document.head.appendChild(link);
    });
  }
}
