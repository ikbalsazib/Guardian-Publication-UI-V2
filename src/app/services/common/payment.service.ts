import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import {SslInit} from '../../interfaces/common/ssl-init';

const API_PAYMENT = environment.apiBaseLink + '/api/payment/';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * SSL COMMERCE
   * initSslPayment()
   */

  initSslPayment(data: SslInit) {
    return this.httpClient.post<ResponsePayload>
    (API_PAYMENT + 'init-ssl', data);
  }


  /**
   * NAGAD
   * initSslPayment()
   * nagadVerifyPayment()
   */

  nagadCreatePayment(data: {
    amount: string,
    ip: string,
    orderId: string,
    productDetails: object,
    clientType: string
  }) {
    return this.httpClient.post<{ nagadURL: string, success: boolean }>
    (API_PAYMENT + 'nagad-create-payment', data);
  }

  nagadVerifyPayment(data: any) {
    return this.httpClient.post<ResponsePayload>
    (API_PAYMENT + 'nagad-verify-payment', data);
  }

  /**
   * Bkash
   * createBkashPayment()
   * nagadVerifyPayment()
   */

  createBkashPayment(data: any) {
    return this.httpClient.post<{ success: boolean, data: { bkashURL: string, paymentID: string } }>
    (API_PAYMENT + 'create-bkash-payment', data);
  }

  callbackBkashPayment(data: any) {
    return this.httpClient.post<{ success: boolean, data: { statusCode: string, message: string } }>
    (API_PAYMENT + 'callback-bkash-payment', data);
  }

}
