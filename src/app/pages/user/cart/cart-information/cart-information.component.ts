import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Cart } from '../../../../interfaces/common/cart.interface';
import { Product } from '../../../../interfaces/common/product';
import { AreaService } from '../../../../services/common/area.service';
import { CartService } from '../../../../services/common/cart.service';
import { DivisionService } from '../../../../services/common/division.service';
import { OrderService } from '../../../../services/common/order.service';
import { ProductService } from '../../../../services/common/product.service';
import { ShippingChargeService } from '../../../../services/common/shipping-charge.service';
import { SpecialPackagesService } from '../../../../services/common/special-packages.service';
import { UserDataService } from '../../../../services/common/user-data.service';
import { UserService } from '../../../../services/common/user.service';
import { ZoneService } from '../../../../services/common/zone.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { UiService } from '../../../../services/core/ui.service';
import { DATABASE_KEY } from '../../../../core/utils/global-variable';
import { EngBnNumPipe } from '../../../../shared/pipes/eng-bn-num.pipe';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { SeoService } from '../../../../services/core/seo.service';

@Component({
  selector: 'app-cart-information',
  templateUrl: './cart-information.component.html',
  styleUrls: ['./cart-information.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    EngBnNumPipe,
    PricePipe
  ],
  providers: [PricePipe, EngBnNumPipe]
})
export class CartInformationComponent implements OnInit, OnDestroy {
  // Signals
  carts = signal<Cart[]>([]);
  isLoading = signal<boolean>(false);

  // Computed
  cartSubTotal = computed(() => {
    return this.carts().reduce((acc, item) => {
      const product = typeof item.product === 'object' ? item.product : null;
      if (!product) return acc;
      const price = this.pricePipe.transform(product, 'salePrice') as number;
      return acc + (price * (item.selectedQty || 0));
    }, 0);
  });

  cartCount = computed(() => this.carts().length);

  // Dependencies
  private router = inject(Router);
  private productService = inject(ProductService);
  private userService = inject(UserService);
  private userDataService = inject(UserDataService);
  public translateService = inject(TranslateService);
  private cartService = inject(CartService);
  private comboPackageService = inject(SpecialPackagesService);
  private reloadService = inject(ReloadService);
  private uiService = inject(UiService);
  private pricePipe = inject(PricePipe);
  private seoService = inject(SeoService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.seoService.clearSchema();
    this.seoService.updateMetaData({
      title: 'কার্ট',
      noIndex: true,
    });
    this.fetchCartData();
    const subCart = this.reloadService.refreshCart$.subscribe(() => this.fetchCartData());
    this.subscriptions.push(subCart);
  }

  private fetchCartData() {
    this.isLoading.set(true);
    if (this.userService.getUserStatus()) {
      this.cartService.getCartByUser().subscribe({
        next: (res) => {
          this.carts.set(res.data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else {
      this.fetchLocalCart();
    }
  }

  private fetchLocalCart() {
    const items = this.cartService.getCartItemFromLocalStorage();
    if (!items || items.length === 0) {
      this.carts.set([]);
      this.isLoading.set(false);
      return;
    }

    const productIds = items.filter(i => !i.cartType || i.cartType === 2).map(i => i.product as string);
    const packageIds = items.filter(i => i.cartType === 1).map(i => i.specialPackage as string);

    const productObs = this.productService.getProductByIds(productIds, 'name salePrice images');
    const packageObs = this.comboPackageService.getProductByIds(packageIds);

    forkJoin([productObs, packageObs]).subscribe({
      next: ([pRes, sRes]) => {
        const products = pRes.data || [];
        const packages = sRes.data || [];

        const mapped = items.map(item => {
          if (item.cartType === 1) {
            const pkg = packages.find(p => p._id === item.specialPackage);
            if (!pkg) return item;
            return { ...item, product: { ...pkg, images: pkg.images || [] } };
          } else {
            const prod = products.find(p => p._id === item.product);
            return { ...item, product: prod };
          }
        });
        this.carts.set(mapped as any);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onIncrementQty(cartId: string, index: number) {
    if (this.userService.getUserStatus()) {
      this.cartService.updateCartQty(cartId, { selectedQty: 1, type: 'increment' }).subscribe(() => {
        this.reloadService.needRefreshCart$();
      });
    } else {
      const items = this.cartService.getCartItemFromLocalStorage();
      if (items[index]) {
        items[index].selectedQty = (items[index].selectedQty || 0) + 1;
        localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(items));
        this.reloadService.needRefreshCart$();
      }
    }
  }

  onDecrementQty(cartId: string, index: number, currentQty: number) {
    if (currentQty <= 1) return;
    if (this.userService.getUserStatus()) {
      this.cartService.updateCartQty(cartId, { selectedQty: 1, type: 'decrement' }).subscribe(() => {
        this.reloadService.needRefreshCart$();
      });
    } else {
      const items = this.cartService.getCartItemFromLocalStorage();
      if (items[index]) {
        items[index].selectedQty = (items[index].selectedQty || 0) - 1;
        localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(items));
        this.reloadService.needRefreshCart$();
      }
    }
  }

  onRemoveItem(cart: Cart, index: number) {
    if (this.userService.getUserStatus()) {
      this.cartService.deleteCartById(cart._id!).subscribe(() => {
        this.reloadService.needRefreshCart$(false);
      });
    } else {
      if (cart.cartType === 1) {
        this.cartService.deleteComboCartItemFromLocalStorage(cart);
      } else {
        const productId = typeof cart.product === 'object' ? cart.product?._id : cart.product;
        this.cartService.deleteCartItemFromLocalStorage(productId!);
      }
      this.reloadService.needRefreshCart$();
    }
  }

  onProceedToCheckout() {
    if (this.carts().length > 0) {
      this.router.navigate(['/checkout']);
    } else {
      this.uiService.warn('আপনার কার্টটি খালি!');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
