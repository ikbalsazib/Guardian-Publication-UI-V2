import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID } from '@angular/core';
import { Subscription } from 'rxjs';

import { SeoPage } from "../../interfaces/common/seo-page.interface";
import { Meta, Title } from "@angular/platform-browser";
import { SeoPageService } from "../../services/common/seo-page.service";
import { CanonicalService } from "../../services/core/canonical.service";
import { Router, RouterModule } from "@angular/router";
import { isPlatformBrowser, CommonModule } from "@angular/common";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Blog } from '../../interfaces/common/blog.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { BlogService } from '../../services/common/blog.service';
import { BlogCardOneComponent } from '../../shared/components/blog-card-one/blog-card-one.component';
import { SeoService } from '../../services/core/seo.service';
import { SeoInternalLinksComponent } from '../../shared/components/seo-internal-links/seo-internal-links.component';

@Component({
  selector: 'app-all-blogs',
  templateUrl: './all-blogs.component.html',
  styleUrls: ['./all-blogs.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    BlogCardOneComponent,
    SeoInternalLinksComponent
  ]
})
export class AllBlogsComponent implements OnInit, OnDestroy {
  // Signals
  blogs = signal<Blog[]>([]);
  isLoading = signal<boolean>(true);
  totalBlogs = signal<number>(0);
  seoPage = signal<SeoPage | null>(null);

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(12);

  // Platform
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  // Dependencies
  private seoService = inject(SeoService);
  private blogService = inject(BlogService);
  private seoPageService = inject(SeoPageService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.fetchBlogs();
    this.fetchSeoData();
  }

  private fetchBlogs() {
    this.isLoading.set(true);
    const mSelect = {
      name: 1, shortDesc: 1, image: 1, authorName: 1,
      totalView: 1, createdAt: 1, slug: 1
    };

    const filterData: FilterData = {
      filter: null, select: mSelect, pagination: null,
      sort: { createdAt: -1 }
    };

    const subB = this.blogService.getAllBlog(filterData, null).subscribe({
      next: (res) => {
        if (res.success) {
          this.blogs.set(res.data);
          this.totalBlogs.set(res.count);
          this.updateCollectionSchema();
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
    this.subscriptions.push(subB);
  }

  private fetchSeoData() {
    const subS = this.seoPageService.getSeoPageByPageWithCache('blog', 'name image seoDescription keyWord pageName').subscribe({
      next: (res) => {
        this.seoPage.set(res);
        if (res) this.updateMetaData(res);
      }
    });
    this.subscriptions.push(subS);
  }

  private updateMetaData(seo: SeoPage) {
    this.seoService.updateMetaData({
      title: seo.name,
      description: seo.seoDescription,
      keywords: seo.keyWord,
      image: seo.image,
      canonicalPath: '/blogs',
    });
    this.seoService.setBreadcrumbSchema('/blogs', [
      { label: this.translate.instant('ln.BlogTitle'), isCurrent: true },
    ]);
  }

  private updateCollectionSchema() {
    const items = this.blogs()
      .filter((blog) => blog.slug)
      .map((blog) => ({ url: `/blog/${blog.slug}` }));

    if (!items.length) {
      return;
    }

    const seo = this.seoPage();
    this.seoService.setCollectionSchema(
      '/blogs',
      seo?.name || this.translate.instant('ln.BlogTitle'),
      items,
      [{ label: this.translate.instant('ln.BlogTitle'), isCurrent: true }]
    );
  }

  onPageChanged(event: number) {
    this.currentPage.set(event);
    // Add pagination logic if backend supports it for blogs
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
