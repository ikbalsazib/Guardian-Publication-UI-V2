import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ShopInformation } from '../../interfaces/common/shop-information.interface';
import { environment } from '../../../environments/environment';

const API_SHOP_INFO = environment.apiBaseLink + '/api/shop-information/';

@Injectable({
  providedIn: 'root'
})
export class ShopInformationService {
  private shopInfoCache$?: Observable<{ data: ShopInformation; message: string; success: boolean }>;

  constructor(
    private httpClient: HttpClient
  ) {
  }

  getShopInformation(select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: ShopInformation, message: string, success: boolean }>(API_SHOP_INFO + 'get', { params });
  }

  getShopInformationCached(select?: string) {
    if (!this.shopInfoCache$) {
      this.shopInfoCache$ = this.getShopInformation(select).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }

    return this.shopInfoCache$;
  }
}
