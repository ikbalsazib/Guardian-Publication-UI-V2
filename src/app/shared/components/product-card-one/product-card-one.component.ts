import { CommonModule } from '@angular/common';
import { Component, input, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Product } from '../../../interfaces/common/product';
import { CartService } from '../../../services/common/cart.service';
import { ReloadService } from '../../../services/core/reload.service';
import { GtmService } from '../../../services/core/gtm.service';
import { Cart } from '../../../interfaces/common/cart.interface';
import { WishList } from '../../../interfaces/common/wish-list.interface';
import { WishListService } from '../../../services/common/wish-list.service';
import { UiService } from '../../../services/core/ui.service';
import { UserService } from '../../../services/common/user.service';
import { ProductService } from "../../../services/common/product.service";
import { PricePipe } from '../../pipes/price.pipe';
import { DATABASE_KEY } from '../../../core/utils/global-variable';

@Component({
  selector: 'app-product-card-one',
  templateUrl: './product-card-one.component.html',
  styleUrls: ['./product-card-one.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    PricePipe,
    MatIconModule,
    MatButtonModule
  ],
  providers: [PricePipe]
})
export class ProductCardOneComponent implements OnInit, OnDestroy {
  // Inputs as Signals
  data = input<Product>();
  isNew = input<boolean>(false);

  // Signals for dynamic state
  cart = signal<Cart | null>(null);
  wishlist = signal<WishList | null>(null);
  productId = signal<string | null>(null);

  // Computed state
  isProductInWishlist = computed(() => !!this.wishlist());

  // Dependencies
  private readonly cartService = inject(CartService);
  private readonly reloadService = inject(ReloadService);
  private readonly wishListService = inject(WishListService);
  private readonly userService = inject(UserService);
  private readonly gtmService = inject(GtmService);
  public readonly translateService = inject(TranslateService);
  private readonly productService = inject(ProductService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subRoute = this.activatedRoute.queryParamMap.subscribe(() => {
      // Sync logic
    });
    this.subscriptions.push(subRoute);

    const subCart = this.cartService.refreshStoredCart$.subscribe(() => {
      this.syncCartStatus();
    });
    this.subscriptions.push(subCart);

    this.syncCartStatus();

    if (this.userService.getUserStatus()) {
      const subWish = this.reloadService.refreshWishList$.subscribe(() => {
        this.getWishListByUser();
      });
      this.subscriptions.push(subWish);
      this.getWishListByUser();
    }

    const subCompare = this.reloadService.refreshCompareList$.subscribe(() => {
      this.getCompareList();
    });
    this.subscriptions.push(subCompare);
  }

  getRatingPercent(data: any): number {
    if (!data?.ratingTotal || data?.ratingTotal === 0) return 0;
    return (data?.ratingCount || 0) / data.ratingTotal;
  }

  getCompareList() {
    this.productService.getCompareList();
  }

  onAddToCart(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const prodId = this.data()?._id;
    if (!prodId) return;

    const data: Cart = {
      product: prodId,
      selectedQty: 1,
    };

    if (this.userService.getUserStatus()) {
      this.addToCartDB(data);
    } else {
      this.cartService.addCartItemToLocalStorage(data);
      this.reloadService.needRefreshCart$(true);
      this.uiService.success('কার্টে যোগ করা হয়েছে।');
    }
    
    // Analytics
    this.trackAddToCart();
  }

  private trackAddToCart() {
    const prod = this.data();
    if (!prod) return;
    const price = prod.salePrice || 0;
    
    const payload = {
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      eventId: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      action_source: 'website',
      event_source_url: typeof window !== 'undefined' ? window.location.href : '',
      contentId: prod._id,
      contentName: prod.nameEn || prod.name,
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

    if (this.gtmService.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
      this.gtmService.trackByFacebookPixel('AddToCart', {
        content_name: prod.nameEn || prod.name,
        content_type: 'product',
        content_ids: [prod._id],
        value: price,
        currency: 'BDT'
      }, payload.eventId);
    }
    
    // Client-side Tiktok pixel
    this.gtmService.trackByTiktokPixel('AddToCart', {
      content_id: prod._id,
      content_type: 'product',
      content_name: prod.nameEn || prod.name,
      value: price,
      currency: 'BDT',
      quantity: 1
    }, payload.eventId);

    this.gtmService.trackAddToCart(payload as any).subscribe();
  }

  onAddToWishList(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const currentWishlist = this.wishlist();
    if (currentWishlist) {
      if (currentWishlist._id) {
        this.removeWishlistById(currentWishlist._id);
      }
    } else {
      const prodId = this.data()?._id;
      if (!prodId) return;

      const data: WishList = {
        product: prodId,
        selectedQty: 1,
      };

      if (this.userService.getUserStatus()) {
        this.addToWishListDB(data);
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  private addToCartDB(data: Cart) {
    const sub = this.cartService.addToCart(data).subscribe({
      next: (res) => {
        this.uiService.success(res?.message || 'কার্টে যোগ করা হয়েছে।');
        this.reloadService.needRefreshCart$(true);
      },
      error: (err) => console.log(err)
    });
    this.subscriptions.push(sub);
  }

  private getWishListByUser() {
    const sub = this.wishListService.getWishListByUser().subscribe({
      next: (res) => {
        const wishlists = (res.data || []) as WishList[];
        const prodId = this.data()?._id;
        const found = wishlists.find(f => {
          const prod = f.product;
          const fProdId = typeof prod === 'string' ? prod : (prod as any)?._id || prod;
          return fProdId === prodId;
        });
        this.wishlist.set(found || null);
      },
      error: (err) => console.log(err)
    });
    this.subscriptions.push(sub);
  }

  private addToWishListDB(data: WishList) {
    const sub = this.wishListService.addToWishList(data).subscribe({
      next: (res) => {
        this.uiService.success(res?.message || 'ইচ্ছেতালিকায় যোগ করা হয়েছে।');
        this.reloadService.needRefreshWishList$();
      },
      error: (err) => console.log(err)
    });
    this.subscriptions.push(sub);
  }

  private removeWishlistById(wishlistId: string) {
    const sub = this.wishListService.deleteWishListById(wishlistId).subscribe({
      next: (res) => {
        this.reloadService.needRefreshWishList$();
        this.uiService.success(res?.message || 'ইচ্ছেতালিকা থেকে সরানো হয়েছে।');
      },
      error: (err) => console.log(err)
    });
    this.subscriptions.push(sub);
  }

  onIncrementQty(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const currentCart = this.cart();
    if (!currentCart) return;

    if (this.userService.getUserStatus()) {
      this.cartService.updateCartQty(currentCart._id!, { selectedQty: 1, type: 'increment' }).subscribe(() => {
        this.reloadService.needRefreshCart$();
      });
    } else {
      const items = this.cartService.getCartItemFromLocalStorage();
      const index = items.findIndex(f => f.product === currentCart.product);
      if (index !== -1) {
        items[index].selectedQty = (items[index].selectedQty || 0) + 1;
        localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(items));
        this.reloadService.needRefreshCart$(true);
      }
    }
  }

  onDecrementQty(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const currentCart = this.cart();
    if (!currentCart) return;

    if ((currentCart.selectedQty || 0) <= 1) {
      this.removeCartItem(currentCart);
      return;
    }

    if (this.userService.getUserStatus()) {
      this.cartService.updateCartQty(currentCart._id!, { selectedQty: 1, type: 'decrement' }).subscribe(() => {
        this.reloadService.needRefreshCart$();
      });
    } else {
      const items = this.cartService.getCartItemFromLocalStorage();
      const index = items.findIndex(f => f.product === currentCart.product);
      if (index !== -1) {
        items[index].selectedQty = (items[index].selectedQty || 0) - 1;
        localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(items));
        this.reloadService.needRefreshCart$(true);
      }
    }
  }

  private removeCartItem(cart: Cart) {
    if (this.userService.getUserStatus()) {
      this.cartService.deleteCartById(cart._id!).subscribe(() => {
        this.reloadService.needRefreshCart$(false);
      });
    } else {
      const productId = typeof cart.product === 'object' ? cart.product?._id : cart.product;
      this.cartService.deleteCartItemFromLocalStorage(productId!);
      this.reloadService.needRefreshCart$(true);
    }
  }

  private syncCartStatus() {
    const carts = this.cartService.cartItems;
    const prodId = this.data()?._id;
    const found = carts?.find(f => {
      const prod = f.product;
      const fProdId = typeof prod === 'string' ? prod : (prod as any)?._id || prod;
      return fProdId === prodId;
    });
    this.cart.set(found || null);
  }

  addToCompareList(event: MouseEvent, product: Product) {
    event.preventDefault();
    event.stopPropagation();
    const prodId = product._id;
    this.productId.set(prodId || null);
    if (prodId && product?.category?._id) {
      this.productService.addToCompare(prodId, product.category._id);
      this.reloadService.needRefreshCompareList$();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub?.unsubscribe());
  }
}
