import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { Banner } from "../../interfaces/common/banner.interface";
import { BannerService } from "../../services/common/banner.service";
import { Meta, Title } from "@angular/platform-browser";
import { CanonicalService } from "../../services/core/canonical.service";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { CommonModule } from '@angular/common';

// Standalone Components
import { ProductDetailsAreaComponent } from './product-details-area/product-details-area.component';
import { RelatedProductComponent } from './related-product/related-product.component';
import { DescriptionComponent } from './description/description.component';
import { RatingAndReviewComponent } from './rating-and-review/rating-and-review.component';
import { PosterCardOneComponent } from '../../shared/components/poster-card-one/poster-card-one.component';
import { FILTER_TAGS } from '../../core/utils/app-data';
import { Product } from '../../interfaces/common/product';
import { ProductService } from '../../services/common/product.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { SlugToNormalPipe } from '../../shared/pipes/slug-to-normal.pipe';
import { SeoService } from '../../services/core/seo.service';
import { GtmService } from '../../services/core/gtm.service';
import { isInvalidPublicSlug } from '../../core/utils/html-content.util';
import { buildProductMetaDescription, getProductCanonicalPath } from '../../core/utils/product-seo.util';


@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ProductDetailsAreaComponent,
    RelatedProductComponent,
    DescriptionComponent,
    BreadcrumbComponent,
    SlugToNormalPipe
  ]
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  // Signals
  product = signal<Product | null>(null);
  breadcrumbItems = signal<BreadcrumbItem[]>([]);
  relatedProducts = signal<Product[]>([]);
  relatedAuthorProducts = signal<Product[]>([]);
  bestSellingProducts = signal<Product[]>([]);
  detailBanners = signal<Banner[]>([]);
  isBannerLoading = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Normal Data
  slug: string | null = null;
  language: string | null = null;

  // Dependencies
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private title = inject(Title);
  private meta = inject(Meta);
  public translateService = inject(TranslateService);
  private router = inject(Router);
  private bannerService = inject(BannerService);
  private seoService = inject(SeoService);
  private gtmService = inject(GtmService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subQ = this.activatedRoute.queryParamMap.subscribe(qPram => {
      this.language = qPram.get('language');
    });

    const subP = this.activatedRoute.paramMap.subscribe(res => {
      this.slug = res.get('slug');
      if (this.slug) {
        if (isInvalidPublicSlug(this.slug)) {
          this.router.navigate(['/product-list']);
          return;
        }
        this.fetchProduct();
      }
    });

    this.subscriptions.push(subQ, subP);
  }

  private fetchProduct() {
    this.isLoading.set(true);
    const subProd = this.productService.getProductBySlug(this.slug!).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          const productData = res.data;
          this.product.set(productData);
          if (productData) {
            this.updateMetaData(productData);
            this.setBreadcrumbs(productData);
            this.fetchBanners();
            this.fetchRelatedData(productData);

            // Analytics View Content Event
            this.trackViewContent(productData);
          }
        } else if (res.redirectTo) {
          this.seoService.clearSchema();
          this.router.navigate([res.redirectTo]);
        } else {
          this.seoService.clearSchema();
          this.router.navigate(['/product-list']);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.seoService.clearSchema();
        this.router.navigate(['/product-list']);
      }
    });
    this.subscriptions.push(subProd);
  }

  private fetchRelatedData(product: Product) {
    const mSelect = {
      name: 1, nameEn: 1, images: 1, slug: 1, author: 1, salePrice: 1,
      category: 1, ratingCount: 1, ratingTotal: 1, priority: 1, quantity: 1,
      discountAmount: 1, discountType: 1, costPrice: 1, edition: 1, freeDelivery: 1,
      offerDiscountAmount: 1, offerDiscountType: 1, resetDiscount: 1
    };

    // Related Category
    const subRel = this.productService.getAllProducts({
      filter: { "category._id": product.category?._id },
      sort: { priority: -1 },
      pagination: { pageSize: 12, currentPage: 0 },
      select: mSelect
    }).subscribe(res => {
      if (res.success) {
        this.relatedProducts.set(res.data);
        // Best Selling in same category
        this.bestSellingProducts.set(res.data.filter((p: Product) =>
          p.tags?.some((t: any) => t.slug === FILTER_TAGS[4].viewValue)
        ));
      }
    });

    // Related Author
    if (product.author?.length) {
      const subAut = this.productService.getAllProducts({
        filter: { "author._id": product.author[0]?._id },
        sort: { priority: -1 },
        pagination: { pageSize: 12, currentPage: 0 },
        select: mSelect
      }).subscribe(res => {
        if (res.success) this.relatedAuthorProducts.set(res.data);
      });
      this.subscriptions.push(subAut);
    }

    this.subscriptions.push(subRel);
  }

  private fetchBanners() {
    this.isBannerLoading.set(true);
    const subBanner = this.bannerService.getAllBanners({
      filter: null, select: { name: 1, slug: 1, image: 1, imageUrl: 1, bannerType: 1, url: 1 },
      sort: null, pagination: null
    }, null).subscribe({
      next: (res) => {
        if (res.success) {
          this.detailBanners.set(res.data.filter(d => d.bannerType === "productDetailsBanner1"));
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

  private trackViewContent(prod: Product) {
    if (!prod) return;
    const price = prod.salePrice || 0;
    const categoryName = prod.category?.name || '';

    // Create GTM view content payload
    const payload = {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      eventId: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      action_source: 'website',
      event_source_url: typeof window !== 'undefined' && window.location ? window.location.href : '',
      contentId: prod._id,
      contentName: prod.nameEn || prod.name,
      contentCategory: categoryName,
      value: price,
      currency: 'BDT',
      custom_data: {
        value: price,
        currency: 'BDT',
        content_name: prod.nameEn || prod.name,
        content_type: 'product',
        content_ids: [prod._id]
      }
    };

    // Client-side fb pixel
    if (this.gtmService.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
      this.gtmService.trackByFacebookPixel('ViewContent', {
        content_name: prod.nameEn || prod.name,
        content_type: 'product',
        content_ids: [prod._id],
        value: price,
        currency: 'BDT'
      }, payload.eventId);
    }

    // Client-side Tiktok pixel
    this.gtmService.trackByTiktokPixel('ViewContent', {
      content_id: prod._id,
      content_type: 'product',
      content_name: prod.nameEn || prod.name,
      value: price,
      currency: 'BDT'
    }, payload.eventId);

    // Server-side
    this.gtmService.trackViewContent(payload as any).subscribe();
  }

  private updateMetaData(prod: Product) {
    const authorName = prod.author?.[0]?.name || prod.author?.[0]?.nameEn || '';
    const bookTitle = prod.name || prod.nameEn || '';
    const slug = prod.slug || '';
    const description = buildProductMetaDescription(
      bookTitle,
      authorName,
      slug,
      prod.seoDescription || prod.shortDescription
    );
    const canonicalPath = getProductCanonicalPath(slug);

    this.seoService.updateMetaData({
      title: bookTitle,
      authorName,
      titleType: authorName ? 'book' : 'default',
      description,
      keywords: prod.seoKeywords || `${bookTitle}, ${authorName}, books, guardian publications`,
      image: prod.images?.[0] || '',
      type: 'book',
      canonicalPath
    });

    const breadcrumbItems: BreadcrumbItem[] = [
      {
        label: prod.category?.name || 'বইসমূহ',
        url: prod.category?.slug ? `/product-list?categories=${prod.category.slug}` : '/product-list',
      },
      { label: prod.name, isCurrent: true },
    ];
    this.seoService.setProductSchema(prod, breadcrumbItems);
  }

  private setBreadcrumbs(prod: Product) {
    const categoryUrl = prod.category?.slug
      ? `/product-list?categories=${prod.category.slug}`
      : '/product-list';
    const items: BreadcrumbItem[] = [
      { label: prod.category?.name || 'বইসমূহ', url: categoryUrl },
      { label: prod.name, isCurrent: true }
    ];
    this.breadcrumbItems.set(items);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
