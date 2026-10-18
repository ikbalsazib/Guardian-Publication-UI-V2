import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ShippingCharge} from '../../interfaces/common/shipping-charge.interface';

const API_SHOP_INFO = environment.apiBaseLink + '/api/shipping-charge/';


@Injectable({
  providedIn: 'root'
})
export class ShippingChargeService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * getShippingCharge
   */

  getShippingCharge(select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: ShippingCharge, message: string, success: boolean }>(API_SHOP_INFO + 'get', {params});
  }

}
