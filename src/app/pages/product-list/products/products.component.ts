import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID, output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { Pagination } from "../../../interfaces/core/pagination";
import { CommonModule } from '@angular/common';
import { ProductCardOneComponent } from '../../../shared/components/product-card-one/product-card-one.component';
import { DATABASE_KEY } from '../../../core/utils/global-variable';
import { Product } from '../../../interfaces/common/product';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { ProductService } from '../../../services/common/product.service';
import { StorageService } from '../../../services/core/storage.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ProductCardOneComponent
  ]
})
export class ProductsComponent implements OnInit, OnDestroy {
  productsChange = output<Product[]>();

  // Signals
  products = signal<Product[]>([]);
  totalProducts = signal<number>(0);
  isLoading = signal<boolean>(false);
  isLoadMore = signal<boolean>(false);

  // Normal Data
  currentPage = 1;
  productsPerPage = 15;
  categorySlug: string | null = null;
  subCategorySlug: string | null = null;
  authorSlug: string | null = null;
  tagsSlug: string | null = null;
  searchQuery: string | null = null;
  id: string | null = null;

  // Dependencies
  private productService = inject(ProductService);
  private activatedRoute = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subQ = this.activatedRoute.queryParams.subscribe(qParam => {
      this.id = qParam['categoryId'];
      this.categorySlug = qParam['categories'];
      this.subCategorySlug = qParam['subCategory'];
      this.authorSlug = qParam['author'];
      this.tagsSlug = qParam['tags'];
      this.searchQuery = qParam['searchQuery'] || null;

      const restoredState = this.restoreState();
      if (restoredState) {
        this.products.set(restoredState.products || []);
        this.currentPage = restoredState.currentPage || 1;
        this.totalProducts.set(restoredState.totalProducts || 0);

        setTimeout(() => {
          if (restoredState.scrollPosition && this.isBrowser) {
            window.scrollTo(0, restoredState.scrollPosition);
          }
        }, 100);
        this.emitVisibleProducts();
      } else {
        this.fetchProducts();
      }
    });

    this.subscriptions.push(subQ);
  }

  fetchProducts(loadMore = false) {
    const pagination: Pagination = {
      pageSize: this.productsPerPage,
      currentPage: this.currentPage - 1
    };

    const filterData: FilterData = {
      filter: {
        ...(this.categorySlug && { "category.slug": this.categorySlug }),
        ...(this.subCategorySlug && { "subCategory.slug": this.subCategorySlug }),
        ...(this.authorSlug && { "author.slug": this.authorSlug }),
        ...(this.tagsSlug && { "tags.slug": this.tagsSlug }),
        status: 'publish',
        'tags.name': { $ne: 'Coming Soon' }
      },
      select: {
        name: 1,
        nameEn: 1,
        images: 1,
        costPrice: 1,
        slug: 1,
        author: 1, category: 1,
        salePrice: 1,
        quantity: 1,
        discountAmount: 1,
        priority: 1,
        ratingCount: 1,
        ratingTotal: 1,
        discountType: 1,
        tags: 1,
        freeDelivery: 1,
        offerDiscountAmount: 1,
        offerDiscountType: 1,
        resetDiscount: 1
      },
      sort: { priority: -1 },
      pagination: pagination,
    };

    if (loadMore) {
      this.isLoadMore.set(true);
    } else {
      this.isLoading.set(true);
    }

    const subProducts = this.productService.getAllProducts(filterData, this.searchQuery).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isLoadMore.set(false);
        if (res) {
          if (loadMore) {
            this.products.update(prev => [...prev, ...res.data]);
          } else {
            this.products.set(res.data);
          }
          this.totalProducts.set(res.count);
          this.saveState();
          this.emitVisibleProducts();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isLoadMore.set(false);
        console.log(err);
      }
    });

    this.subscriptions.push(subProducts);
  }

  onLoadMore() {
    if (this.totalProducts() > this.products().length) {
      this.currentPage += 1;
      this.fetchProducts(true);
      this.saveState();
    }
  }

  private saveState(): void {
    const stateKey = this.getStateKey();
    const state = {
      products: this.products(),
      currentPage: this.currentPage,
      totalProducts: this.totalProducts(),
      scrollPosition: this.isBrowser ? (window.pageYOffset || document.documentElement.scrollTop) : 0,
      categorySlug: this.categorySlug,
      subCategorySlug: this.subCategorySlug,
      authorSlug: this.authorSlug,
      tagsSlug: this.tagsSlug,
      searchQuery: this.searchQuery
    };
    this.storageService.storeDataToSessionStorage(stateKey, state);
  }

  private restoreState(): any {
    const stateKey = this.getStateKey();
    const savedState = this.storageService.getDataFromSessionStorage(stateKey);

    if (savedState && savedState.products?.length > 0) {
      if (savedState.categorySlug === this.categorySlug &&
        savedState.subCategorySlug === this.subCategorySlug &&
        savedState.authorSlug === this.authorSlug &&
        savedState.tagsSlug === this.tagsSlug &&
        savedState.searchQuery === this.searchQuery) {
        return savedState;
      }
    }
    return null;
  }

  private getStateKey(): string {
    const params = [
      this.categorySlug || '',
      this.subCategorySlug || '',
      this.authorSlug || '',
      this.tagsSlug || '',
      this.searchQuery || ''
    ].join('|');
    return `${DATABASE_KEY.productsListState}_v2_${params}`;
  }

  private emitVisibleProducts(): void {
    this.productsChange.emit(this.products());
  }

  ngOnDestroy(): void {
    if (this.products().length > 0) {
      this.saveState();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
