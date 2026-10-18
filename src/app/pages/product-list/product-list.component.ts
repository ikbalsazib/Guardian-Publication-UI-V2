import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Poster } from '../../interfaces/common/poster';
import { SubCategory } from '../../interfaces/common/sub-category.interface';
import { SubCategoryService } from '../../services/common/sub-category.service';
import { ReloadService } from '../../services/core/reload.service';
import { POSTER } from '../../core/db/poster.db';
import { Author } from '../../interfaces/common/author.interface';
import { Banner } from '../../interfaces/common/banner.interface';
import { Category } from '../../interfaces/common/category.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { AuthorService } from '../../services/common/author.service';
import { BannerService } from '../../services/common/banner.service';
import { CategoryService } from '../../services/common/category.service';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { Meta, Title } from "@angular/platform-browser";
import { SeoPageService } from "../../services/common/seo-page.service";
import { CanonicalService } from "../../services/core/canonical.service";
import { SeoPage } from "../../interfaces/common/seo-page.interface";
import { CommonModule } from '@angular/common';
import { PosterCardOneComponent } from '../../shared/components/poster-card-one/poster-card-one.component';
import { ProductsComponent } from './products/products.component';
import { SeoService } from '../../services/core/seo.service';
import { SeoInternalLinksComponent } from '../../shared/components/seo-internal-links/seo-internal-links.component';
import { Product } from '../../interfaces/common/product';
import { getProductCanonicalPath } from '../../core/utils/product-seo.util';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ProductsComponent,
    PosterCardOneComponent,
    SeoInternalLinksComponent
  ]
})
export class ProductListComponent implements OnInit, OnDestroy {
  // Signals
  categories = signal<Category[]>([]);
  subCategories = signal<SubCategory[]>([]);
  authors = signal<Author[]>([]);
  listBanners = signal<Banner[]>([]);
  isLoadingAuthor = signal<boolean>(false);
  isBannerLoading = signal<boolean>(false);
  filterSlide = signal<boolean>(false);
  seoPage = signal<SeoPage | null>(null);

  // Normal Data
  posters: Poster[] = POSTER;
  slug: string | null = null;
  categoryId: string | null = null;
  language: string | null = null;
  setSlugActive: string = '';

  // Computed
  slugCategory = computed(() => {
    return this.categories().find(c => c.slug === this.slug);
  });

  // Dependencies
  private seoService = inject(SeoService);
  private seoPageService = inject(SeoPageService);
  private reloadService = inject(ReloadService);
  private activatedRoute = inject(ActivatedRoute);
  private bannerService = inject(BannerService);
  private categoryService = inject(CategoryService);
  private authorService = inject(AuthorService);
  private subCategoryService = inject(SubCategoryService);
  public translateService = inject(TranslateService);
  private router = inject(Router);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subRoute = this.activatedRoute.queryParamMap.subscribe((res) => {
      this.slug = res.get('categories');
      this.categoryId = res.get('categoryId');
      this.language = res.get('language');
      
      if (this.categoryId) {
        this.fetchSubCategories(this.categoryId);
      }

      this.updatePageSchema();
    });

    this.subscriptions.push(subRoute);
    
    this.fetchSeoPage();
    this.fetchCategories();
    this.fetchBanners();
    this.fetchAuthors();
  }

  onSetActive(slug: string) {
    if (slug) {
      this.setSlugActive = slug;
    }
  }

  onClearActive(): void {
    this.router.navigate(['/product-list']);
    this.setSlugActive = '';
  }

  showCategorySlide() {
    this.reloadService.needRefreshCategorySlide(true);
  }

  private fetchCategories() {
    const filter: FilterData = {
      filter: null,
      select: { name: 1, nameEn: 1, slug: 1, image: 1 },
      pagination: null,
      sort: { serial: 1 },
    };
    this.isLoadingAuthor.set(true);

    const subCat = this.categoryService.getAllCategory(filter, null).subscribe({
      next: (res) => {
        if (res.success) {
          this.categories.set(res.data);
          this.isLoadingAuthor.set(false);
          this.updatePageSchema();
        }
      },
      error: (err) => {
        this.isLoadingAuthor.set(false);
        console.log(err);
      }
    });
    this.subscriptions.push(subCat);
  }

  private fetchSubCategories(id: string) {
    const mSelect = 'name slug image priority readOnly createdAt category';
    const subSub = this.subCategoryService.getSubCategoriesByCategoryId(id, mSelect).subscribe({
      next: (res) => {
        this.subCategories.set(res.data);
      },
      error: (error) => console.log(error)
    });
    this.subscriptions.push(subSub);
  }

  private fetchBanners() {
    const filterData: FilterData = {
      filter: null,
      select: { name: 1, slug: 1, image: 1, bannerType: 1, url: 1 },
      sort: null,
      pagination: null,
    };

    this.isBannerLoading.set(true);
    const subBanner = this.bannerService.getAllBanners(filterData, null).subscribe({
      next: (res) => {
        if (res.success) {
          this.listBanners.set(res.data.filter((d) => d.bannerType === 'productListBanner1'));
          this.isBannerLoading.set(false);
        }
      },
      error: (err) => {
        this.isBannerLoading.set(false);
        console.log(err);
      }
    });
    this.subscriptions.push(subBanner);
  }

  private fetchAuthors() {
    const filter: FilterData = {
      select: { name: 1, slug: 1, image: 1, createdAt: 1, description: 1, birthDate: 1 },
      filter: null,
      sort: { createdAt: -1 },
      pagination: null,
    };

    this.isLoadingAuthor.set(true);
    const subAuthor = this.authorService.getAllAuthors(filter, null).subscribe({
      next: (res) => {
        if (res.success) {
          this.authors.set(res.data);
          this.isLoadingAuthor.set(false);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingAuthor.set(false);
      }
    });
    this.subscriptions.push(subAuthor);
  }

  filterSlideToggle() {
    this.filterSlide.update(v => !v);
  }

  private fetchSeoPage() {
    const subSeo = this.seoPageService.getSeoPageByPageWithCache('product-list', 'name image seoDescription keyWord pageName')
      .subscribe({
        next: res => {
          this.seoPage.set(res);
          if (res) {
            this.updateMetaData();
          }
        },
        error: err => console.log(err)
      });
    this.subscriptions.push(subSeo);
  }

  private updateMetaData() {
    const page = this.seoPage();
    if (!page) return;

    this.seoService.updateMetaData({
      title: page.name,
      description: page.seoDescription,
      keywords: page.keyWord,
      image: page.image,
      canonicalPath: this.slug ? `/product-list?categories=${this.slug}` : '/product-list',
    });
    this.updatePageSchema();
  }

  private updatePageSchema() {
    const category = this.slugCategory();
    const breadcrumbs = category
      ? [
          { label: this.translateService.instant('ln.AllBooks') || 'All Books', url: '/product-list' },
          { label: category.name || category.nameEn || '', isCurrent: true },
        ]
      : [{ label: this.translateService.instant('ln.AllBooks') || 'All Books', isCurrent: true }];

    const canonicalPath = this.getListingCanonicalPath();
    this.seoService.setBreadcrumbSchema(canonicalPath, breadcrumbs);
  }

  onProductsChange(products: Product[]) {
    const page = this.seoPage();
    const category = this.slugCategory();
    const breadcrumbs = category
      ? [
          { label: this.translateService.instant('ln.AllBooks') || 'All Books', url: '/product-list' },
          { label: category.name || category.nameEn || '', isCurrent: true },
        ]
      : [{ label: this.translateService.instant('ln.AllBooks') || 'All Books', isCurrent: true }];

    const items = products
      .filter((product) => product.slug)
      .map((product) => ({ url: getProductCanonicalPath(product.slug) }));

    if (!items.length) {
      this.updatePageSchema();
      return;
    }

    this.seoService.setCollectionSchema(
      this.getListingCanonicalPath(),
      category?.name || page?.name || this.translateService.instant('ln.AllBooks') || 'All Books',
      items,
      breadcrumbs
    );
  }

  private getListingCanonicalPath(): string {
    return this.slug ? `/product-list?categories=${this.slug}` : '/product-list';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
