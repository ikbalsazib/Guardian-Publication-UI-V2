import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {OrderOffer} from "../../interfaces/common/order-offer.interface";
import {Observable} from 'rxjs';


const API_SHOP_INFO = environment.apiBaseLink + '/api/order-offer/';


@Injectable({
  providedIn: 'root'
})
export class OrderOfferService {

  private orderOfferRes: any = null;
  private orderOfferByUserRes: any = null;

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * getOrderOffer()
   * getOrderOfferWithUser()
   */




  getOrderOffer(select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }

    return new Observable<{data: OrderOffer; message: string; success: boolean}>(observer => {
      if (this.orderOfferRes) {
        observer.next(this.orderOfferRes);
        observer.complete();
      } else {
        this.httpClient.get<{
          data: OrderOffer,
          message: string,
          success: boolean
        }>(API_SHOP_INFO + 'get', {params})
          .subscribe({
            next: res => {
              this.orderOfferRes = res;
              observer.next(this.orderOfferRes);
              observer.complete();
            },
            error: err => {
              console.log(err);
            }
          })
      }
    })
  }

  getOrderOfferWithUser(select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }

    return new Observable<{data: OrderOffer; message: string; success: boolean}>(observer => {
      if (this.orderOfferByUserRes) {
        observer.next(this.orderOfferByUserRes);
        observer.complete();
      } else {
        this.httpClient.get<{
          data: OrderOffer,
          message: string,
          success: boolean
        }>(API_SHOP_INFO + 'get-by-user', {params})
          .subscribe({
            next: res => {
              this.orderOfferByUserRes = res;
              observer.next(this.orderOfferByUserRes);
              observer.complete();
            },
            error: err => {
              console.log(err);
            }
          })
      }
    })
  }

}
