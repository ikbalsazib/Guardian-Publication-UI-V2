import { Component, input, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from "../../../services/common/product.service";

import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { CommonModule } from '@angular/common';
import { EngBnNumPipe } from '../../../shared/pipes/eng-bn-num.pipe';
import { PricePipe } from '../../../shared/pipes/price.pipe';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { Subscription } from 'rxjs';
import { DATABASE_KEY } from '../../../core/utils/global-variable';
import { Cart } from '../../../interfaces/common/cart.interface';
import { Product } from '../../../interfaces/common/product';
import { WishList } from '../../../interfaces/common/wish-list.interface';
import { CartService } from '../../../services/common/cart.service';
import { UserService } from '../../../services/common/user.service';
import { WishListService } from '../../../services/common/wish-list.service';
import { ReloadService } from '../../../services/core/reload.service';
import { GtmService } from '../../../services/core/gtm.service';
import { UiService } from '../../../services/core/ui.service';
import { SocialShareComponent } from '../../../shared/dialog-view/ui/social-share/social-share.component';
import { BookPreviewReaderComponent } from '../../../shared/components/book-preview-reader/book-preview-reader.component';

@Component({
  selector: 'app-product-details-area',
  templateUrl: './product-details-area.component.html',
  styleUrls: ['./product-details-area.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    PricePipe,
    SafeUrlPipe,
    MatDialogModule,
    EngBnNumPipe
  ]
})
export class ProductDetailsAreaComponent implements OnInit, OnDestroy {
  // Inputs
  product = input.required<Product>();
  ratingCalculation = input<any>();
  relatedProducts = input<Product[]>([]);

  // Signals for state
  carts = signal<Cart[]>([]);
  wishlists = signal<WishList[]>([]);
  bookPreviewOpen = signal(false);

  localQuantity = signal<number>(1);

  hasPreview = computed(() => {
    const product = this.product();
    return (product.previewImages?.length ?? 0) > 0 || !!product.pdfUrl || !!product.pdfFile;
  });

  // Computed signals
  cart = computed(() => this.carts().find(f => (f.product as any)?._id === this.product()?._id));
  wishlist = computed(() => this.wishlists().find(f => (f.product as any)?._id === this.product()?._id));
  displayTitle = computed(() => {
    const p = this.product();
    const isEn = this.translateService.currentLang === 'en';
    return isEn ? (p.nameEn || p.name) : p.name;
  });
  displayVersion = computed(() => {
    const p = this.product();
    const isEn = this.translateService.currentLang === 'en';
    return isEn ? (p.currentVersionEn || p.currentVersion) : p.currentVersion;
  });
  displayTagline = computed(() => {
    const p = this.product();
    const isEn = this.translateService.currentLang === 'en';
    return isEn ? (p.taglineEn || p.tagline) : p.tagline;
  });

  // Dependencies
  private reloadService = inject(ReloadService);
  private cartService = inject(CartService);
  private wishListService = inject(WishListService);
  private userService = inject(UserService);
  private readonly uiService = inject(UiService);
  private readonly gtmService = inject(GtmService);
  public translateService = inject(TranslateService);
  private productService = inject(ProductService);
  private matDialog = inject(MatDialog);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor() {
    // Effect to sync cart state whenever input product or global carts change
    effect(() => {
      // Logic handled by computed signals now
    });
  }

  ngOnInit(): void {
    // Cart sync
    const subCart = this.cartService.refreshStoredCart$.subscribe(() => {
      this.carts.set(this.cartService.cartItems);
    });
    this.carts.set(this.cartService.cartItems);

    // Wishlist sync
    if (this.userService.getUserStatus()) {
      const subWish = this.reloadService.refreshWishList$.subscribe(() => {
        this.fetchWishlist();
      });
      this.subscriptions.push(subWish);
      this.fetchWishlist();
    }

    this.subscriptions.push(subCart);
  }

  private fetchWishlist() {
    const subW = this.wishListService.getWishListByUser().subscribe({
      next: (res) => this.wishlists.set(res.data),
      error: (err) => console.log(err)
    });
    this.subscriptions.push(subW);
  }

  updateLocalQuantity(val: number) {
    const newQty = this.localQuantity() + val;
    if (newQty >= 1 && newQty <= 6) {
      this.localQuantity.set(newQty);
    }
  }

  onAddToCart(event: MouseEvent) {
    event.stopPropagation();
    const data: Cart = {
      product: this.product()._id,
      selectedQty: this.localQuantity(),
    };
    if (this.userService.getUserStatus()) {
      this.addToCartDB(data);
    } else {
      this.cartService.addCartItemToLocalStorage(data);
      this.reloadService.needRefreshCart$(true);
    }

    // Analytics
    this.trackAddToCart();
  }

  onAddToCartAndRedirect(event: MouseEvent) {
    event.stopPropagation();
    const currentCart = this.cart();
    if (this.userService.getUserStatus()) {
      if (currentCart) {
        this.onIncrementQty(undefined, '/checkout');
      } else {
        this.addToCartDB({ product: this.product()._id, selectedQty: this.localQuantity() }, '/checkout');
      }
    } else {
      this.cartService.addCartItemToLocalStorage({ product: this.product()._id, selectedQty: this.localQuantity() });
      this.reloadService.needRefreshCart$(false);
      this.router.navigate(['/checkout']);
    }

    // Analytics
    if (!currentCart) {
      this.trackAddToCart();
    }
  }

  private trackAddToCart() {
    const prod = this.product();
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
    event.stopPropagation();
    const currentWish = this.wishlist();
    if (currentWish) {
      this.removeWishlistById(currentWish._id!);
    } else {
      if (this.userService.getUserStatus()) {
        this.addToWishListDB({ product: this.product()._id, selectedQty: 1 });
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  private addToCartDB(data: Cart, redirectUrl?: string) {
    const subAdd = this.cartService.addToCart(data).subscribe({
      next: (res) => {
        this.uiService.success(res.message);
        this.reloadService.needRefreshCart$(redirectUrl ? false : true);
        if (redirectUrl) this.router.navigate([redirectUrl]);
      },
      error: (err) => console.log(err)
    });
    this.subscriptions.push(subAdd);
  }

  private addToWishListDB(data: WishList) {
    const subAddW = this.wishListService.addToWishList(data).subscribe({
      next: (res) => {
        this.uiService.success(res.message);
        this.reloadService.needRefreshWishList$();
      },
      error: (err) => console.log(err)
    });
    this.subscriptions.push(subAddW);
  }

  private removeWishlistById(id: string) {
    const subRem = this.wishListService.deleteWishListById(id).subscribe({
      next: (res) => {
        this.uiService.success(res.message);
        this.reloadService.needRefreshWishList$();
      },
      error: (err) => console.log(err)
    });
    this.subscriptions.push(subRem);
  }

  onIncrementQty(event?: MouseEvent, redirectUrl?: string) {
    event?.stopPropagation();
    const currentCart = this.cart();
    if (!currentCart) return;

    if (currentCart.selectedQty === 6) {
      this.uiService.warn('Maximum quantity is 6');
      return;
    }

    if (this.userService.getUserStatus()) {
      const subUpd = this.cartService.updateCartQty(currentCart._id!, { selectedQty: 1, type: 'increment' }).subscribe({
        next: () => {
          this.reloadService.needRefreshCart$(redirectUrl ? false : true);
          if (redirectUrl) this.router.navigate([redirectUrl]);
        },
        error: (err) => console.log(err)
      });
      this.subscriptions.push(subUpd);
    } else {
      const localCarts = this.cartService.getCartItemFromLocalStorage();
      const idx = localCarts.findIndex(f => f.product === this.product()._id);
      if (idx !== -1) {
        localCarts[idx].selectedQty!++;
        localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(localCarts));
        this.reloadService.needRefreshCart$(redirectUrl ? false : true);
        if (redirectUrl) this.router.navigate([redirectUrl]);
      }
    }
  }

  onDecrementQty(event: MouseEvent) {
    event.stopPropagation();
    const currentCart = this.cart();
    if (!currentCart || currentCart.selectedQty === 1) {
      this.uiService.warn('Minimum quantity is 1');
      return;
    }

    if (this.userService.getUserStatus()) {
      const subUpd = this.cartService.updateCartQty(currentCart._id!, { selectedQty: 1, type: 'decrement' }).subscribe({
        next: () => this.reloadService.needRefreshCart$(true),
        error: (err) => console.log(err)
      });
      this.subscriptions.push(subUpd);
    } else {
      const localCarts = this.cartService.getCartItemFromLocalStorage();
      const idx = localCarts.findIndex(f => f.product === this.product()._id);
      if (idx !== -1) {
        localCarts[idx].selectedQty!--;
        localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(localCarts));
        this.reloadService.needRefreshCart$(true);
      }
    }
  }

  onDialogOpen() {
    this.matDialog.open(SocialShareComponent, {
      data: this.product(),
      maxWidth: "500px",
      width: "100%",
      panelClass: ['dialog', 'social-dialog']
    });
  }

  openBookPreview() {
    if (!this.hasPreview()) {
      return;
    }

    const dialogRef = this.matDialog.open(BookPreviewReaderComponent, {
      data: { product: this.product() },
      maxWidth: '100vw',
      width: '100vw',
      height: '100vh',
      maxHeight: '100vh',
      panelClass: ['book-preview-dialog'],
      backdropClass: 'book-preview-backdrop',
      autoFocus: false,
    });

    this.bookPreviewOpen.set(true);
    dialogRef.afterClosed().subscribe(() => {
      this.bookPreviewOpen.set(false);
    });
  }

  addToCompareList(event: MouseEvent) {
    event.stopPropagation();
    this.productService.addToCompare(this.product()._id!, this.product().category?._id!);
    this.reloadService.needRefreshCompareList$();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
