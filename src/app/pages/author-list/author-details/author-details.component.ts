import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Author } from '../../../interfaces/common/author.interface';
import { Product } from '../../../interfaces/common/product';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { AuthorService } from '../../../services/common/author.service';
import { ProductService } from '../../../services/common/product.service';
import { ProductCardOneComponent } from '../../../shared/components/product-card-one/product-card-one.component';
import { SpecialPackageComponent } from '../../home/special-package/special-package.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { SeoService } from '../../../services/core/seo.service';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { countWords, stripHtml } from '../../../core/utils/html-content.util';
import { AUTHOR_BIO_FALLBACK, GUARDIAN_TEAM_BIO_FALLBACK, isGuardianTeamAuthor } from '../../../core/utils/page-seo-fallbacks';
import { SeoInternalLinksComponent } from '../../../shared/components/seo-internal-links/seo-internal-links.component';



@Component({
  selector: 'app-author-details',
  templateUrl: './author-details.component.html',
  styleUrls: ['./author-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatProgressSpinnerModule,
    ProductCardOneComponent,
    SpecialPackageComponent,
    BreadcrumbComponent,
    SafeHtmlPipe,
    SeoInternalLinksComponent
  ]
})
export class AuthorDetailsComponent implements OnInit, OnDestroy {
  // Signals
  author = signal<Author | null>(null);
  products = signal<Product[]>([]);
  breadcrumbItems = signal<BreadcrumbItem[]>([]);
  isLoading = signal<boolean>(false);
  isLoadingProducts = signal<boolean>(false);

  // Dependencies
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authorService = inject(AuthorService);
  private productService = inject(ProductService);
  private seoService = inject(SeoService);
  public translateService = inject(TranslateService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subRoute = this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchAuthorData(slug);
      }
    });
    this.subscriptions.push(subRoute);
  }

  private fetchAuthorData(slug: string) {
    this.isLoading.set(true);
    const sub = this.authorService.getAuthorBySlug(slug).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const authorData = res.data;
          if (authorData.slug && authorData.slug !== slug) {
            this.router.navigate(['/author', authorData.slug], { replaceUrl: true });
            return;
          }
          this.author.set(authorData);
          this.updateMetaData(authorData);
          this.updateBreadcrumbs(authorData);
          this.fetchAuthorProducts(authorData._id);
        } else {
          this.seoService.clearSchema();
          this.router.navigate(['/author-list']);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.seoService.clearSchema();
        this.isLoading.set(false);
        this.router.navigate(['/author-list']);
      }
    });
    this.subscriptions.push(sub);
  }

  private updateMetaData(author: Author) {
    const authorName = author.name || author.nameEn || '';
    const bio = stripHtml(author.description || author.descriptionEn || '');

    this.seoService.updateMetaData({
      title: authorName,
      description: bio
        ? bio.slice(0, 160)
        : `${authorName} এর বই, জীবনী ও প্রকাশিত গ্রন্থ সমূহ Guardian Publications এ দেখুন।`,
      image: author.image,
      author: authorName,
      type: 'profile',
      canonicalPath: `/author/${author.slug}`,
    });

    const breadcrumbs = [
      { label: 'লেখক তালিকা', url: '/author-list' },
      { label: author.name!, isCurrent: true },
    ];
    this.seoService.setAuthorSchema(author, breadcrumbs);
  }

  private updateBreadcrumbs(author: Author) {
    this.breadcrumbItems.set([
      { label: 'হোম', url: '/' },
      { label: 'লেখক তালিকা', url: '/author-list' },
      { label: author.name!, url: `/author/${author.slug}` }
    ]);
  }

  private fetchAuthorProducts(authorId: any) {
    const filter: FilterData = {
      filter: { "author._id": authorId },
      select: { name: 1, nameEn: 1, quantity: 1, images: 1, author: 1, salePrice: 1, costPrice: 1, slug: 1 },
      sort: { createdAt: -1 },
      pagination: { pageSize: 12, currentPage: 0 }
    };

    this.isLoadingProducts.set(true);
    const sub = this.productService.getAllProducts(filter).subscribe({
      next: (res) => {
        if (res.success) {
          this.products.set(res.data);
        }
        this.isLoadingProducts.set(false);
      },
      error: () => this.isLoadingProducts.set(false)
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  authorBioHtml(): string {
    const author = this.author();
    if (!author) return AUTHOR_BIO_FALLBACK;

    const bio = this.translateService.currentLang === 'en'
      ? (author.descriptionEn || author.description || '')
      : (author.description || author.descriptionEn || '');

    if (isGuardianTeamAuthor(author.slug)) {
      return `${bio}${GUARDIAN_TEAM_BIO_FALLBACK}`;
    }

    return countWords(bio) >= 300 ? bio : `${bio}${AUTHOR_BIO_FALLBACK}`;
  }
}
