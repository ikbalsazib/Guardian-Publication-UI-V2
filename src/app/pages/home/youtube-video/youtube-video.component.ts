import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID, viewChild, ElementRef, effect, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { FilterData } from "../../../interfaces/gallery/filter-data";
import { Subscription } from "rxjs";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { CanonicalService } from "../../../services/core/canonical.service";
import { YoutubeVideoService } from "../../../services/common/youtube-video.service";
import { YoutubeVideo } from "../../../interfaces/common/youtube-video.interface";
import { YoutubeVideoShowComponent } from "../../../shared/dialog-view/youtube-video-show/youtube-video-show.component";
import { MatDialog } from "@angular/material/dialog";
import { YoutubeLoaderComponent } from '../../../shared/skeleton-loader/youtube-loader/youtube-loader.component';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'app-youtube-video',
  templateUrl: './youtube-video.component.html',
  styleUrls: ['./youtube-video.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    YoutubeLoaderComponent,
    MaterialModule,
    TranslateModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class YoutubeVideoComponent implements OnInit, OnDestroy {
  // Signals
  video = signal<YoutubeVideo[]>([]);
  isLoading1 = signal<boolean>(false);
  totalVideo = signal<number>(0);

  // Swiper Reference
  swiperEl = viewChild<ElementRef>('swiperEl');

  // State
  videoCurrentPage = 1;
  videoPageSize = 100;
  isLoadMore = false;
  language: any;
  isChangeLanguage: boolean = false;
  isChangeLanguageToggle: string = 'bn';

  // Services
  private youtubeVideoService = inject(YoutubeVideoService);
  public translateService = inject(TranslateService);
  private activatedRoute = inject(ActivatedRoute);
  private title = inject(Title);
  private meta = inject(Meta);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private canonicalService = inject(CanonicalService);
  private platformId = inject(PLATFORM_ID);
  public isBrowser = isPlatformBrowser(this.platformId);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor() {
    effect(() => {
      const data = this.video();
      const el = this.swiperEl();
      if (this.isBrowser && data.length > 0 && el) {
        this.initSwiper(el.nativeElement);
      }
    });
  }

  private initSwiper(el: any) {
    const swiperParams = {
      slidesPerView: 1,
      spaceBetween: 16,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      loop: false,
      navigation: true,
      breakpoints: {
        '520': { slidesPerView: 2, spaceBetween: 15 },
        '768': { slidesPerView: 2 },
        '1000': { slidesPerView: 2, spaceBetween: 20 },
        '1200': { slidesPerView: 3, spaceBetween: 40 }
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
      const sub = this.activatedRoute.queryParamMap.subscribe(qPram => {
        this.language = qPram.get('language');
      });
      this.subscriptions.push(sub);
      this.getAllVideo();
    }
  }

  private getAllVideo() {
    const filterData: FilterData = {
      pagination: { pageSize: this.videoPageSize, currentPage: this.videoCurrentPage - 1 },
      filter: null,
      select: { _id: 1, name: 1, image: 1, nameEn: 1, title: 1, titleEn: 1, url: 1, createdAt: 1 },
      sort: { createdAt: -1 }
    }
    this.isLoading1.set(true);
    const sub = this.youtubeVideoService.getAllYoutubeVideo(filterData, null).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.video.set(res.data);
        }
        this.isLoading1.set(false);
      },
      error: error => {
        console.error(error);
        this.isLoading1.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  /**
   * updateMetaDataBn()
   */

  // private updateMetaData() {
  //   // Title
  //   this.title.setTitle(this.seoPage?.name);
  //
  //   // Meta
  //   this.meta.updateTag({name: 'robots', content: 'index, follow'});
  //   this.meta.updateTag({name: 'theme-color', content: '#00a0db'});
  //   this.meta.updateTag({name: 'copyright', content: 'BNP BD'});
  //   this.meta.updateTag({name: 'author', content: 'BNP BD'});
  //   this.meta.updateTag({name: 'description', content: this.seoPage?.seoDescription});
  //   this.meta.updateTag({name: 'keywords', content: this.seoPage?.keyWord});
  //
  //   // Open Graph(og:)
  //   this.meta.updateTag({property: 'og:title', content: this.seoPage?.name});
  //   this.meta.updateTag({property: 'og:type', content: 'website'});
  //   this.meta.updateTag({property: 'og:url', content: `https://bnpbd.org${this.router.url}`});
  //   this.meta.updateTag({property: 'og:image', content: this.seoPage?.image});
  //   // this.meta.updateTag({property: 'og:image:type', content: 'image/jpeg'});
  //   this.meta.updateTag({property: 'og:image:width', content: '300'});
  //   this.meta.updateTag({property: 'og:image:height', content: '300'});
  //   this.meta.updateTag({property: 'og:description', content: this.seoPage?.seoDescription});
  //   this.meta.updateTag({property: 'og:locale', content: 'en_US'});
  //   this.meta.updateTag({property: 'og:site_name', content: 'bnpbd'});
  //
  //   // Twitter
  //   this.meta.updateTag({name: 'twitter:title', content: this.seoPage?.name});
  //   this.meta.updateTag({name: 'twitter:card', content: 'summary_large_image'});
  //   this.meta.updateTag({name: 'twitter:site', content: '@bdbnp78'});
  //   this.meta.updateTag({name: 'twitter:creator', content: '@bdbnp78'});
  //   this.meta.updateTag({name: 'twitter:description', content: this.seoPage?.seoDescription});
  //
  //   // Microsoft
  //   this.meta.updateTag({name: 'msapplication-TileImage', content: this.seoPage?.image});
  //
  //   // Canonical
  //   this.canonicalService.setCanonicalURL();
  //
  // }

  // private updateMetaDataBn() {
  //   // Title
  //   this.title.setTitle(this.seoPage?.nameEn);
  //
  //   // Meta
  //   this.meta.updateTag({name: 'robots', content: 'index, follow'});
  //   this.meta.updateTag({name: 'theme-color', content: '#00a0db'});
  //   this.meta.updateTag({name: 'copyright', content: 'BNP BD'});
  //   this.meta.updateTag({name: 'author', content: 'BNP BD'});
  //   this.meta.updateTag({name: 'description', content: this.seoPage?.seoDescription});
  //   this.meta.updateTag({name: 'keywords', content: this.seoPage?.keyWord});
  //
  //   // Open Graph(og:)
  //   this.meta.updateTag({property: 'og:title', content: this.seoPage?.nameEn});
  //   this.meta.updateTag({property: 'og:type', content: 'website'});
  //   this.meta.updateTag({property: 'og:url', content: `https://bnpbd.org${this.router.url}`});
  //   this.meta.updateTag({property: 'og:image', content: this.seoPage?.image});
  //   // this.meta.updateTag({property: 'og:image:type', content: 'image/jpeg'});
  //   this.meta.updateTag({property: 'og:image:width', content: '300'});
  //   this.meta.updateTag({property: 'og:image:height', content: '300'});
  //   this.meta.updateTag({property: 'og:description', content: this.seoPage?.seoDescription});
  //   this.meta.updateTag({property: 'og:locale', content: 'en_US'});
  //   this.meta.updateTag({property: 'og:site_name', content: 'bnpbd'});
  //
  //   // Twitter
  //   this.meta.updateTag({name: 'twitter:title', content: this.seoPage?.nameEn});
  //   this.meta.updateTag({name: 'twitter:card', content: 'summary_large_image'});
  //   this.meta.updateTag({name: 'twitter:site', content: '@bdbnp78'});
  //   this.meta.updateTag({name: 'twitter:creator', content: '@bdbnp78'});
  //   this.meta.updateTag({name: 'twitter:description', content: this.seoPage?.seoDescription});
  //
  //   // Microsoft
  //   this.meta.updateTag({name: 'msapplication-TileImage', content: this.seoPage?.image});
  //
  //   // Canonical
  //   this.canonicalService.setCanonicalURL();
  //
  // }

  /**
   * DIALOG VIEW COMPONENT
   * openYoutubeVideoDialog()
   * getDiscountCourses()
   */
  public openYoutubeVideoDialog(event: MouseEvent, url: string) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(YoutubeVideoShowComponent, {
      data: { url: url },
      panelClass: ['theme-dialog', 'no-padding-dialog'],
      width: '98%',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '100vh',
      autoFocus: false,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult && dialogResult.data) {
      }
    });
  }



  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onLoadMore() {
    if (this.totalVideo() > this.video().length) {
      this.isLoadMore = true;
      this.videoCurrentPage += 1;
      // this.getAllVideo(true);
    }
  }

  onChangeLanguage(language: string) {
    this.isChangeLanguage = language === 'bn';
    this.translateService.use(language);
  }

  onChangeLanguageToggle(language: string) {
    if (this.isChangeLanguageToggle !== language) {
      this.isChangeLanguageToggle = language;
      this.isChangeLanguage = true;
      this.translateService.use(this.isChangeLanguageToggle);
    }
    else {
      this.isChangeLanguageToggle = 'en';
      this.isChangeLanguage = false;
      this.translateService.use(this.isChangeLanguageToggle);
    }
  }
}
