import { Component, OnDestroy, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PromoOffer } from '../../interfaces/common/promo-offer.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { PromoOfferService } from '../../services/common/promo-offer.service';
import { SeoPageService } from '../../services/common/seo-page.service';
import { SeoPage } from '../../interfaces/common/seo-page.interface';
import { ProductCardOneComponent } from '../../shared/components/product-card-one/product-card-one.component';
import { TimeCounterOneComponent } from '../../shared/components/time-counter-one/time-counter-one.component';
import { SpecialPackageComponent } from '../home/special-package/special-package.component';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { CardOneLoaderComponent } from '../../shared/skeleton-loader/card-one-loader/card-one-loader.component';
import { SeoService } from '../../services/core/seo.service';


@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ProductCardOneComponent,
    TimeCounterOneComponent,
    SpecialPackageComponent,
    SafeHtmlPipe,
    CardOneLoaderComponent
  ]
})
export class OffersComponent implements OnInit, OnDestroy {
  // Signals
  promoOffers = signal<PromoOffer[]>([]);
  isLoadingPromoOffer = signal<boolean>(false);
  seoPage = signal<SeoPage | null>(null);

  // Dependencies
  private offerService = inject(PromoOfferService);
  private platformId = inject(PLATFORM_ID);
  private seoPageService = inject(SeoPageService);
  private seoService = inject(SeoService);
  private router = inject(Router);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.getSeoPageByPageWithCache();
    this.fetchOffers();
  }

  private fetchOffers() {
    const filter: FilterData = {
      filter: null,
      select: {
        title: 1,
        slug: 1,
        status: 1,
        description: 1,
        bannerImage: 1,
        startDateTime: 1,
        endDateTime: 1,
        products: 1,
        productDetails: 1,
        readOnly: 1,
        createdAt: 1,
      },
      sort: { serial: -1 },
      pagination: null
    };

    this.isLoadingPromoOffer.set(true);
    const sub = this.offerService.getAllPromoOffers(filter, null).subscribe({
      next: (res) => {
        if (res.success) {
          this.promoOffers.set(res.data || []);
          this.updateCollectionSchema();
        }
        this.isLoadingPromoOffer.set(false);
      },
      error: (err) => {
        console.error('Error fetching offers:', err);
        this.isLoadingPromoOffer.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  private getSeoPageByPageWithCache() {
    const select = 'name image seoDescription keyWord pageName';
    const sub = this.seoPageService.getSeoPageByPageWithCache('offers', select)
      .subscribe({
        next: res => {
          this.seoPage.set(res);
          if (res) {
            this.updateMetaData();
          }
        },
        error: err => {
          console.log(err);
        }
      });
    this.subscriptions.push(sub);
  }

  private updateMetaData() {
    const page = this.seoPage();
    if (!page) return;

    this.seoService.updateMetaData({
      title: page.name,
      description: page.seoDescription,
      keywords: page.keyWord,
      image: page.image,
      canonicalPath: '/offers',
    });

    this.updateCollectionSchema();
  }

  private updateCollectionSchema() {
    const productUrls = new Set<string>();

    this.promoOffers().forEach((offer) => {
      (offer.productDetails || []).forEach((product: any) => {
        if (product?.slug) {
          productUrls.add(`/product-details/${product.slug}`);
        }
      });
    });

    const items = Array.from(productUrls).map((url) => ({ url }));
    const page = this.seoPage();

    this.seoService.setCollectionSchema(
      '/offers',
      page?.name || 'Offers',
      items,
      [{ label: page?.name || 'Offers', isCurrent: true }]
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
