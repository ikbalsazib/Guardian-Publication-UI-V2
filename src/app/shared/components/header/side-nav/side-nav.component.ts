import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ShopInformation } from '../../../../interfaces/common/shop-information.interface';
import { ShopInformationService } from '../../../../services/common/shop-information.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ]
})
export class SideNavComponent implements OnInit, OnDestroy {
  // Signals
  shopInfo = signal<ShopInformation | null>(null);
  showHideSideNav: boolean = false;

  // Dependencies
  private platformId = inject(PLATFORM_ID);
  private shopInfoService = inject(ShopInformationService);
  private isBrowser: boolean;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.getShopInfo();
    }
  }

  private getShopInfo() {
    const subShop = this.shopInfoService.getShopInformationCached().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.shopInfo.set(res.data);
        }
      },
      error: (err: any) => console.log(err)
    });
    this.subscriptions.push(subShop);
  }

  /**
   This method use for side nav "show & hide".
  **/
  onshowHideSideNav() {
    this.showHideSideNav = !this.showHideSideNav;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
