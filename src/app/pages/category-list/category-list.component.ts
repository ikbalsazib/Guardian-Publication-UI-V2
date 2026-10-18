import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Category } from '../../interfaces/common/category.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { CategoryService } from '../../services/common/category.service';
import { ShopInformationService } from '../../services/common/shop-information.service';
import { SeoService } from '../../services/core/seo.service';
import { SeoInternalLinksComponent } from '../../shared/components/seo-internal-links/seo-internal-links.component';



@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    SeoInternalLinksComponent
  ]
})
export class CategoryListComponent implements OnInit, OnDestroy {
  // Signals
  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(false);
  catalogs = signal<any[]>([]);

  // Dependencies
  private categoryService = inject(CategoryService);
  private shopInfoService = inject(ShopInformationService);
  private seoService = inject(SeoService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.updateSeoMeta();
    this.fetchCategories();
    this.fetchShopInfo();
  }

  private updateSeoMeta() {
    this.seoService.updateMetaData({
      title: 'বইয়ের ক্যাটাগরি - গার্ডিয়ান পাবলিকেশনস',
      description: 'ইসলামি জ্ঞান, ইতিহাস, রাজনীতি এবং সমসাময়িক বিভিন্ন বিষয়ের বইয়ের ক্যাটাগরিগুলো দেখুন এবং আপনার পছন্দের বইটি সংগ্রহ করুন।',
      keywords: 'বইয়ের তালিকা, ইসলামি বই, ইতিহাসের বই, রাজনৈতিক বই, গার্ডিয়ান পাবলিকেশনস ক্যাটাগরি',
      canonicalPath: '/category-list',
    });
    this.seoService.setBreadcrumbSchema('/category-list', [
      { label: 'ক্যাটাগরি', isCurrent: true },
    ]);
  }

  private updateCollectionSchema() {
    const items = this.categories()
      .filter((category) => category.slug)
      .map((category) => ({ url: `/product-list?categories=${category.slug}` }));

    if (!items.length) {
      return;
    }

    this.seoService.setCollectionSchema(
      '/category-list',
      'বইয়ের ক্যাটাগরি',
      items,
      [{ label: 'ক্যাটাগরি', isCurrent: true }]
    );
  }

  private fetchCategories() {
    const filter: FilterData = {
      filter: null,
      select: { name: 1, nameEn: 1, slug: 1, image: 1 },
      sort: { serial: 1 },
      pagination: null
    };

    this.isLoading.set(true);
    const sub = this.categoryService.getAllCategory(filter, null).subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.updateCollectionSchema();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
    this.subscriptions.push(sub);
  }

  private fetchShopInfo() {
    this.shopInfoService.getShopInformation().subscribe(res => {
      if (res.success) {
        // Handle shop info if needed
      }
    });
  }

  onDownloadCatalog(url: string) {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `Guardian-Catalog.pdf`;
    link.click();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
