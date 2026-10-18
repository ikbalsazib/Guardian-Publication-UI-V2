import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { Popup } from '../../interfaces/common/popup.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { Observable } from "rxjs";

const API_POPUP = environment.apiBaseLink + '/api/popup/';


@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * addPopup
   * insertManyPopup
   * getAllPopups
   * getPopupById
   * updatePopupById
   * updateMultiplePopupById
   * deletePopupById
   * deleteMultiplePopupById
   */

  addPopup(data: Popup): Observable<ResponsePayload> {
    return this.httpClient.post<ResponsePayload>(API_POPUP + 'add', data);
  }

  getAllPopups(filterData: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Popup[], count: number, success: boolean }>(API_POPUP + 'get-all/', filterData, { params });
  }

  getPopupById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: Popup, message: string, success: boolean }>(API_POPUP + id, { params });
  }

  updatePopupById(id: string, data: Popup) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_POPUP + 'update/' + id, data);
  }

  deletePopupById(id: string, checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.delete<ResponsePayload>(API_POPUP + 'delete/' + id, { params });
  }

  deleteMultiplePopupById(ids: string[], checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.post<ResponsePayload>(API_POPUP + 'delete-multiple', { ids: ids }, { params });
  }

  // popupGroupByField<T>(dataArray: T[], field: string): PopupGroup[] {
  //   const data = dataArray.reduce((group, product) => {
  //     const uniqueField = product[field]
  //     group[uniqueField] = group[uniqueField] ?? [];
  //     group[uniqueField].push(product);
  //     return group;
  //   }, {});
  //
  //   const final = [];
  //
  //   for (const key in data) {
  //     final.push({
  //       _id: key,
  //       data: data[key]
  //     })
  //   }
  //
  //   return final as PopupGroup[];

  // }



}
