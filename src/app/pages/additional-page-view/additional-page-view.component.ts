import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdditionalPageService } from '../../services/core/additional-page.service';
import { SafeHtmlPipe } from 'src/app/shared/pipes/safe-html.pipe';
import { SeoService } from '../../services/core/seo.service';
import { countWords, stripHtml } from '../../core/utils/html-content.util';
import { resolvePageSeoFallback } from '../../core/utils/page-seo-fallbacks';
import { SeoInternalLinksComponent } from '../../shared/components/seo-internal-links/seo-internal-links.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-additional-page-view',
  templateUrl: './additional-page-view.component.html',
  styleUrls: ['./additional-page-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SafeHtmlPipe,
    MatProgressSpinnerModule,
    SeoInternalLinksComponent,
    TranslateModule
  ]
})
export class AdditionalPageViewComponent implements OnInit, OnDestroy {
  pageInfo = signal<any>(null);
  isLoading = signal<boolean>(false);
  slug = signal<string | null>(null);

  seoFallbackHtml = computed(() => resolvePageSeoFallback(this.slug() || ''));

  showSeoFallback = computed(() => {
    const page = this.pageInfo();
    const fallback = this.seoFallbackHtml();
    if (!page || !fallback) return false;
    return countWords(page.description || '') < 300;
  });

  private activatedRoute = inject(ActivatedRoute);
  private additionalPageService = inject(AdditionalPageService);
  private seoService = inject(SeoService);

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subRoute = this.activatedRoute.paramMap.subscribe(params => {
      const pageSlug = params.get('pageSlug');
      if (pageSlug) {
        this.slug.set(pageSlug);
        this.fetchPageInfo(pageSlug);
      }
    });
    this.subscriptions.push(subRoute);
  }

  private fetchPageInfo(slug: string) {
    this.isLoading.set(true);
    const sub = this.additionalPageService.getAdditionalPageBySlug(slug).subscribe({
      next: (res) => {
        this.pageInfo.set(res.data);
        if (res.data) {
          const fallback = resolvePageSeoFallback(slug);
          const description = stripHtml(res.data.description || '');
          const pageTitle = res.data.title || slug;
          this.seoService.updateMetaData({
            title: pageTitle,
            description: (description || stripHtml(fallback)).slice(0, 160)
              || `${pageTitle} | Guardian Publications`,
            canonicalPath: `/pages/${slug}`,
          });

          const breadcrumbs = slug === 'about-us'
            ? [{ label: 'গার্ডিয়ান পরিচিতি', isCurrent: true }]
            : [{ label: pageTitle, isCurrent: true }];

          if (slug === 'about-us') {
            this.seoService.setAboutSchema(pageTitle, breadcrumbs);
          } else {
            this.seoService.setWebPageSchema(`/pages/${slug}`, pageTitle, breadcrumbs);
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.seoService.clearSchema();
        this.isLoading.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
