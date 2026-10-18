import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, OnDestroy, signal, computed } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { Popup } from "../../interfaces/common/popup.interface";
import { Subscription } from "rxjs";
import { FilterData } from "../../interfaces/gallery/filter-data";
import { PopupService } from "../../services/common/popup.service";
import { Banner } from "../../interfaces/common/banner.interface";
import { StorageService } from "../../services/core/storage.service";
import { Category } from "../../interfaces/common/category.interface";
import { Carousel } from "../../interfaces/common/carousel.interface";
import { SeoPageService } from "../../services/common/seo-page.service";
import { SeoPage } from "../../interfaces/common/seo-page.interface";
import { SeoService } from '../../services/core/seo.service';
import { HomeDataService, HomePageData } from '../../services/common/home-data.service';
import { HomeRouteData } from './home.resolver';
import { injectHeroPreloadLinks } from '../../core/utils/image-url.util';

// Home Sections Standalone Components
import { CarouselSliderComponent } from './carousel-slider/carousel-slider.component';
import { ShopByCategoryComponent } from './shop-by-category/shop-by-category.component';
import { PopularBookComponent } from './popular-book/popular-book.component';
import { NewPublishedComponent } from './new-published/new-published.component';
import { SpecialPackageComponent } from './special-package/special-package.component';
import { UpcomingBestSellerComponent } from './upcoming-best-seller/upcoming-best-seller.component';
import { KidsBookComponent } from './kids-book/kids-book.component';
import { ArticlesComponent } from './articles/articles.component';
import { YoutubeVideoComponent } from './youtube-video/youtube-video.component';
import { OurPublicationComponent } from './our-publication/our-publication.component';
import { UserReviewsComponent } from './user-reviews/user-reviews.component';
import { PosterComponent } from './poster/poster.component';
import { MaterialModule } from '../../material/material.module';
import { OfferDialogComponent } from '../../shared/dialog-view/ui/offer-dialog/offer-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MaterialModule,
    CarouselSliderComponent,
    ShopByCategoryComponent,
    PopularBookComponent,
    NewPublishedComponent,
    SpecialPackageComponent,
    UpcomingBestSellerComponent,
    KidsBookComponent,
    ArticlesComponent,
    YoutubeVideoComponent,
    OurPublicationComponent,
    UserReviewsComponent,
    PosterComponent
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  // Signals
  carousels = signal<Carousel[]>([]);
  categories = signal<Category[]>([]);
  bigBanners = signal<Banner[]>([]);
  smallBanners = signal<Banner[]>([]);
  bottomBanners = signal<Banner[]>([]);
  popups = signal<Popup[]>([]);
  seoPage = signal<SeoPage | null>(null);
  isHomeDataLoading = signal<boolean>(true);
  isBrowser = signal<boolean>(false);

  shopCategories = computed(() => this.categories().slice(0, 15));

  // Lazy Component View (can remain standard as it's modified manually)
  showLazyComponent: string[] = [];

  // Dependencies
  private seoService = inject(SeoService);
  private seoPageService = inject(SeoPageService);
  private dialog = inject(MatDialog);
  private activatedRoute = inject(ActivatedRoute);
  private popupService = inject(PopupService);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private homeDataService = inject(HomeDataService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const isBrowserVal = isPlatformBrowser(this.platformId);
    this.isBrowser.set(isBrowserVal);

    const resolved = this.activatedRoute.snapshot.data['home'] as HomeRouteData | undefined;
    if (resolved?.seoPageData) {
      this.seoPage.set(resolved.seoPageData);
      this.updateMetaData();
    } else {
      this.fetchSeoPage();
    }

    if (resolved?.homePageData) {
      this.applyHomeData(resolved.homePageData);
    } else {
      this.loadHomeData();
    }

    if (isBrowserVal) {
      this.schedulePopupFetch();
    }
  }

  private applyHomeData(data: HomePageData) {
    this.categories.set(data.categories);
    this.carousels.set(data.carousels);
    this.bigBanners.set(data.bigBanners);
    this.smallBanners.set(data.smallBanners);
    this.bottomBanners.set(data.bottomBanners);
    this.preloadHeroImage(data.carousels[0]?.image, data.carousels[0]?.mobileImage);
    this.isHomeDataLoading.set(false);
  }

  private loadHomeData() {
    this.isHomeDataLoading.set(true);
    const sub = this.homeDataService.loadHomePageData().subscribe({
      next: (data) => {
        this.applyHomeData(data);
      },
      error: (err) => {
        console.error(err);
        this.isHomeDataLoading.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  private schedulePopupFetch() {
    const run = () => this.fetchPopups();
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(run, { timeout: 5000 });
    } else {
      setTimeout(run, 3000);
    }
  }

  private preloadHeroImage(imageUrl?: string, mobileImageUrl?: string) {
    injectHeroPreloadLinks(this.document, imageUrl, mobileImageUrl);
  }

  private updateMetaData() {
    const page = this.seoPage();
    if (!page) return;

    this.seoService.updateMetaData({
      title: page.name,
      description: page.seoDescription,
      keywords: page.keyWord,
      image: page.image,
      isHome: true
    });
    this.seoService.setHomepageSchema();
  }

  private openDialogIfNecessary() {
    const dialogSeen = this.storageService.getDataFromSessionStorage('DIALOG');
    if (!dialogSeen && this.isBrowser()) {
      setTimeout(() => {
        this.openOfferDialog();
      }, 2000);
    }
  }

  openOfferDialog() {
    this.dialog.open(OfferDialogComponent, {
      data: this.popups(),
      maxWidth: '500px',
      width: '100%',
      maxHeight: "500px",
      panelClass: ['dialog', 'offer-dialog']
    });
  }

  private fetchPopups() {
    const filter: FilterData = {
      filter: { status: 'publish' },
      pagination: null,
      select: { image: 1, name: 1, createdAt: 1, description: 1, popUpUrl: 1 },
      sort: { createdAt: -1 },
    };
    const subPopup = this.popupService.getAllPopups(filter, null).subscribe({
      next: (res) => {
        if (res.success) {
          this.popups.set(res.data);
          if (res.data.length) {
            this.openDialogIfNecessary();
          }
        }
      },
      error: (err) => console.log(err)
    });
    this.subscriptions.push(subPopup);
  }

  private fetchSeoPage() {
    const subSeo = this.seoPageService.getSeoPageByPageWithCache('home_page', 'name image seoDescription keyWord pageName')
      .subscribe({
        next: (res) => {
          this.seoPage.set(res);
          if (res) {
            this.updateMetaData();
          }
        },
        error: (err) => console.log(err)
      });
    this.subscriptions.push(subSeo);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
