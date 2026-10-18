import { Component, OnDestroy, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Cart } from '../../../../interfaces/common/cart.interface';
import { CartService } from '../../../../services/common/cart.service';
import { ProductService } from '../../../../services/common/product.service';
import { ReloadService } from '../../../../services/core/reload.service';
import {forkJoin, Subscription} from 'rxjs';
import { DATABASE_KEY } from '../../../../core/utils/global-variable';
import { Product } from '../../../../interfaces/common/product';
import { UserDataService } from '../../../../services/common/user-data.service';
import { UserService } from '../../../../services/common/user.service';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { EngBnNumPipe } from '../../../../shared/pipes/eng-bn-num.pipe';
import {SpecialPackagesService} from "../../../../services/common/special-packages.service";

@Component({
  selector: 'app-cart-slide',
  templateUrl: './cart-slide.component.html',
  styleUrls: ['./cart-slide.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    PricePipe,
    EngBnNumPipe
  ],
  providers: [PricePipe, EngBnNumPipe],
})
export class CartSlideComponent implements OnInit, OnDestroy {
  // Signals
  cartSlide = signal<boolean>(false);
  carts = signal<Cart[]>([]);

  // Computed
  cartTotalQty = computed(() =>
    this.carts().reduce((sum, item) => sum + (item.selectedQty || 0), 0)
  );

  cartSubTotal = computed(() => {
    return this.carts().reduce((acc, t) => {
      const prod = this.getProductFromCart(t);
      if (!prod) return acc;
      return acc + (this.pricePipe.transform(prod, 'salePrice', t.selectedQty) as number);
    }, 0);
  });

  // Dependencies using inject()
  private readonly productService = inject(ProductService);
  public readonly userService = inject(UserService);
  public readonly userDataService = inject(UserDataService);
  private readonly cartService = inject(CartService);
  private readonly comboPackageService = inject(SpecialPackagesService);
  private readonly reloadService = inject(ReloadService);
  private readonly pricePipe = inject(PricePipe);

  // Subscriptions
  private subReloadCart: Subscription | null = null;
  private subDataOne: Subscription | null = null;
  private subUpdateCartData: Subscription | null = null;
  private subDeleteCartData: Subscription | null = null;

  ngOnInit(): void {
    const subReload = this.reloadService.refreshCart$.subscribe((res) => {
      this.getCartsItems(res);
    });
    this.subReloadCart = subReload;
    this.getCartsItems();
  }

  /**
   * Helper to get Product safely
   */
  getProductFromCart(cart: Cart): Product | null {
    if (!cart?.product) return null;
    return typeof cart.product === 'string' ? null : cart.product;
  }

  getProductIdFromCart(cart: Cart): string | undefined {
    if (!cart?.product) return undefined;
    return typeof cart.product === 'string' ? cart.product : cart.product._id;
  }

  /**
   * HTTP REQ HANDLE
   */
  private getCartsItems(refresh?: boolean) {
    if (this.userService.getUserStatus()) {
      const sub = this.cartService.getCartByUser().subscribe({
        next: (res: any) => {
          this.carts.set(res.data);
          this.cartService.updateCartList(this.carts());
        }
      });
      this.subDataOne = sub;
    } else {
      this.getCarsItemFromLocal(refresh);
    }
  }

  private updateCartQty(cartId: string, data: any) {
    const sub = this.cartService.updateCartQty(cartId, data).subscribe({
      next: () => {
        this.reloadService.needRefreshCart$();
      },
      error: (error: any) => {
        console.log(error);
      }
    });
    this.subUpdateCartData = sub;
  }

  deleteCartById(cartId: string) {
    const sub = this.cartService.deleteCartById(cartId).subscribe({
      next: () => {
        this.reloadService.needRefreshCart$(true);
      },
      error: (error: any) => {
        console.log(error);
      }
    });
    this.subDeleteCartData = sub;
  }

  private getCarsItemFromLocal(refresh?: boolean) {
    const items = (this.cartService.getCartItemFromLocalStorage() as any[]) || [];

    if (items && items.length > 0) {
      const productIds: string[] = items
        .filter((item) => !item.cartType || item.cartType === 2)
        .map((m) => m.product as string);

      const packageIds: string[] = items
        .filter((item) => item.cartType === 1)
        .map((m) => m.specialPackage as string);

      const productSelect =
        'name salePrice sku discountType discountAmount images quantity category subCategory brand tags';

      const productFetch = this.productService.getProductByIds(productIds, productSelect);
      const packageFetch = this.comboPackageService.getProductByIds(packageIds);

      forkJoin([productFetch, packageFetch]).subscribe({
        next: (response: any[]) => {
          const productRes = response[0];
          const packageRes = response[1];
          
          const products = productRes.data || [];
          const specialPackages = packageRes.data || [];

          const mappedCarts = items.map((item) => {
            if (item.cartType === 1) {
              const packageData: any = specialPackages.find((pkg: any) => pkg._id === item.specialPackage);
              return {
                ...item,
                product: { ...packageData, ...{ images: [packageData.image] } } as Product
              };
            } else {
              const productData = products.find((prod: any) => prod._id === item.product);
              return {
                ...item,
                product: productData as Product,
              };
            }
          });

          this.carts.set(mappedCarts);
          this.cartService.updateCartList(this.carts());
        }
      });
    } else {
      this.carts.set([]);
      this.cartService.updateCartList(this.carts());
    }
  }

  onIncrementQty(cartId: string | undefined, index: number) {
    const currentQty = this.carts()[index]?.selectedQty || 0;
    if (currentQty >= 6) {
      return;
    }

    if (this.userService.getUserStatus()) {
      if (!cartId) return;
      this.updateCartQty(cartId, { selectedQty: 1, type: 'increment' });
    } else {
      this.updateGuestCartQty(index, 1);
    }
  }

  onDecrementQty(cartId: string | undefined, index: number, sQty: number | undefined) {
    if (sQty === undefined || sQty <= 1) return;

    if (this.userService.getUserStatus()) {
      if (!cartId) return;
      this.updateCartQty(cartId, { selectedQty: 1, type: 'decrement' });
    } else {
      this.updateGuestCartQty(index, -1);
    }
  }

  private updateGuestCartQty(index: number, delta: number) {
    const data = this.cartService.getCartItemFromLocalStorage() as any[];
    if (!data?.[index]) {
      return;
    }

    const newQty = (data[index].selectedQty || 0) + delta;
    if (newQty < 1) {
      return;
    }

    data[index].selectedQty = newQty;
    localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(data));

    this.carts.update((carts) => {
      const next = [...carts];
      if (next[index]) {
        next[index] = { ...next[index], selectedQty: newQty };
      }
      return next;
    });
    this.cartService.updateCartList(this.carts());
    this.reloadService.needRefreshCart$();
  }

  onDeleteCartItem(cartData: Cart, cartId: string | undefined, productId?: string) {
    if (this.userService.getUserStatus()) {
      if (cartId) this.deleteCartById(cartId);
    } else {
      if (cartData.cartType) {
        this.cartService.deleteComboCartItemFromLocalStorage(cartData);
        this.reloadService.needRefreshCart$();
      } else {
        if (productId) {
          this.cartService.deleteCartItemFromLocalStorage(productId);
          this.reloadService.needRefreshCart$();
        }
      }
    }
  }

  cartSlideShowHide() {
    this.cartSlide.update(val => !val);
  }

  ngOnDestroy(): void {
    this.subDataOne?.unsubscribe();
    this.subDeleteCartData?.unsubscribe();
    this.subUpdateCartData?.unsubscribe();
    this.subReloadCart?.unsubscribe();
  }
}
