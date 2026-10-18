import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID, viewChild, ElementRef, effect, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogCardOneComponent } from '../../../shared/components/blog-card-one/blog-card-one.component';
import { BlogLoaderComponent } from '../../../shared/skeleton-loader/blog-loader/blog-loader.component';
import { TranslateModule } from "@ngx-translate/core";
import { Blog } from "../../../interfaces/common/blog.interface";
import { Subscription } from 'rxjs';
import { CarouselCntrlService } from '../../../services/common/carousel-cntrl.service';
import { BlogService } from '../../../services/common/blog.service';
import { FilterData } from '../../../interfaces/gallery/filter-data';


@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BlogCardOneComponent,
    BlogLoaderComponent,
    TranslateModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ArticlesComponent implements OnInit, OnDestroy {
  // Signals
  blogs = signal<Blog[]>([]);
  isLoadingBlog = signal<boolean>(true);

  // Swiper Reference
  swiperEl = viewChild<ElementRef>('swiperEl');

  // Services
  public carousel = inject(CarouselCntrlService);
  private blogService = inject(BlogService);
  private platformId = inject(PLATFORM_ID);
  public isBrowser = isPlatformBrowser(this.platformId);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor() {
    effect(() => {
      const data = this.blogs();
      const el = this.swiperEl();
      if (this.isBrowser && data.length > 0 && el) {
        this.initSwiper(el.nativeElement);
      }
    });
  }

  private initSwiper(el: any) {
    const swiperParams = {
      slidesPerView: 1,
      spaceBetween: 30,
      autoplay: true,
      loop: false,
      navigation: true,
      breakpoints: {
        '768': { slidesPerView: 2 },
        '990': { slidesPerView: 3 }
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
      this.getAllBlogs();
    }
  }

  /**
   * HTTP REQUEST HANDLE
   * getAllBlogs()
   */

  getAllBlogs() {
    const filterData: FilterData = {
      filter: null,
      select: { _id: 1, name: 1, slug: 1, nameEn: 1, authorName: 1, shortDesc: 1, shortDescEn: 1, image: 1, totalView: 1, createdAt: 1 },
      sort: { createdAt: -1 }
    }

    this.isLoadingBlog.set(true);
    const sub = this.blogService.getAllBlog(filterData, null).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.blogs.set(res.data);
        }
        this.isLoadingBlog.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoadingBlog.set(false);
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
