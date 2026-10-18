import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PromoOffer } from 'src/app/interfaces/common/promo-offer.interface';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
import { Observable } from "rxjs";
const API_PROMO_OFFER = `${environment.apiBaseLink}/api/promo-offer/`
// const API_MULTI_PROMO_OFFER = `${environment.apiBaseLink}/api/multi-promo-offer/`
@Injectable({
  providedIn: 'root'
})
export class PromoOfferService {

  constructor(
    private httpClient: HttpClient
  ) { }

  /**
   * PROMO OFFER HTTP REQUEST
   * getPromoOfferSingle()
   */

  getPromoOfferSingle(select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: PromoOffer, message: string, success: boolean }>(API_PROMO_OFFER + 'promotional-offer', { params });
  }


  getAllPromoOffers(filterData: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: PromoOffer[], count: number, success: boolean }>(API_PROMO_OFFER + 'get-all', filterData, { params });
  }

}
