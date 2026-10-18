import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProductService } from '../../services/common/product.service';
import { ReloadService } from '../../services/core/reload.service';
import { CartService } from '../../services/common/cart.service';
import { UiService } from '../../services/core/ui.service';
import { UserService } from '../../services/common/user.service';
import { Product } from '../../interfaces/common/product'; // Fixed import
import { Cart } from '../../interfaces/common/cart.interface';
import { SeoService } from '../../services/core/seo.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TranslateModule, 
    MatButtonModule, 
    MatProgressSpinnerModule
  ]
})
export class CompareComponent implements OnInit, OnDestroy {
  // Signals
  compareList = signal<Product[]>([]);
  isLoading = signal<boolean>(false);
  isEmpty = signal<boolean>(true);

  // Dependencies
  private productService = inject(ProductService);
  private reloadService = inject(ReloadService);
  private cartService = inject(CartService);
  private uiService = inject(UiService);
  private userService = inject(UserService);
  private seoService = inject(SeoService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.seoService.clearSchema();
    this.seoService.updateMetaData({ title: 'Compare Books', noIndex: true });
    const subReload = this.reloadService.refreshCompareList$.subscribe(() => {
      this.loadCompareList();
    });
    this.subscriptions.push(subReload);

    this.loadCompareList();
  }

  private loadCompareList() {
    const localList = this.productService.getCompareList();
    if (localList && localList.length > 0) {
      const ids = localList.map((item: any) => item._id || item);
      this.fetchProductDetails(ids);
    } else {
      this.compareList.set([]);
      this.isEmpty.set(true);
    }
  }

  private fetchProductDetails(ids: string[]) {
    this.isLoading.set(true);
    const sub = this.productService.getProductByIds(ids).subscribe({
      next: (res) => {
        this.compareList.set(res.data);
        this.isEmpty.set(res.data.length === 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.isEmpty.set(true);
      }
    });
    this.subscriptions.push(sub);
  }

  onRemoveItem(id: string) {
    this.productService.deleteCompareItem(id);
    this.reloadService.needRefreshCompareList$();
  }

  onAddToCart(productId: string) {
    const data: Cart = {
      product: productId,
      selectedQty: 1
    };

    if (this.userService.getUserStatus()) {
      this.cartService.addToCart(data).subscribe({
        next: (res) => {
          this.uiService.success(res.message);
          this.reloadService.needRefreshCart$(true);
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
        }
      });
    } else {
      this.cartService.addCartItemToLocalStorage(data);
      this.uiService.success('বইটি কার্টে যুক্ত হয়েছে।');
      this.reloadService.needRefreshCart$(true);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
