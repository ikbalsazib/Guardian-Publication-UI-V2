import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Cart } from '../../../../interfaces/common/cart.interface';
import { WishList } from '../../../../interfaces/common/wish-list.interface';
import { CartService } from '../../../../services/common/cart.service';
import { UserService } from '../../../../services/common/user.service';
import { WishListService } from '../../../../services/common/wish-list.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { UiService } from '../../../../services/core/ui.service';
import { EngBnNumPipe } from '../../../../shared/pipes/eng-bn-num.pipe';


@Component({
  selector: 'app-wish-list',
  templateUrl: './wish-list.component.html',
  styleUrls: ['./wish-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    EngBnNumPipe
  ]
})
export class WishListComponent implements OnInit, OnDestroy {
  // Signals
  wishlists = signal<WishList[]>([]);
  isLoading = signal<boolean>(false);

  // Dependencies
  private wishlistService = inject(WishListService);
  private cartService = inject(CartService);
  private uiService = inject(UiService);
  private reloadService = inject(ReloadService);
  private userService = inject(UserService);
  private router = inject(Router);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subReload = this.reloadService.refreshWishList$.subscribe(() => {
      this.fetchWishlist();
    });
    this.subscriptions.push(subReload);

    this.fetchWishlist();
  }

  private fetchWishlist() {
    if (!this.userService.getUserStatus()) {
      this.router.navigate(['/login'], { queryParams: { navigateFrom: this.router.url } });
      return;
    }

    this.isLoading.set(true);
    const sub = this.wishlistService.getWishListByUser().subscribe({
      next: (res) => {
        this.wishlists.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
    this.subscriptions.push(sub);
  }

  onRemoveItem(id: string) {
    this.wishlistService.deleteWishListById(id).subscribe(res => {
      this.uiService.success(res.message || 'Removed');
      this.fetchWishlist();
      this.reloadService.needRefreshWishList$(true);
    });
  }

  onAddToCart(item: WishList) {
    if (!item.product) return;

    const data: Cart = {
      product: (item.product as any)._id,
      selectedQty: 1
    };

    this.cartService.addToCart(data).subscribe(res => {
      this.uiService.success(res.message || 'Added to cart');
      this.reloadService.needRefreshCart$(true);
    });
  }

  onBuyNow(item: WishList) {
    this.onAddToCart(item);
    this.router.navigate(['/checkout']);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
