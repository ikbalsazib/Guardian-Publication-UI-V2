import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {SeoPage} from '../../interfaces/common/seo-page.interface';
import {SEO_PAGE_TYPES} from '../../core/utils/app-data';
import {Observable} from 'rxjs';

const API_BASE = environment.apiBaseLink + '/api/seoPage/';


@Injectable({
  providedIn: 'root'
})
export class SeoPageService {

  private seoPageData: SeoPage[] = [];

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * getSeoPageByPage()
   * getSeoPageByPageWithCache()
   */
  getSeoPageByPage(pageName: SEO_PAGE_TYPES, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: SeoPage, message: string, success: boolean }>(API_BASE + 'get-by/' + pageName, {params});
  }

  getSeoPageByPageWithCache(pageName: SEO_PAGE_TYPES, select?: string): Observable<SeoPage | null> {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }

    return new Observable<SeoPage | null>((observer) => {
      const fData = this.seoPageData.find(f => f.pageName === pageName);
      if (fData) {
        observer.next(fData);
        observer.complete();
      } else {
        this.httpClient.get<{ data: SeoPage, message: string, success: boolean }>(API_BASE + 'get-by/' + pageName, {params})
          .subscribe({
            next: res => {
              if (res && res.success && res.data) {
                const existingData = this.seoPageData.find(f => f.pageName === pageName);
                if (!existingData) {
                  this.seoPageData.push(res.data);
                }
                observer.next(res.data);
                observer.complete();
              } else {
                // If no data but response is successful, return null instead of error
                // This allows the resolver to handle it gracefully
                console.warn('SeoPageService: No data received for page:', pageName);
                observer.next(null);
                observer.complete();
              }
            },
            error: err => {
              console.error('SeoPageService: Error fetching SEO page data', err);
              // Return null instead of error to allow graceful fallback
              observer.next(null);
              observer.complete();
            }
          })
      }
    })
  }

}
