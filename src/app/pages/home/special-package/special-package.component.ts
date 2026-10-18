import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID, viewChild, ElementRef, effect, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SpecialPackageCardOneComponent } from '../../../shared/components/special-package-card-one/special-package-card-one.component';
import { SpecialPackageLoaderComponent } from '../../../shared/skeleton-loader/special-package-loader/special-package-loader.component';
import { SpecialPackage } from '../../../interfaces/common/special-package.interface';
import { CarouselCntrlService } from '../../../services/common/carousel-cntrl.service';
import { SpecialPackagesService } from '../../../services/common/special-packages.service';
import { Subscription } from 'rxjs';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-special-package',
  templateUrl: './special-package.component.html',
  styleUrls: ['./special-package.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpecialPackageCardOneComponent,
    SpecialPackageLoaderComponent,
    TranslateModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SpecialPackageComponent implements OnInit, OnDestroy {
  // Signals
  specialPackages = signal<SpecialPackage[]>([]);
  isLoadingSpecialPackage = signal<boolean>(false);

  // Swiper Reference
  swiperEl = viewChild<ElementRef>('swiperEl');

  // Services
  public carouselCntrl = inject(CarouselCntrlService);
  private specialPackageService = inject(SpecialPackagesService);
  private platformId = inject(PLATFORM_ID);
  public isBrowser = isPlatformBrowser(this.platformId);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor() {
    effect(() => {
      const data = this.specialPackages();
      const el = this.swiperEl();
      if (this.isBrowser && data.length > 0 && el) {
        this.initSwiper(el.nativeElement);
      }
    });
  }

  private initSwiper(el: any) {
    const swiperParams = {
      slidesPerView: 1,
      spaceBetween: 25,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      loop: false,
      navigation: true,
      breakpoints: {
        '997': { slidesPerView: 2 },
        '1200': { slidesPerView: 3 }
      },
      injectStyles: [
        `
        .swiper-button-next svg,
        .swiper-button-prev svg {
          width: 12px !important;
          height: 12px !important;
        }
        `
      ]
    };
    Object.assign(el, swiperParams);
    el.initialize();
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.getAllSpecialPackage();
    }
  }

  /**
   * HTTP REQUEST HANDLE 
   * getAllSpecialPackage()
   */
  getAllSpecialPackage() {
    const filterData: FilterData = {
      filter: null,
      sort: { createdAt: -1 },
      select: { _id: 1, name: 1, image: 1, slug: 1, freeDelivery: 1 },
    }
    this.isLoadingSpecialPackage.set(true);
    const sub = this.specialPackageService.getAllSpecialPackages(filterData).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.specialPackages.set(res.data);
        }
        this.isLoadingSpecialPackage.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoadingSpecialPackage.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  /**
   * NG ON DESTROY
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }


}
