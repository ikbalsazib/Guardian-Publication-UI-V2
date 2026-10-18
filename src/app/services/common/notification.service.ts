import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { FilterData } from "../../interfaces/gallery/filter-data";
import { Subject } from "rxjs";


const API_BRAND = environment.apiBaseLink + '/api/notification/';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _notifications: Subject<string[]> = new Subject<string[]>();
  notifications$ = this._notifications.asObservable();
  constructor(
    private httpClient: HttpClient
  ) {
  }

  showNotification(message: string) {
    this._notifications.next([message]);
  }

  showNotifications(messages: string[]) {
    this._notifications.next(messages);
  }

  /**
   * addNotification
   * insertManyNotification
   * getAllNotifications
   * getNotificationById
   * updateNotificationById
   * updateMultipleNotificationById
   * deleteNotificationById
   * deleteMultipleNotificationById
   */

  addNotification(data: Notification) {
    return this.httpClient.post<ResponsePayload>
      (API_BRAND + 'add', data);
  }


  getAllNotifications(filterData: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Notification[], count: number, success: boolean }>(API_BRAND + 'get-all', filterData, { params });
  }

  getNotificationById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: Notification, message: string, success: boolean }>(API_BRAND + id, { params });
  }

  updateNotificationById(id: string, data: any) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_BRAND + 'update/' + id, data);
  }

  updateMultipleNotificationById(ids: string[], data: Notification) {
    const mData = { ...{ ids: ids }, ...data }
    return this.httpClient.put<ResponsePayload>(API_BRAND + 'update-multiple', mData);
  }

  deleteNotificationById(id: string, checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.delete<ResponsePayload>(API_BRAND + 'delete/' + id, { params });
  }

  deleteMultipleNotificationById(ids: string[], checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.post<ResponsePayload>(API_BRAND + 'delete-multiple', { ids: ids }, { params });
  }


}
