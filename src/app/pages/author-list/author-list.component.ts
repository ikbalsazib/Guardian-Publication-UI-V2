import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { Author } from '../../interfaces/common/author.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { AuthorService } from '../../services/common/author.service';
import { AuthorCardOneComponent } from '../../shared/components/author-card-one/author-card-one.component';
import { SeoService } from '../../services/core/seo.service';
import { SeoInternalLinksComponent } from '../../shared/components/seo-internal-links/seo-internal-links.component';



@Component({
  selector: 'app-author-list',
  templateUrl: './author-list.component.html',
  styleUrls: ['./author-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatProgressSpinnerModule,
    AuthorCardOneComponent,
    NgxPaginationModule,
    SeoInternalLinksComponent
  ]
})
export class AuthorListComponent implements OnInit, OnDestroy {
  // Signals
  authors = signal<Author[]>([]);
  isLoading = signal<boolean>(false);
  totalAuthors = signal<number>(0);

  // Pagination (Can be expanded)
  currentPage = signal<number>(1);
  pageSize = signal<number>(24);

  // Dependencies
  private authorService = inject(AuthorService);
  private seoService = inject(SeoService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.updateSeoMeta();
    this.fetchAuthors();
  }

  private updateSeoMeta() {
    this.seoService.updateMetaData({
      title: 'আমাদের লেখকদের তালিকা - গার্ডিয়ান পাবলিকেশনস',
      description: 'গার্ডিয়ান পাবলিকেশনস-এর সাথে যুক্ত দেশি-বিদেশি প্রথিতযশা লেখক এবং অনুবাদকদের তালিকা দেখুন। তাদের প্রকাশিত বই সম্পর্কে বিস্তারিত জানুন।',
      keywords: 'লেখক তালিকা, গার্ডিয়ান লেখক, জনপ্রিয় লেখক, অনুবাদক, বইয়ের লেখক',
      canonicalPath: '/author-list',
    });
    this.seoService.setBreadcrumbSchema('/author-list', [
      { label: 'লেখক তালিকা', isCurrent: true },
    ]);
  }

  private updateCollectionSchema() {
    const items = this.authors()
      .filter((author) => author.slug)
      .map((author) => ({ url: `/author/${author.slug}` }));

    if (!items.length) {
      return;
    }

    this.seoService.setCollectionSchema(
      '/author-list',
      'লেখক তালিকা',
      items,
      [{ label: 'লেখক তালিকা', isCurrent: true }]
    );
  }

  private fetchAuthors() {
    const filter: FilterData = {
      select: { name: 1, nameEn: 1, image: 1, slug: 1 },
      filter: null,
      sort: { name: 1 },
      pagination: { 
        pageSize: this.pageSize(), 
        currentPage: this.currentPage() - 1 
      }
    };

    this.isLoading.set(true);
    const sub = this.authorService.getAllAuthors(filter, null).subscribe({
      next: (res) => {
        if (res.success) {
          this.authors.set(res.data);
          this.totalAuthors.set(res.count);
          this.updateCollectionSchema();
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
    this.subscriptions.push(sub);
  }

  onPageChange(event: number) {
    this.currentPage.set(event);
    this.fetchAuthors();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
