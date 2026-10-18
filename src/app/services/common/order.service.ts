import { Injectable } from '@angular/core';
import { Order } from '../../interfaces/common/order.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ResponsePayload } from 'src/app/interfaces/core/response-payload.interface';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
import { environment } from 'src/environments/environment';
const API_ORDER = environment.apiBaseLink + '/api/order/';
@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * addOrder
   * getOrdersByUser
   * getOrderById
   * updateOrderById
   * updateOrderSessionKey
   */

  addOrder(data: Order, isUserAuth: boolean) {
    return this.httpClient.post<ResponsePayload>(API_ORDER + (isUserAuth ? 'add-order-by-user' : 'add-order-by-anonymous'), data);
  }

  getOrdersByUser(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Order[], count: number, success: boolean }>(API_ORDER + 'get-orders-by-user', filterData, { params });
  }


  getOrderById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: Order, message: string, success: boolean }>(API_ORDER + id, { params });
  }

  getOrderByOrderId(orderId: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: Order, message: string, success: boolean }>(API_ORDER + 'get-by-order-id/' + orderId, { params });
  }

  updateOrderById(id: string, data: Order) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_ORDER + 'update/' + id, data);
  }


  updateOrderSessionKey(id: string, data: any) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_ORDER + 'update-order-session-key/' + id, data);
  }

}
