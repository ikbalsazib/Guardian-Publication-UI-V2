import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID, viewChild, ElementRef, effect, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardOneComponent } from '../../../shared/components/product-card-one/product-card-one.component';
import { CardOneLoaderComponent } from '../../../shared/skeleton-loader/card-one-loader/card-one-loader.component';
import { TranslateModule } from "@ngx-translate/core";
import { Product } from "../../../interfaces/common/product";
import { Subscription } from "rxjs";
import { ProductService } from "../../../services/common/product.service";
import { FilterData } from "../../../interfaces/gallery/filter-data";

@Component({
  selector: 'app-popular-book',
  templateUrl: './popular-book.component.html',
  styleUrls: ['./popular-book.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardOneComponent,
    CardOneLoaderComponent,
    TranslateModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PopularBookComponent implements OnInit, OnDestroy {
  // Signals
  products = signal<Product[]>([]);
  isLoadingPopularBook = signal<boolean>(false);

  // Services
  private productService = inject(ProductService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor() { }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.getAllPopularProducts();
    }
  }


  /**
   * NEW PUBLICATION HTTP REQUEST HANDLE
   * getAllNewPublicationProducts()
   */
  private getAllPopularProducts() {
    const mSelect = {
      _id: 1,
      name: 1,
      nameEn: 1,
      images: 1,
      costPrice: 1,
      salePrice: 1,
      author: 1,
      quantity: 1,
      ratingCount: 1,
      ratingTotal: 1,
      priority: 1,
      discountAmount: 1,
      discountType: 1,
      tags: 1,
      slug: 1,
      freeDelivery: 1,
      offerDiscountAmount: 1,
      offerDiscountType: 1,
      resetDiscount: 1
    }
    let filter: FilterData = {
      select: mSelect,
      sort: { priority: -1 },
      filter: { 'tags.slug': 'popular-book' },
      pagination: null
    }

    this.isLoadingPopularBook.set(true);
    const sub = this.productService.getAllProducts(filter, null).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products.set(res.data);
        }
        this.isLoadingPopularBook.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoadingPopularBook.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  //Destroy Subscription

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }



}
