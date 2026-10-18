import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { injectHeroPreloadLinks } from 'src/app/core/utils/image-url.util';
import { SeoPageService } from 'src/app/services/common/seo-page.service';
import { HomeDataService, HomePageData } from 'src/app/services/common/home-data.service';
import { SeoPage } from 'src/app/interfaces/common/seo-page.interface';

export interface HomeRouteData {
  seoPageData: SeoPage | null;
  homePageData: HomePageData | null;
}

@Injectable({
  providedIn: 'root'
})
export class HomeResolver implements Resolve<HomeRouteData> {
  private readonly seoPageService = inject(SeoPageService);
  private readonly homeDataService = inject(HomeDataService);
  private readonly document = inject(DOCUMENT);

  resolve(): Observable<HomeRouteData> {
    return forkJoin({
      seoPageData: this.seoPageService.getSeoPageByPageWithCache(
        'home_page',
        'name image seoDescription keyWord pageName'
      ).pipe(catchError(() => of(null))),
      homePageData: this.homeDataService.loadHomePageData().pipe(catchError(() => of(null)))
    }).pipe(
      timeout(8000),
      tap((data) => {
        const firstCarousel = data.homePageData?.carousels?.[0];
        if (firstCarousel) {
          injectHeroPreloadLinks(this.document, firstCarousel.image, firstCarousel.mobileImage);
        }
      }),
      catchError(() => of({ seoPageData: null, homePageData: null }))
    );
  }
}
