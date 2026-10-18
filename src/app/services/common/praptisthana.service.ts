import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { Praptisthana } from '../../interfaces/common/praptisthana.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { Observable } from 'rxjs';

const API_NEW_EXPENSE = environment.apiBaseLink + '/api/praptisthana/';

@Injectable({
  providedIn: 'root',
})
export class PraptisthanaService {
  constructor(private httpClient: HttpClient) { }

  /**
   * addPraptisthana
   * insertManyPraptisthana
   * getAllPraptisthanas
   * getPraptisthanaById
   * updatePraptisthanaById
   * updateMultiplePraptisthanaById
   * deletePraptisthanaById
   * deleteMultiplePraptisthanaById
   */

  addPraptisthana(data: Praptisthana): Observable<ResponsePayload> {
    return this.httpClient.post<ResponsePayload>(API_NEW_EXPENSE + 'add', data);
  }

  getAllPraptisthana(filterData: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{
      data: Praptisthana[];
      count: number;
      success: boolean;
    }>(API_NEW_EXPENSE + 'get-all/', filterData, { params });
  }

  getPraptisthanaById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Praptisthana;
      message: string;
      success: boolean;
    }>(API_NEW_EXPENSE + id, { params });
  }

  updatePraptisthanaById(id: string, data: Praptisthana) {
    return this.httpClient.put<{ message: string; success: boolean }>(
      API_NEW_EXPENSE + 'update/' + id,
      data
    );
  }

  // deletePraptisthanaById(id: string) {
  //   return this.httpClient.delete<ResponsePayload>(API_NEW_EXPENSE + 'delete/' + id);
  // }

  deletePraptisthanaById(id: string, checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.delete<ResponsePayload>(
      API_NEW_EXPENSE + 'delete/' + id,
      { params }
    );
  }

  deleteMultiplePraptisthanaById(ids: string[], checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.post<ResponsePayload>(
      API_NEW_EXPENSE + 'delete-multiple',
      { ids: ids },
      { params }
    );
  }

  //  praptisthanaGroupByField<T>(dataArray: T[], field: string): PraptisthanaGroup[] {
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
  //   return final as PraptisthanaGroup[];

  // }
}
